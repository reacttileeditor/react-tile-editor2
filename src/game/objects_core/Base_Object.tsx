import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { add_points, ƒ } from "../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_Manager_Data } from "../core/engine/Game_Manager";
import { Blit_Manager_Data } from "../core/engine/Blit_Manager";
import { Asset_Manager_Data } from "../core/engine/Asset_Manager/Asset_Manager";



export type Base_Object_Data = 
	Base_Object_Statics &
	Base_Object_State &
	Base_Object_Accessors;

export type Base_Object_Statics = {
	unique_id: string;
	creation_timestamp: number,
}

export type Base_Object_State = {
	pixel_pos: Point2D;
	rotate: number,
	should_remove: boolean,
	is_done_with_turn: boolean,
	velocity: Point2D,
	accel: Point2D,
}

export type Base_Object_Accessors = {
	get_GM_instance: () => Game_Manager_Data;
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
} 

export const New_Base_Object = (
	p: {
		creation_timestamp: number,
		should_remove: boolean,
		pixel_pos?: Point2D,
		is_done_with_turn: boolean,
		rotate?: number,
		velocity?: Point2D,
		accel?: Point2D, 
		unique_id?: string,
	} & Base_Object_Accessors): Base_Object_Data => {

	return {
		//static values
		unique_id: p.unique_id ?? uuid(),
		creation_timestamp: p.creation_timestamp,
		
		//state	
		pixel_pos: p.pixel_pos ?? {x:0, y: 0},  //TODO use TM
		rotate: p.rotate ?? 0,
		should_remove: p.should_remove,
		is_done_with_turn: p.is_done_with_turn,
		velocity: p.velocity ?? {x: 0, y: 0},
		accel: p.accel ?? {x: 0, y: 0},



		//accessors
		get_GM_instance: p.get_GM_instance,
		_Asset_Manager: p._Asset_Manager,
		_Blit_Manager: p._Blit_Manager,
		_Tilemap_Manager: p._Tilemap_Manager,

	}	
}





export const Base_Object_ƒ = {
	get_accessors: (me: Base_Object_Data): Base_Object_Accessors => ({
		get_GM_instance: me.get_GM_instance,
		_Asset_Manager: me._Asset_Manager,
		_Blit_Manager: me._Blit_Manager,
		_Tilemap_Manager: me._Tilemap_Manager,
	}),

	get_base_object_state: (me: Base_Object_Data): Base_Object_State => ({
		pixel_pos: me.pixel_pos,
		rotate: me.rotate,
		should_remove: me.should_remove,
		is_done_with_turn: me.is_done_with_turn,
		velocity: me.velocity,
		accel: me.accel,		
	}),


	get_current_mid_turn_tile_pos: (me: Base_Object_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Point2D => (
		Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, me.pixel_pos)
	),

	process_physics: (me: Base_Object_Data): Base_Object_Data => {
		const new_velocity = add_points(me.velocity, me.accel);


		return {
			...me,
			pixel_pos: add_points(me.pixel_pos, new_velocity),
			velocity: new_velocity,
		}
	},
}


