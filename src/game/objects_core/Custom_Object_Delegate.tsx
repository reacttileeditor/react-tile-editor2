import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/Utils";

import { Tilemap_Manager, Direction } from "../core/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_State } from "../core/Game_View";


export type CustomObjectTypeName = 'shot';




export type Custom_Object_Delegate = {
	process_single_frame: (
		prior_pixel_pos: Point2D, 
		get_game_state: () => Game_State,	
	) => { pixel_pos: Point2D },

	yield_image: () => string,
}

const Custom_Object_Delegate_Base_ƒ: Custom_Object_Delegate = {
	process_single_frame: (
		prior_pixel_pos: Point2D, 
		get_game_state: () => Game_State,	
	): { pixel_pos: Point2D } => {

		const target = find( get_game_state().current_frame_state.creature_list, (val) => (
			val.type_name === 'hermit'
		));

		let addend = {x: 0, y: -1};

		if(target){
//			console.log(target.transient_state.pixel_pos)
			const target_pos = target.pixel_pos;

			addend = { x: (target_pos.x - prior_pixel_pos.x) / 50.0, y: (target_pos.y - prior_pixel_pos.y) / 50.0 }
		}


		return {
			pixel_pos: {x: prior_pixel_pos.x + addend.x, y: prior_pixel_pos.y + addend.y},
		}
	},


	yield_image: () => (
		'red_dot'
	)
}

export const CO_Shot_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	yield_image: () => 'red_dot',
}

