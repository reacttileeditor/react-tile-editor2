import _, { cloneDeep, find, isBoolean, map, size } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Type_Name, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../Custom_Object";
import { Base_Object_Data, New_Base_Object } from "../Base_Object";
import { Creature_Delegate, CT_Hermit_ƒ, CT_Human_Footman_ƒ, CT_Peasant_ƒ, CT_Skeleton_ƒ, CT_Undead_Javelineer_ƒ } from "./Creature_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../../core/engine/Game_Manager";
import { Creature_Behavior_ƒ } from "./Creature_Behavior";
import { Asset_Manager_Data } from "../../core/engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data } from "../../core/engine/Blit_Manager";
import { add, filter, includes, reduce } from "ramda";
import { Creature_ƒ_Accessors } from "./Accessors";
import { Creature_ƒ_State_Management } from "./State_Management";
import { Creature_ƒ_Path_Management } from "./Path_Management";



export type Path_Node_With_Direction = {
	position: Point2D,
	direction: Direction,
}

export type Creature_Type_Name = 'hermit' | 'peasant' | 'skeleton' | 'undead_javelineer' | 'human_footman';



export type Change_Type = 
	'add' |
	'set';


export type Behavior_Mode = 
	'stand' |
	'walk' |
	'attack';


export type Change_Instance = {
	type: Change_Type,
	value: Change_Value,
	target_variable: keyof Creature_Data,
	target_obj_uuid: string, //uuid, actually
};

export type Creature_Keys = (keyof Creature_Data & keyof Base_Object_Data);

export type Variable_Specific_Change_Instance = {
	type: Change_Type,
	value: Change_Value,
}

export type Change_Value = (number|string|Point2D|boolean|Path_Data|Creature_Data);


export type Creature_Data = {
	//static values
	type_name: Creature_Type_Name;
	team: number;

	//state	
	tile_pos: Point2D;
	facing_direction: Direction;
	remaining_action_points: number,
	remaining_move_points: number,
	current_hitpoints: number,
	last_changed_hitpoints: number,
	last_behavior_reconsideration_timestamp: number,
	next_behavior_reconsideration_timestamp: number,
	is_done_with_turn: boolean,
	behavior_mode: Behavior_Mode,

	//intended moves
	planned_tile_pos: Point2D;
	walk_segment_start_time: number,
	path_data: Path_Data;
	target?: Creature_Data;
} & Base_Object_Data;

export type Anim_Schedule_Element = {
	direction: Direction,
	duration: number,
	start_time: number,
	start_pos: Point2D,
	end_pos: Point2D,
}

export type Path_Data = {
	path_this_turn: Array<Point2D>;
	path_this_turn_with_directions: Array<Path_Node_With_Direction>;
	path_reachable_this_turn: Array<Point2D>;
	path_reachable_this_turn_with_directions: Array<Path_Node_With_Direction>;
}

export type ValueOf<T> = T[keyof T];





export const path_data_empty = {
	path_this_turn: [],
	path_this_turn_with_directions: [],
	path_reachable_this_turn: [],
	path_reachable_this_turn_with_directions: [],
}


export const New_Creature = (
	p: {
		get_GM_instance: () => Game_Manager_Data;
		_Asset_Manager: () => Asset_Manager_Data,
		_Blit_Manager: () => Blit_Manager_Data,
		_Tilemap_Manager: () => Tilemap_Manager_Data,

		tile_pos: Point2D,
		direction?: Direction,
		remaining_action_points?: number,
		remaining_move_points?: number,
		current_hitpoints?: number,
		last_changed_hitpoints?: number,
		last_behavior_reconsideration_timestamp?: number,
		next_behavior_reconsideration_timestamp?: number,
		is_done_with_turn: boolean,
		behavior_mode: Behavior_Mode,
		planned_tile_pos: Point2D,
		target?: Creature_Data
		type_name: Creature_Type_Name,
		team: number,
		unique_id?: string,
		creation_timestamp: number,
		should_remove: boolean,
	}): Creature_Data => {
	return {
		...New_Base_Object({
			get_GM_instance: p.get_GM_instance,
			_Asset_Manager: p._Asset_Manager,
			_Blit_Manager: p._Blit_Manager,
			_Tilemap_Manager: p._Tilemap_Manager,
			pixel_pos: Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(p._Tilemap_Manager(), p._Asset_Manager(), p.tile_pos),
			unique_id: p.unique_id,
			should_remove: p.should_remove,
			creation_timestamp: p.creation_timestamp,
			is_done_with_turn: p.is_done_with_turn,
		}),

		//static values
		type_name: p.type_name,
		team: p.team,

		//state	
		tile_pos: p.tile_pos,
		facing_direction: ƒ.if(p.direction !== undefined, p.direction, 'south_east'),
		remaining_action_points: ƒ.if(p.remaining_action_points !== undefined, p.remaining_action_points, 1),
		remaining_move_points: ƒ.if(p.remaining_move_points !== undefined,
			p.remaining_move_points,
			Creature_ƒ.get_delegate(p.type_name).yield_moves_per_turn()
		),
		current_hitpoints: ƒ.if(p.current_hitpoints !== undefined,
			p.current_hitpoints,
			Creature_ƒ.get_delegate(p.type_name).yield_max_hitpoints()
		),
		last_changed_hitpoints: ƒ.if(p.current_hitpoints !== undefined,
			p.last_changed_hitpoints,
			-200,
		),
		last_behavior_reconsideration_timestamp: ƒ.if(p.last_behavior_reconsideration_timestamp !== undefined,
			p.last_behavior_reconsideration_timestamp,
			0,
		),
		next_behavior_reconsideration_timestamp: ƒ.if(p.next_behavior_reconsideration_timestamp !== undefined,
			p.next_behavior_reconsideration_timestamp,
			0,
		),
		target: p.target,
		behavior_mode: p.behavior_mode,


		//intended moves
		planned_tile_pos: p.planned_tile_pos,
		walk_segment_start_time: 0,
		path_data: cloneDeep(path_data_empty),
	}	
}




export const Creature_ƒ = {
	/*----------------------- function imports -----------------------*/
	...Creature_Behavior_ƒ,
	...Creature_ƒ_Accessors,
	...Creature_ƒ_State_Management,
	...Creature_ƒ_Path_Management,

	/*----------------------- constructor/destructor stuff -----------------------*/

	copy_for_new_turn: (me: Creature_Data): Creature_Data => (
		cloneDeep({
			...me,
			next_behavior_reconsideration_timestamp: 0,
			last_behavior_reconsideration_timestamp: 0,
			last_changed_hitpoints: -300,
			remaining_action_points: 1,
			planned_tile_pos: me.tile_pos,
			path_data: cloneDeep(path_data_empty),
			behavior_mode: 'stand',
			target: undefined,
			is_done_with_turn: false,
			remaining_move_points: Creature_ƒ.get_delegate(me.type_name).yield_moves_per_turn()
		})
	),

}





