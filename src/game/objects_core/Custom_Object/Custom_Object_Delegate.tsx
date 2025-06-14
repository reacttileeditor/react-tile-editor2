import React from "react";
import ReactDOM from "react-dom";
import _, { cloneDeep, find, map, range, size } from "lodash";
import { v4 as uuid } from "uuid";

import { angle_between, degrees_to_radians, dice, ƒ } from "../../core/engine/Utils";

import { Direction } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { Game_Manager_Data, Game_Manager_ƒ } from "../../core/engine/Game_Manager/Game_Manager";
import { zorder } from "../../core/constants/zorder";
import { Change_Instance } from "../Creature/Creature";
import { Base_Object_State, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { Vals } from "../../core/constants/Constants";
import { CO_Shot_State } from "../../core/data/Custom_Objects/Shot";
import { CO_Hit_Star_State } from "../../core/data/Custom_Objects/Hit_Star";
import { ms_to_ticks, ticks_to_ms } from "../../core/engine/Blit_Manager";
import { Image_Data_Names } from "../../core/data/Image_Data";


export type Custom_Object_Delegate_States = {} | CO_Shot_State | CO_Hit_Star_State;


export type Custom_Object_Update<Delegate_State_Type> = {
	delegate_state: Delegate_State_Type,
} & Base_Object_State;


export type Custom_Object_Delegate<Delegate_State_Type> = {
	process_single_frame: (
		me: Custom_Object_Data<Delegate_State_Type>,
		tick: number,
		parent_object: Custom_Object_Data<unknown> | undefined,
	) => {
		data: Custom_Object_Update<Delegate_State_Type>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	},

	_should_be_removed: (
		me: Custom_Object_Data<Delegate_State_Type>,
		parent_object: Custom_Object_Data<unknown> | undefined,
		tick: number,
		offset_in_ms: number,
	) => boolean,	
	
	should_be_removed: (
		me: Custom_Object_Data<Delegate_State_Type>,
		parent_object: Custom_Object_Data<unknown> | undefined,
		tick: number,
		offset_in_ms: number,
	) => boolean,

	yield_asset: () => Image_Data_Names,
	yield_zorder: () => number,
	time_to_live: () => number,

	should_remove_at_animation_end: (
		me: Custom_Object_Data<Delegate_State_Type>,
	) => boolean,
}





/*
	The Base_ƒ is basically a root class the other delegates inherit from.  I'm leery of inheritance here, but in practice most CODs don't need to redefine most of these values (it's conceivable pure physics objects could amount to nothing more than an asset name), so it makes sense to use a lightweight inheritance model.
*/
export const Custom_Object_Delegate_Base_ƒ: Custom_Object_Delegate<unknown> = {
	process_single_frame: (
		me: Custom_Object_Data<unknown>,
		tick: number,
		parent_object: Custom_Object_Data<unknown> | undefined,
	): {
		data: Custom_Object_Update<unknown>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => {

		return {
			data: {
				...Custom_Object_ƒ.get_base_object_state(me),
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},

	_should_be_removed: (
		me: Custom_Object_Data<unknown>,
		parent_object: Custom_Object_Data<unknown> | undefined,
		tick: number,
		offset_in_ms: number,
	) => {
		return (
			((tick - me.creation_timestamp) > Custom_Object_ƒ.get_delegate(me.type_name).time_to_live())
			||
			(
				Custom_Object_ƒ.get_delegate(me.type_name).should_remove_at_animation_end(me)
				&&
				ms_to_ticks(me.animation_length) <= (tick - me.creation_timestamp)
			)
			||
			Custom_Object_ƒ.get_delegate(me.type_name).should_be_removed(me, parent_object, tick, offset_in_ms)
		)
	},

	should_be_removed: (
		me: Custom_Object_Data<unknown>,
		parent_object: Custom_Object_Data<unknown> | undefined,
		tick: number,
		offset_in_ms: number,
	) => {


		return (
			false
		)
	},
	
	time_to_live: () => 300,

	
	yield_asset: () => (
		'red_dot'
	),

	yield_zorder: () => (
		zorder.characters
	),

	should_remove_at_animation_end: (me: Custom_Object_Data<unknown>) => (
		false
	),	
}





