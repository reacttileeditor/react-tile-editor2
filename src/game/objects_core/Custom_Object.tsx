import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/Utils";

import { Tilemap_Manager, Direction } from "../core/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_State } from "../core/Game_View";
import { CreatureTypeName } from "./Creature";
import { Custom_Object_Delegate, CO_Shot_ƒ } from "./Custom_Object_Delegate";
import { Base_Object_Data, New_Base_Object } from "./Base_Object";
 

export type CustomObjectTypeName = 'shot';

export type Custom_Object_Data = {
	type_name: CustomObjectTypeName,
} & Base_Object_Data;


export const New_Custom_Object = (
	p: {
		get_game_state: () => Game_State,
		pixel_pos: Point2D,
		type_name: CustomObjectTypeName,
		unique_id?: string,
	}): Custom_Object_Data => {

	return {
		...New_Base_Object({
			get_game_state: p.get_game_state,
			pixel_pos: p.pixel_pos,
			unique_id: p.unique_id,
		}),
		type_name: p.type_name,
	}	
}

export const Custom_Object_ƒ = {
/*----------------------- basetype management -----------------------*/


	get_delegate: (type_name: CustomObjectTypeName): Custom_Object_Delegate => {
		return {
			shot: CO_Shot_ƒ,
		}[type_name];
	},


/*----------------------- movement -----------------------*/
	get_current_mid_turn_tile_pos: (me: Base_Object_Data, TM: Tilemap_Manager): Point2D => (
		TM.convert_pixel_coords_to_tile_coords(me.pixel_pos)
	),

	process_single_frame: (me: Custom_Object_Data, _Tilemap_Manager: Tilemap_Manager, offset_in_ms: number): Custom_Object_Data => {

		let newObj = _.cloneDeep(this);



		//console.log(`old: ${this.pixel_pos.y}   new: ${newObj.pixel_pos.y}`)


		return New_Custom_Object({
			get_game_state: me.get_game_state,
			pixel_pos: Custom_Object_ƒ.get_delegate(me.type_name).process_single_frame(me.pixel_pos, me.get_game_state).pixel_pos,
			type_name: me.type_name,
			unique_id: me.unique_id
		})
	},

	yield_image: (me: Custom_Object_Data) => (
		Custom_Object_ƒ.get_delegate(me.type_name).yield_image()
	)	
}
