import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, find, findIndex, isEmpty, isEqual, isNil, isNumber, last, map, reduce, size, toArray, uniq } from "lodash";
import { includes } from "ramda"

import { constrain_point_within_rect, ƒ } from "../Utils";

import { Canvas_View, Mouse_Button_State } from "../../gui/Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../Blit_Manager";
import { Tile_Palette_Element } from "../../gui/Tile_Palette_Element";
import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ, Tilemap_Single } from "../Tilemap_Manager/Tilemap_Manager";
import { Pathfinder_ƒ } from "../Pathfinding";

import { Creature_ƒ, New_Creature, Creature_Data, Path_Node_With_Direction, Change_Instance, Creature_Type_Name } from "../../../objects_core/Creature/Creature";

import { Point2D, Rectangle } from '../../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { zorder } from "../../constants/zorder";
import { Vals } from "../../constants/Constants";
import { Game_Manager_Data, Game_Manager_ƒ, Game_and_Tilemap_Manager_Data } from "./Game_Manager";
import { Map_Analysis_ƒ } from "../Map_Analysis";



export const Game_Manager_ƒ_State_Management = {
	/*----------------------- core ui interaction -----------------------*/
	set_cursor_pos: (me: Game_Manager_Data, coords: Point2D): Game_Manager_Data => {
		return {
			...cloneDeep(me),
			cursor_pos: coords,
		}
	},


	handle_click: (
		get_game_state: () => Game_Manager_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		pos: Point2D,
		buttons_pressed: Mouse_Button_State
	): Game_and_Tilemap_Manager_Data => {
		if( !get_game_state().animation_state.is_animating_live_game ){

			let new_game_data = Game_Manager_ƒ.select_object_based_on_tile_click(get_game_state, _TM, _AM, _BM, pos, buttons_pressed)
			const selected_creature = Game_Manager_ƒ.get_selected_creature(new_game_data);

			return {
				tm:	selected_creature != undefined
					?
					Game_Manager_ƒ.adjust_tiles_to_display_unit_path(new_game_data, selected_creature, _AM, _BM, _TM).tm
					:
					Tilemap_Manager_ƒ.clear_tile_map(_TM, 'ui', _AM),
				gm: new_game_data
			}
		} else {
			return {
				tm: _TM,
				gm: get_game_state(),
			}
		}
	},

	/*----------------------- ui interaction subroutines -----------------------*/

	select_object_based_on_tile_click: (get_game_state: () => Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, pos: Point2D, buttons_pressed: Mouse_Button_State): Game_Manager_Data => {
		/*
			This handles two "modes" simultaneously.  If we click on an object, then we change the current selected object to be the one we clicked on (its position is occupied, and ostensibly can't be moved into - this might need to change with our game rules being what they are, but we'll cross that bridge later).  If we click on the ground, then we're intending to move the current object to that location.
		*/
		const new_pos = Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords( _TM, _AM, _BM, pos );
		const me = get_game_state();
		
		let newly_selected_creature_index: number|undefined = Game_Manager_ƒ.get_creature_index_for_pos(me, new_pos);
		let newly_selected_object_possible_moves: Array<Point2D> = [];

		let new_creature: Creature_Data|undefined = undefined;
		let new_creature_array = cloneDeep(me.game_state.current_frame_state.creature_list);

		if(newly_selected_creature_index === -1){
			/*
				The player didn't click on any unit; they clicked on terrain, so this is a move command.
			*/
			if( me.game_state.selected_object_index != undefined ){
				/*
					That said; it's not a move command if nobody's selected.
				*/


				const creature = Game_Manager_ƒ.get_current_turn_state(me).creature_list[ me.game_state.selected_object_index ];
				/*
					If it's a regular click, we're setting the path.
					If it's a right click, we're clearing the path.
				*/

				if( buttons_pressed.left == true ){
					new_creature = {
						...cloneDeep(creature),
						path_data: Creature_ƒ.set_path(
							creature,
							Pathfinder_ƒ.find_path_between_map_tiles( _TM, _AM, creature.tile_pos, new_pos, creature ).successful_path,
							_TM
						),
						planned_tile_pos: new_pos,
					}

					new_creature_array[me.game_state.selected_object_index] = new_creature;

				} else if ( buttons_pressed.right == true ){
					new_creature = {
						...cloneDeep(creature),
						path_data: Creature_ƒ.clear_path(creature),
					}

					new_creature_array[me.game_state.selected_object_index] = new_creature;
				}
			}
		} else if(newly_selected_creature_index === me.game_state.selected_object_index ) {
			/*
				We just clicked, a second time, on the current unit, so instead of selecting it, we actually want to toggle; to de-select it.

				We also don't need to clear `newly_selected_object_possible_moves` because it's already empty.
			*/
			newly_selected_creature_index = undefined;
		} else {
			/*
				We've clicked on a new creature, so we want to pass along the index to the return statement, which means we don't need to do anything.
			*/

			const creature = Game_Manager_ƒ.get_current_turn_state(me).creature_list[ newly_selected_creature_index as number ]

			newly_selected_object_possible_moves = Map_Analysis_ƒ.calculate_accessible_tiles_for_remaining_movement(
				creature,
				_TM,
				new_pos
			);
		}

		let new_turn_list = cloneDeep(me.game_state.turn_list);
		new_turn_list[size(new_turn_list) - 1].creature_list = new_creature_array;

		return {
			...cloneDeep(me),
			game_state: {
				...cloneDeep(me.game_state),
				current_frame_state: {
					creature_list: new_creature_array
				},
				selected_object_index: newly_selected_creature_index == -1 ? me.game_state.selected_object_index : newly_selected_creature_index,
				selected_object_possible_moves: newly_selected_object_possible_moves,
				turn_list: new_turn_list
			}
		}
	},


	adjust_tiles_to_display_unit_path: (
		me: Game_Manager_Data,
		creature: Creature_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_TM: Tilemap_Manager_Data
	): Game_and_Tilemap_Manager_Data => {

		

		//let tilemap_mgr_data: Tilemap_Manager_Data = Tilemap_Manager_ƒ.clear_tile_map(_TM, 'ui', _AM);

		let new_tile_map: Tilemap_Single = Tilemap_Manager_ƒ.create_empty_tile_map(_TM, _AM);

		new_tile_map = map( _TM.tile_maps.ui, (y_val, y_idx) => {
			return map (y_val, (x_val, x_idx)=>{

				/*
					iterate over each of the path values.

					Here we build a brand new tilemap for the unit path, from scratch.
				*/

				// console.log(`tile choice for ${x_idx}, ${y_idx}
				// creature: ${creature.tile_pos.x}, ${creature.tile_pos.y}
				// on_path?: ${includes({x: x_idx, y: y_idx}, creature.path_data.path_this_turn )}`)

				/*if(
					isEqual({x: x_idx, y: y_idx}, creature.tile_pos)
					&&
					!size(creature.path_data.path_this_turn)
				){
					return x_val;//'cursor_green';
				} else*/ if (
					!size(creature.path_data.path_this_turn)
					&&
					includes({x: x_idx, y: y_idx}, me.game_state.selected_object_possible_moves)
				){
					return 'tile_boundary';
				}


				return ƒ.if(  includes({x: x_idx, y: y_idx}, creature.path_data.path_this_turn ),
						ƒ.if( includes({x: x_idx, y: y_idx}, creature.path_data.path_reachable_this_turn),
							ƒ.if( isEqual({x: x_idx, y: y_idx}, last(creature.path_data.path_reachable_this_turn)),
								'arrowhead-green',
								'arrow-green'
							),
							'red-path-unreachable-dot'
						),
						''
					)
				
			})
		})

		return {
			tm: {
				level_name: _TM.level_name,
				metadata: cloneDeep(_TM.metadata),
				tile_maps: {
					...cloneDeep(_TM.tile_maps),
					ui: new_tile_map,
				},
				tile_RNGs: cloneDeep(_TM.tile_RNGs),
				creature_list: cloneDeep(_TM.creature_list),
				initialized: true,
				...Tilemap_Manager_ƒ.cleared_cache(),
				asset_blit_list_cache_by_tilemap: {
					terrain: _TM.asset_blit_list_cache_by_tilemap.terrain,
					movemap: _TM.asset_blit_list_cache_by_tilemap.movemap,
					ui: [[[]]],
				}

			},
			gm: me,
		}
	},

	/*----------------------- turn management -----------------------*/

	advance_turn_start: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Game_and_Tilemap_Manager_Data => {
		console.log(`beginning turn #${me.game_state.current_turn}`)

		return {
			tm: Tilemap_Manager_ƒ.clear_tile_map(_TM, 'ui', _AM),
			gm: {
				...cloneDeep(me),
				animation_state: {
					processing_tick: 0,
					is_animating_live_game: true,
					time_live_game_anim_started__in_ticks: _BM.time_tracker.current_tick,
					time_paused_game_anim_started__in_ticks: me.animation_state.time_paused_game_anim_started__in_ticks,
				},
				game_state: {
					...cloneDeep(me.game_state),
					current_frame_state: cloneDeep(Game_Manager_ƒ.get_current_turn_state(me)),
					objective_text: Game_Manager_ƒ.write_full_objective_text(me, Game_Manager_ƒ.get_game_state(me).objective_type, Game_Manager_ƒ.get_game_state(me)),
				}
			}
		}
	},

	advance_turn_finish: (me: Game_Manager_Data, _BM: Blit_Manager_Data):Game_Manager_Data => {
		/*
			All behavior is handled inside creature and custom object processing.  Impressing the current state of this into the array of turns is mostly being done as a snapshot.
		*/
		

		let new_turn_state = cloneDeep(me.game_state.current_frame_state);
		new_turn_state = {
			creature_list: map(new_turn_state.creature_list, (val)=>( Creature_ƒ.copy_for_new_turn(val) )),
		};

		console.log(`finishing turn #${me.game_state.current_turn}`)

		return {
			...cloneDeep(me),
			animation_state: {
				processing_tick: me.animation_state.processing_tick,
				is_animating_live_game: false,
				time_live_game_anim_started__in_ticks: me.animation_state.time_live_game_anim_started__in_ticks,
				time_paused_game_anim_started__in_ticks: _BM.time_tracker.current_tick,
			},
			game_state: {
				...cloneDeep(me.game_state),
				current_frame_state: new_turn_state,
				turn_list: concat(
					me.game_state.turn_list,
					[new_turn_state]
				),
				objective_text: Game_Manager_ƒ.write_full_objective_text(me, Game_Manager_ƒ.get_game_state(me).objective_type, Game_Manager_ƒ.get_game_state(me)),
				current_turn: me.game_state.current_turn + 1,
			},
		}
	},

}

