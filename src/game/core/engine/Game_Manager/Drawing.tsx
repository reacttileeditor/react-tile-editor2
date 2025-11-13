import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, find, findIndex, isEmpty, isEqual, isNil, isNumber, last, map, reduce, size, toArray, uniq } from "lodash";
import { includes } from "ramda"

import { constrain_point_within_rect, dice_anchored_on_specific_random_seed, ƒ } from "../Utils";

import { Canvas_View, Mouse_Button_State } from "../../gui/Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../Blit_Manager";
import { Tile_Palette_Element } from "../../gui/Tile_Palette_Element";
import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ, Tilemap_Single } from "../Tilemap_Manager/Tilemap_Manager";
import { Pathfinder_ƒ } from "../Pathfinding";

import { Creature_ƒ, New_Creature, Creature_Data, Path_Node_With_Direction, Change_Instance, Creature_Type_Name } from "../../../objects_core/Creature/Creature";

import { Gamespace_Pixel_Point, Point2D, Rectangle } from '../../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { zorder } from "../../constants/zorder";
import { Vals } from "../../constants/Constants";
import { Game_Manager_Data, Game_Manager_ƒ } from "./Game_Manager";
import { Palette_Names } from "../../data/Palette_List";
import Prando from "prando";
import { cubic, elastic, sinusoidal } from "@juliendargelos/easings";

export const Game_Manager_ƒ_Drawing = {
	deterministic_random_time_offset_for_creature: (creature: Creature_Data): number => {
		/*
			Basically this should always return the same number for a particular tile.  The number should seem wildly random, but be fixed on a per-tile basis.

			This seeds an RNG with the passed-in tile value, and then uses it just once to get a random value.
		*/

		const RNG = new Prando(creature.unique_id);

		return dice_anchored_on_specific_random_seed(10000000, RNG);
	},


	do_one_frame_of_rendering: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): void => {
		if(me.animation_state.is_animating_live_game){
			Game_Manager_ƒ.do_live_game_rendering(me, _BM, _AM, _TM);
		} else {
			Game_Manager_ƒ.do_paused_game_rendering(me, _AM, _BM, _TM);
		}
	},

	draw_cursor: (me: Game_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, _TM: Tilemap_Manager_Data) => {
		//const pos = this._TM.convert_tile_coords_to_pixel_coords(0,4); 

		let scale = 1.0;
		if( _BM.time_tracker.current_tick - me.fx_state.last_click_cursor_tick < 30 ){
			//sinusoidal(elastic.out
				const fraction = -(-1.0 + 3 * elastic.out(((_BM.time_tracker.current_tick - me.fx_state.last_click_cursor_tick) / 30.0)));

				scale = 1.0 + (1.0 * fraction);
		}

		let brightness = 1.0;
		if( _BM.time_tracker.current_tick - me.fx_state.last_click_cursor_tick < 10 ){

				const fraction = 1.0 - cubic((_BM.time_tracker.current_tick - me.fx_state.last_click_cursor_tick) / 10.0);

				brightness = 1.0 + 2.0 * fraction;
		}

		Asset_Manager_ƒ.draw_image_for_asset_name({
			_AM:						_AM,
			asset_name:					'map_cursor_grey_marquee',
			_BM:						_BM,
			pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(
				_TM,
				_AM,
				Tilemap_Manager_ƒ.convert_screenspace_pixel_coords_to_tile_coords(
					_TM,
					_AM,
					_BM,
					me.cursor_pos
				)
			),
			zorder:						zorder.map_cursor_low,
			current_milliseconds:		_BM.time_tracker.current_millisecond,
			opacity:					1.0,
			rotate:						0,
			scale:						scale,
			brightness:					brightness,
			horizontally_flipped:		false,
			vertically_flipped:			false,
		})
	},


	do_live_game_rendering: (me: Game_Manager_Data, _BM: Blit_Manager_Data, _AM: Asset_Manager_Data, _TM: Tilemap_Manager_Data) => {
		/*
			This is for when the game is "live" and actually progressing through time.  The player's set up their moves, and hit "go".
		*/

		map( me.game_state.current_frame_state.creature_list, (val,idx) => {
			const timestamp = Game_Manager_ƒ.get_time_offset(me, _BM)
			const timestamp_according_to_creature = Creature_ƒ.get_intended_animation_time_offset(val, timestamp);

			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					Creature_ƒ.yield_animation_asset_for_time(val, _TM, timestamp_according_to_creature),
				_BM:						_BM,
				pos:						val.pixel_pos, 
				zorder:						zorder.rocks,
				current_milliseconds:		timestamp_according_to_creature,
				opacity:					1.0,
				rotate:						0.0,
				scale:						1.0,
				brightness:					ƒ.if( (Game_Manager_ƒ.get_time_offset(me, _BM) - val.last_changed_hitpoints) < 80, 3.0, 1.0),
				horizontally_flipped:		Game_Manager_ƒ.get_flip_state_from_direction(val.facing_direction),
				vertically_flipped:			false,
				palette:					`team${val.team}` as Palette_Names
			});

			Asset_Manager_ƒ.draw_hitpoints({
				portion:					val.current_hitpoints / Creature_ƒ.get_delegate(val.type_name).yield_max_hitpoints(),
				_BM:						_BM,
				_AM:						_AM,
				pos:						val.pixel_pos,
				zorder:						zorder.rocks,
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
				opacity:					1.0,
			});

		})

		map( me.game_state.current_frame_state.tiles_blocked_by_creatures, (pos,idx) => {
			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					'white_tile',
				_BM:						_BM,
				pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, _AM, pos), 
				zorder:						zorder.map_boundary,
				current_milliseconds:		0.0,
				opacity:					1.0,
				rotate:						0.0,
				scale:						1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			});
		});	

		// const creature_tile_positions: Array<Point2D> = map(all_creatures_processed_and_culled, (val)=>(
		// 	Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, val.pixel_pos)
		// ))

		// console.log( `creature tile positions: ${JSON.stringify(creature_tile_positions)}` );


		map( me.game_state.custom_object_list, (val,idx) => {
			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					Custom_Object_ƒ.yield_asset(val),
				_BM:						_BM,
				pos:						val.pixel_pos,
				zorder:						Custom_Object_ƒ.yield_zorder(val),
				current_milliseconds:		Custom_Object_ƒ.get_lifetime_ms(
					val,
					Game_Manager_ƒ.get_time_offset(me, _BM)
				),
				opacity:					1.0,
				rotate:						val.rotate,
				scale:						1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})

			Asset_Manager_ƒ.draw_text({
				text:						Custom_Object_ƒ.yield_text(val),
				_BM:						_BM,
				_AM:						_AM,
				pos:						val.pixel_pos,
				zorder:						Custom_Object_ƒ.yield_zorder(val),
				current_milliseconds:		Custom_Object_ƒ.get_lifetime_ms(
					val,
					Game_Manager_ƒ.get_time_offset(me, _BM)
				),
				opacity:					1.0,
				rotate:						0,
				scale:						1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})
		})			
		Game_Manager_ƒ.draw_cursor(me, _AM, _BM, _TM);
	},


	do_paused_game_rendering: (me: Game_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, _TM: Tilemap_Manager_Data) => {
		/*
			This particularly means "paused at end of turn".
		*/
		const cursor_pos = Tilemap_Manager_ƒ.convert_screenspace_pixel_coords_to_tile_coords(
			_TM,
			_AM,
			_BM,
			me.cursor_pos
		);

		map( Game_Manager_ƒ.get_current_turn_state(me).creature_list, (val,idx) => {
			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					Creature_ƒ.yield_animation_asset_for_time(val, _TM, Game_Manager_ƒ.get_time_offset(me, _BM)),
				_BM:						_BM,
				pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, _AM, val.tile_pos),
				zorder:						zorder.rocks,
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM) + Game_Manager_ƒ.deterministic_random_time_offset_for_creature(val),
				opacity:					1.0,
				rotate:						0.0,
				scale:						1.0,
				brightness:					isEqual(cursor_pos, val.tile_pos) ? 1.0 + 0.75 * Math.sin(Game_Manager_ƒ.get_tick_offset(me, _BM) * 0.2) : 1.0,
				horizontally_flipped:		Game_Manager_ƒ.get_flip_state_from_direction(val.facing_direction),
				vertically_flipped:			false,
				palette:					`team${val.team}` as Palette_Names
			})

			Asset_Manager_ƒ.draw_hitpoints({
				portion:					val.current_hitpoints / Creature_ƒ.get_delegate(val.type_name).yield_max_hitpoints(),
				_BM:						_BM,
				_AM:						_AM,
				pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, _AM, val.tile_pos),
				zorder:						zorder.rocks,
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
				opacity:					1.0,
			})

			
			/*
				If there's a creature selected, then draw an indicator under every -other- creature to indicate the team.
			*/
			if(me.game_state.selected_object_index && me.game_state.selected_object_index != idx){
				Asset_Manager_ƒ.draw_image_for_asset_name({
					_AM:						_AM,
					asset_name:					'unit_team_indicator',
					_BM:						_BM,
					pos:						val.pixel_pos, 
					zorder:						zorder.map_cursor,
					current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
					opacity:					1.0,
					rotate:						0.0,
					scale:						1.0 + 0.15 * Math.sin(Game_Manager_ƒ.get_tick_offset(me, _BM) * 0.05),
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
					palette:					`team${val.team}` as Palette_Names
				});
			} else if ((me.game_state.selected_object_index !== undefined) && me.game_state.selected_object_index == idx) {
				Asset_Manager_ƒ.draw_image_for_asset_name({
					_AM:						_AM,
					asset_name:					'cursor_green',
					_BM:						_BM,
					pos:						val.pixel_pos, 
					zorder:						zorder.map_cursor,
					current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
					opacity:					1.0,
					rotate:						0.0,
					scale:						1.0 + 0.15 * Math.sin(Game_Manager_ƒ.get_tick_offset(me, _BM) * 0.05),
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
					palette:					`team${val.team}` as Palette_Names
				});
			}		
		})

		

		map( me.game_state.current_frame_state.tiles_blocked_by_creatures, (pos,idx) => {
			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					'white_tile',
				_BM:						_BM,
				pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, _AM, pos), 
				zorder:						zorder.map_boundary,
				current_milliseconds:		0.0,
				opacity:					1.0,
				rotate:						0.0,
				scale:						1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			});
		});	


		map( me.game_state.custom_object_list, (val,idx) => {

			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					Custom_Object_ƒ.yield_asset(val),
				_BM:						_BM,
				pos:						val.pixel_pos,
				zorder:						Custom_Object_ƒ.yield_zorder(val),
				current_milliseconds:		Custom_Object_ƒ.get_lifetime_ms(
					val,
					Game_Manager_ƒ.get_time_offset(me, _BM)
				),
				opacity:					1.0,
				rotate:						val.rotate,
				scale:						1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})

			Asset_Manager_ƒ.draw_text({
				text:						Custom_Object_ƒ.yield_text(val),
				_BM:						_BM,
				_AM:						_AM,
				pos:						val.pixel_pos,
				zorder:						Custom_Object_ƒ.yield_zorder(val),
				current_milliseconds:		Custom_Object_ƒ.get_lifetime_ms(
												val,
												Game_Manager_ƒ.get_time_offset(me, _BM)
											),
				opacity:					1.0,
				rotate:						val.rotate,
				scale:						1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})
		})	
		Game_Manager_ƒ.draw_cursor(me, _AM, _BM, _TM);

	},

}

