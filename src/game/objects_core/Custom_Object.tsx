import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/Utils";

import { Tilemap_Manager, Direction } from "../core/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_State } from "../core/Game_View";
import { CreatureTypeName } from "./Creature";
import { Custom_Object_Delegate, CO_Shot_ƒ, CO_Text_Label_ƒ, Custom_Object_Delegate_States, CO_Shot_State, CO_Skull_Icon_ƒ } from "./Custom_Object_Delegate";
import { Base_Object_Data, New_Base_Object } from "./Base_Object";
 

export type CustomObjectTypeName = 'shot' | 'text_label' | 'skull_icon';

export type Custom_Object_Data = {
	type_name: CustomObjectTypeName,
	text: string,
	delegate_state: Custom_Object_Delegate_States,
} & Base_Object_Data;



export const New_Custom_Object = (
	p: {
		get_game_state: () => Game_State,
		pixel_pos: Point2D,
		type_name: CustomObjectTypeName,
		creation_timestamp: number,
		should_remove: boolean,
		unique_id?: string,
		text?: string,
		delegate_state: Custom_Object_Delegate_States,
	}): Custom_Object_Data => {

	return {
		...New_Base_Object({
			get_game_state: p.get_game_state,
			pixel_pos: cloneDeep(p.pixel_pos),
			unique_id: p.unique_id,
			creation_timestamp: p.creation_timestamp,
			should_remove: p.should_remove,
		}),
		type_name: p.type_name,
		text: ƒ.if(p.text != undefined,
			p.text,
			''
		),
		delegate_state: Custom_Object_ƒ.cast_delegate_state(p.type_name, p.delegate_state),
	}
}

export const Custom_Object_ƒ = {
/*----------------------- basetype management -----------------------*/


	get_delegate: (type_name: CustomObjectTypeName): Custom_Object_Delegate => {
		return {
			shot: CO_Shot_ƒ,
			text_label: CO_Text_Label_ƒ,
			skull_icon: CO_Skull_Icon_ƒ,
		}[type_name];
	},

	cast_delegate_state: (type_name: CustomObjectTypeName, p: Custom_Object_Delegate_States): Custom_Object_Delegate_States => {
		return {
			shot: p as CO_Shot_State,
			text_label: p as {},
			skull_icon: p as {},
		}[type_name];
	},

/*----------------------- movement -----------------------*/
	get_current_mid_turn_tile_pos: (me: Base_Object_Data, TM: Tilemap_Manager): Point2D => (
		TM.convert_pixel_coords_to_tile_coords(me.pixel_pos)
	),

	process_single_frame: (me: Custom_Object_Data, _Tilemap_Manager: Tilemap_Manager, offset_in_ms: number): Custom_Object_Data => {


		const processed_object = Custom_Object_ƒ.get_delegate(me.type_name).process_single_frame(me.pixel_pos, me.get_game_state, me.delegate_state);

		return New_Custom_Object({
			get_game_state: me.get_game_state,
			pixel_pos: processed_object.pixel_pos,
			type_name: me.type_name,
			creation_timestamp: me.creation_timestamp,
			should_remove: ƒ.if( (offset_in_ms - me.creation_timestamp) > 900, true, false ),
			text: me.text,
			unique_id: me.unique_id,
			delegate_state: processed_object.delegate_state,
		})
	},

	yield_image: (me: Custom_Object_Data) => (
		Custom_Object_ƒ.get_delegate(me.type_name).yield_image()
	),

	yield_text: (me: Custom_Object_Data) => (
		me.text
	)
}

