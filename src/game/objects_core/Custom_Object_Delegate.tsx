import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/Utils";

import { Tilemap_Manager, Direction } from "../core/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_State } from "../core/Game_View";


export type CustomObjectTypeName = 'shot';

export type CO_Shot_State = {
	target_obj: string, //uuid
	source_obj: string,
}



export type Custom_Object_Delegate = {
	process_single_frame: (
		prior_pixel_pos: Point2D, 
		get_game_state: () => Game_State,	
	) => { pixel_pos: Point2D },

	new_state: unknown,

	yield_image: () => string,
}

const Custom_Object_Delegate_Base_ƒ: Custom_Object_Delegate = {
	process_single_frame: (
		prior_pixel_pos: Point2D, 
		get_game_state: () => Game_State,	
	): { pixel_pos: Point2D } => {

		return {
			pixel_pos: prior_pixel_pos
		}
	},

	new_state: () => null,

	yield_image: () => (
		'red_dot'
	)
}

export const CO_Shot_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	new_state: (p: {target_obj: string, source_obj: string}): CO_Shot_State => ({
		...p
	}),

	process_single_frame: (
		prior_pixel_pos: Point2D, 
		get_game_state: () => Game_State,	
	): { pixel_pos: Point2D } => {

		const target = find( get_game_state().current_frame_state.creature_list, (val) => (
			val.type_name === 'hermit'
		));

		let addend = {x: 0, y: -1};

		if(target){
			//console.log(target.pixel_pos)
			const target_pos = target.pixel_pos;

			addend = { x: (target_pos.x - prior_pixel_pos.x) / 50.0, y: (target_pos.y - prior_pixel_pos.y) / 50.0 }
		}

		return {
			pixel_pos: {x: prior_pixel_pos.x + addend.x, y: prior_pixel_pos.y + addend.y},
		}
	},
	yield_image: () => 'attack_icon',
}

export const CO_Text_Label_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		prior_pixel_pos: Point2D, 
		get_game_state: () => Game_State,	
	): { pixel_pos: Point2D } => {



		let addend = {x: 0, y: -1};

		return {
			pixel_pos: {x: prior_pixel_pos.x + addend.x, y: prior_pixel_pos.y + addend.y},
		}
	},
	yield_image: () => 'omit_image',
}

