
import _, { cloneDeep, filter, find, first, isBoolean, isEqual, map, size } from "lodash";

import { angle_between, ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";
import { Pathfinder_ƒ } from "../../core/engine/Pathfinding";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Type_Name, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../Custom_Object";
import { Base_Object_Data, Base_Object_ƒ, New_Base_Object } from "../Base_Object";
import { Creature_Delegate, CT_Hermit_ƒ, CT_Peasant_ƒ, CT_Skeleton_ƒ } from "./Creature_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../../core/engine/Game_Manager/Game_Manager";
import { Anim_Schedule_Element, Behavior_Mode, Change_Instance, Creature_Data, Creature_ƒ, Path_Node_With_Direction, Path_Data } from "./Creature";
import { AI_Core_ƒ } from "./AI_Core";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../../core/engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ms_to_ticks, ticks_to_ms } from "../../core/engine/Blit_Manager";
import { Vals } from "../../core/constants/Constants";




export const Creature_ƒ_Path_Management = {
/*----------------------- state management -----------------------*/

	set_path: (me: Creature_Data, new_path: Array<Point2D>, _TM: Tilemap_Manager_Data): Path_Data => {
		const path_this_turn_with_directions = Creature_ƒ.build_directional_path_from_path(
			me,
			new_path,
			_TM
		);

		return {
			path_this_turn: new_path,
			path_reachable_this_turn:Creature_ƒ.yield_path_reachable_this_turn(me, _TM, new_path),
			path_this_turn_with_directions: path_this_turn_with_directions,
			path_reachable_this_turn_with_directions: Creature_ƒ.yield_directional_path_reachable_this_turn(me, _TM, path_this_turn_with_directions)
		}
	},

	clear_path: (me: Creature_Data): Path_Data => {
		return {
			path_this_turn: [],
			path_reachable_this_turn: [],
			path_this_turn_with_directions: [],
			path_reachable_this_turn_with_directions: [],
		}
	},
	


/*----------------------- pathfinding calculations -----------------------*/
	yield_path_reachable_this_turn: (me: Creature_Data, _TM: Tilemap_Manager_Data, new_path: Array<Point2D>):Array<Point2D> => {
		let moves_remaining = cloneDeep(me.remaining_move_points);
		let final_path: Array<Point2D> = [];
	
		_.map( new_path, (val) => {
			const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				val,
				'terrain',
			);
			const move_cost = Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type) ?? 100000000000000;

			moves_remaining = Math.max(moves_remaining - move_cost,0);
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	},

	yield_directional_path_reachable_this_turn: (me: Creature_Data, _TM: Tilemap_Manager_Data, new_path: Array<Path_Node_With_Direction>):Array<Path_Node_With_Direction> => {
		let moves_remaining = cloneDeep(me.remaining_move_points);
		let final_path: Array<Path_Node_With_Direction> = [];
	
		_.map( new_path, (val) => {
			const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				val.position,
				'terrain',
			);
			const move_cost = Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type) ?? 100000000000000;

			moves_remaining = Math.max(moves_remaining - move_cost,0);
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	},


	build_directional_path_from_path: (
		me: Creature_Data,
		raw_path: Array<Point2D>,
		_TM: Tilemap_Manager_Data
	): Array<Path_Node_With_Direction> => {
		if( size(raw_path) > 1 ){
			return _.map( raw_path, (val, idx) => {
				if( idx == (size(raw_path) -1) ){
					return {
						position: raw_path[idx],
						direction: Creature_ƒ.extract_direction_from_map_vector(
							me,
							raw_path[idx - 1],
							raw_path[idx],
							_TM
						)
					}
				} else {
					return {
						position: raw_path[idx],
						direction: Creature_ƒ.extract_direction_from_map_vector(
							me,
							raw_path[idx],
							raw_path[idx + 1],
							_TM
						)
					}
				}

			} )
		} else {
			//we have a single-tile path.  We shouldn't have to calculate this, but some code path might hit it.
			return _.map( raw_path, (val, idx) => {
				return {
					position: raw_path[idx],
					direction: me.facing_direction
				}
			});
		}
	},

	extract_direction_from_map_vector: (
		me: Creature_Data,
		start_pos: Point2D,
		end_pos: Point2D,
		_TM: Tilemap_Manager_Data
	):Direction => {
		const pixel_start_pos = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), start_pos);
		const pixel_end_pos = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), end_pos);

		if( pixel_start_pos.y == pixel_end_pos.y ){
			if(pixel_start_pos.x < pixel_end_pos.x){
				return 'east';
			} else {
				return 'west';
			}
		} else if( pixel_start_pos.y >= pixel_end_pos.y  ){
			if(pixel_start_pos.x < pixel_end_pos.x){
				return 'north_east';
			} else {
				return 'north_west';
			}
		} else {
			if(pixel_start_pos.x < pixel_end_pos.x){
				return 'south_east';
			} else {
				return 'south_west';
			}
		}
	},

}





