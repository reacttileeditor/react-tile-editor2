import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/engine/Utils";

import { Direction } from "../core/engine/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { zorder } from "../core/constants/zorder";


export type CustomObjectTypeName = 'shot';

export type Custom_Object_Delegate_States = {} | CO_Shot_State;

export type CO_Shot_State = {
	target_obj: string, //uuid
	source_obj: string,
}



export type Custom_Object_Delegate = {
	process_single_frame: (
		prior_pixel_pos: Point2D,
		prior_rotation: number,
		GM: Game_Manager_Data,	
		prior_delegate_state: Custom_Object_Delegate_States,
	) => {
		pixel_pos: Point2D,
		rotate: number,
		delegate_state: Custom_Object_Delegate_States,
	},

	yield_image: () => string,
	yield_zorder: () => number,
}

const Custom_Object_Delegate_Base_ƒ: Custom_Object_Delegate = {
	process_single_frame: (
		prior_pixel_pos: Point2D, 
		prior_rotation: number,
		GM: Game_Manager_Data,		
		prior_delegate_state: Custom_Object_Delegate_States,
	): {
		pixel_pos: Point2D,
		rotate: number,
		delegate_state: Custom_Object_Delegate_States,
	} => {

		return {
			pixel_pos: prior_pixel_pos,
			rotate: prior_rotation,
			delegate_state: prior_delegate_state,
		}
	},

	yield_image: () => (
		'red_dot'
	),

	yield_zorder: () => (
		13
	),
}

export const CO_Shot_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		prior_pixel_pos: Point2D, 
		prior_rotation: number,
		GM: Game_Manager_Data,	
		prior_delegate_state: Custom_Object_Delegate_States,
	): {
		pixel_pos: Point2D,
		rotate: number,
		delegate_state: CO_Shot_State,
	} => {
		const _prior_delegate_state = prior_delegate_state as CO_Shot_State;


		const target = Game_Manager_ƒ.get_creature_by_uuid( GM, _prior_delegate_state.target_obj );
		const source = Game_Manager_ƒ.get_creature_by_uuid( GM, _prior_delegate_state.source_obj );


		let addend = {x: 0, y: 0};
		let rotate = prior_rotation;



		if(target){
			//console.log(target.pixel_pos)
			const target_pos = target.pixel_pos;
			const source_pos = source.pixel_pos;

			const angle = Math.atan2(  target_pos.y - prior_pixel_pos.y , target_pos.x - prior_pixel_pos.x )
			rotate = 90 + angle * 180 / Math.PI ;
			//const magnitude = 0.5;

			const magnitude = Math.hypot( (source_pos.x - target_pos.x), (source_pos.y - target_pos.y) ) / 30.0;

			addend = { x: magnitude * Math.cos(angle), y: magnitude * Math.sin(angle) }
		}

		return {
			pixel_pos: {x: prior_pixel_pos.x + addend.x, y: prior_pixel_pos.y + addend.y},
			rotate: rotate,
			delegate_state: _prior_delegate_state,
		}
	},
	yield_image: () => 'arrow_placeholder',
}

export const CO_Text_Label_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		prior_pixel_pos: Point2D, 
		prior_rotation: number,
		GM: Game_Manager_Data,	
		prior_delegate_state: Custom_Object_Delegate_States,
	): {
		pixel_pos: Point2D,
		rotate: number,
		delegate_state: {},
	} => {



		let addend = {x: 0, y: 0};

		return {
			pixel_pos: {x: prior_pixel_pos.x + addend.x, y: prior_pixel_pos.y + addend.y},
			rotate: prior_rotation,
			delegate_state: prior_delegate_state,
		}
	},
	yield_image: () => 'omit_image',
	yield_zorder: () => zorder.text,
}

export const CO_Skull_Icon_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		prior_pixel_pos: Point2D, 
		prior_rotation: number,
		GM: Game_Manager_Data,
		prior_delegate_state: Custom_Object_Delegate_States,
	): {
		pixel_pos: Point2D,
		rotate: number,
		delegate_state: {},
	} => {



		let addend = {x: 0, y: -1};

		return {
			pixel_pos: {x: prior_pixel_pos.x + addend.x, y: prior_pixel_pos.y + addend.y},
			rotate: prior_rotation,
			delegate_state: prior_delegate_state,
		}
	},
	yield_image: () => 'deaths_head',
}




export const CO_Hit_Star_BG_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		prior_pixel_pos: Point2D, 
		prior_rotation: number,
		GM: Game_Manager_Data,
		prior_delegate_state: Custom_Object_Delegate_States,
	): {
		pixel_pos: Point2D,
		rotate: number,
		delegate_state: {},
	} => {



		let addend = {x: 0, y: 0};

		return {
			pixel_pos: prior_pixel_pos,
			rotate: prior_rotation,
			delegate_state: prior_delegate_state,
		}
	},
	yield_image: () => 'hit_star',
	yield_zorder: () => zorder.fx,
}