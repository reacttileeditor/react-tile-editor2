import React from "react";
import ReactDOM from "react-dom";
import _, { cloneDeep, find, map, range, size } from "lodash";
import { v4 as uuid } from "uuid";

import { angle_between, degrees_to_radians, dice, ƒ } from "../core/engine/Utils";

import { Direction } from "../core/engine/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { zorder } from "../core/constants/zorder";
import { ChangeInstance } from "./Creature";
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { Vals } from "../core/constants/Constants";
import { Base_Object_State, Base_Object_ƒ } from "./Base_Object";

export type CustomObjectTypeName = 'shot';

export type Custom_Object_Delegate_States = {} | CO_Shot_State | CO_Hit_Star_State;


export type Custom_Object_Update = {
	delegate_state: Custom_Object_Delegate_States,
} & Base_Object_State;


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
	time_to_live: () => number,
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
				...Base_Object_ƒ.get_base_object_state(me),
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
		return ƒ.if( (tick - me.creation_timestamp) > Custom_Object_ƒ.get_delegate(me.type_name).time_to_live(), true, false )
	},
	
	time_to_live: () => 300,

	
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

		let next_pos = cloneDeep(original_pos);

		let visual_rotate_angle = me.rotate;

		if(target){
			const target_pos = target.pixel_pos;
			const source_pos = source.pixel_pos;

			const angle = angle_between({source: original_pos, dest: target_pos});

			const magnitude = Math.hypot( (original_pos.x - target_pos.x), (original_pos.y - target_pos.y) ) / Vals.shot_flight_duration;


			const arcing_height = -40 * Math.sin( (lifetime_tick / Vals.shot_flight_duration) * Math.PI );






			const addend: Point2D = { x: lifetime_tick * magnitude * Math.cos(angle), y: lifetime_tick * magnitude * Math.sin(angle) + arcing_height }

			next_pos = {x: original_pos.x + addend.x, y: original_pos.y + addend.y}

			/*
				The calculations for the visual angle are a fair bit different, since we don't care about the final position, but rather, the position of the very next "key point"
			*/

			visual_rotate_angle = Math.atan2(  next_pos.y - prior_pos.y , next_pos.x - prior_pos.x )
			visual_rotate_angle = 90 + visual_rotate_angle * 180 / Math.PI ;
			console.error(visual_rotate_angle)

		}

		return {
			data: {
				...Base_Object_ƒ.get_base_object_state(me),
				pixel_pos: next_pos,
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
		return ƒ.if( (tick - me.creation_timestamp) > Vals.shot_flight_duration, true, false )
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
				...Base_Object_ƒ.get_base_object_state(me),
				pixel_pos: {x: me.pixel_pos.x + addend.x, y: me.pixel_pos.y + addend.y},
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_image: () => 'omit_image',
	yield_zorder: () => zorder.text,
	time_to_live: () => 70,

	
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
				...Base_Object_ƒ.get_base_object_state(me),
				pixel_pos: {x: me.pixel_pos.x + addend.x, y: me.pixel_pos.y + addend.y},
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_image: () => 'deaths_head',
}



export type CO_Hit_Star_State = {
	angle: number,
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
		const _prior_delegate_state = me.delegate_state as CO_Hit_Star_State;
		console.log('process hit star', _prior_delegate_state.angle)

		const local_tick = tick - me.creation_timestamp; 

		const spawnees = (local_tick == 0 ? map(range(3), (val) => (
				New_Custom_Object({
					accessors: Base_Object_ƒ.get_accessors(me),
					pixel_pos: me.pixel_pos,
					type_name: 'hit_spark' as CustomObjectTypeName,
					creation_timestamp: tick,
					velocity: {x:0, y:-7.5},
					accel: {x:0, y:1.0},
					delegate_state: {
						angle: _prior_delegate_state.angle + degrees_to_radians(-30 + dice(60))
					},
				})
			)
		) : []);


		let addend = {x: 0, y: 0};

		return {
			data: {
				...Base_Object_ƒ.get_base_object_state(me),
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: spawnees,
		}
	},
	yield_image: () => 'hit_star',
	yield_zorder: () => zorder.fx,
	time_to_live: () => 70,
}


export type CO_Hit_Spark_State = {
	angle: number,
}

export const CO_Hit_Spark_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data,
		tick: number,
	): {
		data: Custom_Object_Update,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>,
	} => {
		const _prior_delegate_state = me.delegate_state as CO_Hit_Star_State;

		console.log('process hit spark', _prior_delegate_state.angle)
				
		const magnitude = 2.5;
		const gravity = 0;
		let addend = {
			x: Math.cos(_prior_delegate_state.angle) * magnitude,
			y: Math.sin(_prior_delegate_state.angle) * magnitude + gravity
		};


		return {
			data: {
				...Base_Object_ƒ.get_base_object_state(me),
				pixel_pos: {x: me.pixel_pos.x + addend.x, y: me.pixel_pos.y + addend.y},
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_image: () => 'red_dot',
	yield_zorder: () => zorder.fx,
	time_to_live: () => 15,
}

