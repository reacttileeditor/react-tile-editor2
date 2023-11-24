import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/engine/Utils";

import { Direction } from "../core/engine/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { zorder } from "../core/constants/zorder";
import { ChangeInstance } from "./Creature";
import { Custom_Object_Data } from "./Custom_Object";


export type CustomObjectTypeName = 'shot';

export type Custom_Object_Delegate_States = {} | CO_Shot_State;


export type Custom_Object_Update = {
	pixel_pos: Point2D,
	rotate: number,
	delegate_state: Custom_Object_Delegate_States,
}


export type Custom_Object_Delegate = {
	process_single_frame: (
		me: Custom_Object_Data,
		tick: number,
	) => {
		data: Custom_Object_Update,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>,
	},

	should_be_removed: (
		me: Custom_Object_Data,
		tick: number,
		offset_in_ms: number,
	) => boolean,

	yield_image: () => string,
	yield_zorder: () => number,
}

const Custom_Object_Delegate_Base_ƒ: Custom_Object_Delegate = {
	process_single_frame: (
		me: Custom_Object_Data,
		tick: number,
	): {
		data: Custom_Object_Update,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>,
	} => {

		return {
			data: {
				pixel_pos: me.pixel_pos,
				rotate: me.rotate,
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},

	should_be_removed: (
		me: Custom_Object_Data,
		tick: number,
		offset_in_ms: number,
	) => {
		return ƒ.if( (tick - me.creation_timestamp) > 300, true, false )
	},
	
	
	yield_image: () => (
		'red_dot'
	),

	yield_zorder: () => (
		13
	),
}


export type CO_Shot_State = {
	target_obj: string, //uuid
	source_obj: string,
	original_pos: Point2D,
}

export const CO_Shot_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data,
		tick: number,
	): {
		data: Custom_Object_Update,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>,
	} => {
		const _prior_delegate_state = me.delegate_state as CO_Shot_State;
		const GM = me.get_GM_instance();
		const prior_pos = me.pixel_pos;
		const original_pos = _prior_delegate_state.original_pos;


		const target = Game_Manager_ƒ.get_creature_by_uuid( GM, _prior_delegate_state.target_obj );
		const source = Game_Manager_ƒ.get_creature_by_uuid( GM, _prior_delegate_state.source_obj );
		const lifetime_tick = (tick - me.creation_timestamp);

		let addend = {x: 0, y: 0};

		let visual_rotate_angle = me.rotate;

		if(target){
			//console.log(target.pixel_pos)
			const target_pos = target.pixel_pos;
			const source_pos = source.pixel_pos;

			const angle = Math.atan2(  target_pos.y - original_pos.y , target_pos.x - original_pos.x )
			//const magnitude = 0.5;

			const magnitude = Math.hypot( (original_pos.x - target_pos.x), (original_pos.y - target_pos.y) ) / 100.0;


			const arcing_height = -40 * Math.sin( (lifetime_tick / 100) * Math.PI );

			visual_rotate_angle = Math.atan2(  target_pos.y - prior_pos.y , target_pos.x - prior_pos.x )
			visual_rotate_angle = 90 + visual_rotate_angle * 180 / Math.PI ;
			console.error(visual_rotate_angle)

			addend = { x: lifetime_tick * magnitude * Math.cos(angle), y: lifetime_tick * magnitude * Math.sin(angle) + arcing_height }
		}

		return {
			data: {
				pixel_pos: {x: original_pos.x + addend.x, y: original_pos.y + addend.y},
				rotate: visual_rotate_angle,
				delegate_state: _prior_delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_image: () => 'arrow_placeholder',

	should_be_removed: (
		me: Custom_Object_Data,
		tick: number,
		offset_in_ms: number,
	) => {
		return ƒ.if( (tick - me.creation_timestamp) > 100, true, false )
	},

}

export const CO_Text_Label_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data,
		tick: number,
	): {
		data: Custom_Object_Update,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>,
	} => {



		let addend = {x: 0, y: 0};

		return {
			data: {
				pixel_pos: {x: me.pixel_pos.x + addend.x, y: me.pixel_pos.y + addend.y},
				rotate: me.rotate,
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_image: () => 'omit_image',
	yield_zorder: () => zorder.text,
}

export const CO_Skull_Icon_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data,
		tick: number,
	): {
		data: Custom_Object_Update,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>,
	} => {



		let addend = {x: 0, y: -1};

		return {
			data: {
				pixel_pos: {x: me.pixel_pos.x + addend.x, y: me.pixel_pos.y + addend.y},
				rotate: me.rotate,
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_image: () => 'deaths_head',
}




export const CO_Hit_Star_BG_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data,
		tick: number,
	): {
		data: Custom_Object_Update,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>,
	} => {



		let addend = {x: 0, y: 0};

		return {
			data: {
				pixel_pos: me.pixel_pos,
				rotate: me.rotate,
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_image: () => 'hit_star',
	yield_zorder: () => zorder.fx,
}