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

import { Point2D, Rectangle, Screenspace_Pixel_Point } from '../../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { zorder } from "../../constants/zorder";
import { Vals } from "../../constants/Constants";
import { Game_Manager_Data, Game_Manager_ƒ, Game_and_Tilemap_Manager_Data } from "./Game_Manager";
import { Map_Analysis_ƒ } from "../Map_Analysis";



export const Game_Manager_ƒ_State_Management = {
	/*----------------------- core ui interaction -----------------------*/
	set_cursor_pos: (me: Game_Manager_Data, _BM: Blit_Manager_Data, coords: Screenspace_Pixel_Point, is_cursor_behind_hud: boolean): Game_Manager_Data => {
		return {
			...cloneDeep(me),
			cursor_pos: coords,
			last_cursor_move_tick: _BM.time_tracker.current_tick,
			is_cursor_behind_hud: is_cursor_behind_hud
		}
	},


	handle_click: (
		get_game_state: () => Game_Manager_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		pos: Screenspace_Pixel_Point,
		buttons_pressed: Mouse_Button_State
	): Game_and_Tilemap_Manager_Data => {
		if( !get_game_state().animation_state.is_animating_live_game ){

			let new_game_data = Game_Manager_ƒ.select_object_based_on_tile_click(get_game_state, _TM, _AM, _BM, pos, buttons_pressed)


			const selected_creature = Game_Manager_ƒ.get_selected_creature(new_game_data);

			const highlit_creature = Game_Manager_ƒ.get_highlit_creature(new_game_data, _TM, _AM, _BM);
		
			const displayed_creature = selected_creature ?? highlit_creature;			

			return {
				tm:	displayed_creature != undefined
					?
					Game_Manager_ƒ.adjust_tiles_to_display_unit_path_and_possible_moves(new_game_data, displayed_creature, _AM, _BM, _TM).tm
					:
					Tilemap_Manager_ƒ.clear_tile_maps(_TM, ['real_path', 'prospective_path','move_map'], _AM),
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

	select_object_based_on_tile_click: (get_game_state: () => Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, pos: Screenspace_Pixel_Point, buttons_pressed: Mouse_Button_State): Game_Manager_Data => {
		/*
			This handles two "modes" simultaneously.  If we click on an object, then we change the current selected object to be the one we clicked on (its position is occupied, and ostensibly can't be moved into - this might need to change with our game rules being what they are, but we'll cross that bridge later).  If we click on the ground, then we're intending to move the current object to that location.
		*/
		const new_pos = Tilemap_Manager_ƒ.convert_screenspace_pixel_coords_to_tile_coords( _TM, _AM, _BM, pos );
		const me = get_game_state();
		
		let newly_selected_creature_index: number|undefined = Game_Manager_ƒ.get_creature_index_for_pos(me, new_pos);
		let newly_selected_object_possible_moves: Array<Point2D> = [];

		let new_creature: Creature_Data|undefined = undefined;
		let new_creature_array = cloneDeep(me.game_state.current_frame_state.creature_list);
		let changed_path_this_click = false;

		if(newly_selected_creature_index === -1){
			/*
				The player didn't click on any unit; they clicked on terrain.

				We only do anything if they've got a unit selected, so first of all, we check for that:
			*/
			if( me.game_state.selected_object_index != undefined ){
				const creature = Game_Manager_ƒ.get_current_turn_state(me).creature_list[ me.game_state.selected_object_index ];
				/*
					First we get the info on what unit is currently selected.
				*/


				if( buttons_pressed.left == true ){
					/*
						If a unit is selected, a left click on open terrain is a move command.
					*/

					new_creature = {
						...cloneDeep(creature),
						path_data: Creature_ƒ.set_path(
							creature,
							Pathfinder_ƒ.find_path_between_map_tiles( _TM, _AM, me, _BM, creature.tile_pos, new_pos, creature ).successful_path,
							_TM
						),
						planned_tile_pos: new_pos,
					}

					new_creature_array[me.game_state.selected_object_index] = new_creature;
					changed_path_this_click = true;

				} else if ( buttons_pressed.right == true ){
					/*
						If it's a right click, then we're basically issuing one of two "stack pop/clear" operations (i.e. the vibe of hitting the "esc" button); either we're clearing the path, or if there is no path, we're deselectingthe unit.
					*/
					if( size(creature.path_data.path_this_turn) ){
						new_creature = {
							...cloneDeep(creature),
							path_data: Creature_ƒ.clear_path(creature),
						}

						new_creature_array[me.game_state.selected_object_index] = new_creature;
					} else {
						newly_selected_creature_index = undefined;
					}
				}
			}
		} else if(newly_selected_creature_index === me.game_state.selected_object_index ) {
			/*
				We just clicked, a second time, on the current unit.
				
				I don't know if this is the right approach for the UI, but the needs of our game are sufficiently weird that I'm having to "wing it" with entirely new UI behavior.   We have two totally different things that happen if you left-click on a unit.   One of them follows the traditionalist "selecting files in the file manager" expectation, where if something is selected, and you click on it, it deselects.  This is what happens if you've got no path.

				However, there's also this competing expectation that oncence a unit is selected, we're understood to be in "path creation" mode.  When you're in this mode, all of your left clicks "set the path" - so it makes perfect sense that the easiest way to "clear/cancel" having a path would be to click right back on the unit, again.
				
				So it's a little odd; two different behaviors for left-clicking on the unit.  The first one empties the path, the second deselects the unit.


				Note:
				We don't need to update `newly_selected_object_possible_moves` because it's not changing.
			*/
			if( buttons_pressed.left == true ){
				const creature = Game_Manager_ƒ.get_current_turn_state(me).creature_list[ me.game_state.selected_object_index as number];

				if( size(creature.path_data.path_this_turn) ){
					//since we have a path, clear it.

					new_creature = {
						...cloneDeep(creature),
						path_data: Creature_ƒ.clear_path(creature),
					}
	
					new_creature_array[me.game_state.selected_object_index as number] = new_creature;
				} else {
					//since we don't have a path, deselect the creature

					newly_selected_creature_index = undefined;
				}

			} else {
				/*
					Right clicking acts as our "mode pop/escape" operation, so in this context, it deselects the creature. 

					We also don't need to clear `newly_selected_object_possible_moves` because it's already empty.
				*/
				newly_selected_creature_index = undefined;
			}
		} else {
			/*
				We've clicked on a new creature, so we want to pass along the index to the return statement, which means we don't need to do anything.
			*/

			const creature = Game_Manager_ƒ.get_current_turn_state(me).creature_list[ newly_selected_creature_index as number ]

			const terrain_plus_blocking = Pathfinder_ƒ.block_tiles_occupied_by_other_creatures(_TM, _AM, me, _BM, _TM.tile_maps.terrain, creature) as Tilemap_Single;

			newly_selected_object_possible_moves = Map_Analysis_ƒ.calculate_accessible_tiles_for_remaining_movement(
				creature,
				_TM,
				new_pos,
				terrain_plus_blocking
			);
		}

		let new_turn_list = cloneDeep(me.game_state.turn_list);
		new_turn_list[size(new_turn_list) - 1].creature_list = new_creature_array;

		return {
			...cloneDeep(me),
			last_path_change_tick: changed_path_this_click ? _BM.time_tracker.current_tick : me.last_path_change_tick,
			game_state: {
				...cloneDeep(me.game_state),
				current_frame_state: {
					creature_list: new_creature_array,
					tiles_blocked_by_creatures: me.game_state.current_frame_state.tiles_blocked_by_creatures
				},
				selected_object_index: newly_selected_creature_index == -1 ? me.game_state.selected_object_index : newly_selected_creature_index,
				selected_object_possible_moves: newly_selected_object_possible_moves,
				turn_list: new_turn_list
			},
			fx_state: {
				...me.fx_state,
				last_click_cursor_tick: _BM.time_tracker.current_tick
			}
		}
	},



	/*----------------------- turn management -----------------------*/

	advance_turn_start: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Game_and_Tilemap_Manager_Data => {
		console.log(`beginning turn #${me.game_state.current_turn}`)

		return {
			tm: Tilemap_Manager_ƒ.clear_tile_maps(_TM, ['real_path', 'prospective_path', 'move_map'], _AM),
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
			tiles_blocked_by_creatures: cloneDeep(me.game_state.current_frame_state.tiles_blocked_by_creatures),
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

