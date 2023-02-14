import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "./Utils";

import { Tilemap_Manager, Direction } from "./Tilemap_Manager";

import { Point2D, Rectangle } from './interfaces';
import { Game_State } from "./Game_View";
import { CreatureTypeName } from "./Creature";


export type CustomObjectTypeName = 'shot';

export class Custom_Object {
	pixel_pos: Point2D;
	unique_id: string;
	type_name: CustomObjectTypeName;
	basetype_delegate: CustomObjectType;
	get_game_state: () => Game_State;




	constructor(p: {
		get_game_state: () => Game_State,
		pixel_pos: Point2D,
		type_name: CustomObjectTypeName,
		unique_id?: string,
	}) {
		this.pixel_pos = p.pixel_pos;
		this.type_name = p.type_name;
		this.get_game_state = p.get_game_state;

		
		if(p.unique_id != undefined){
			this.unique_id = p.unique_id;
		} else {
			this.unique_id = uuid();
		}

		this.basetype_delegate = this.instantiate_basetype_delegate();

	}






/*----------------------- basetype management -----------------------*/
	instantiate_basetype_delegate = ():CustomObjectType => (
		{
			shot: new CO_Shot(),
		}[this.type_name]
	)


	// get_info = ():CreatureType => (
	// 	this.creature_basetype_delegate
	// )


/*----------------------- movement -----------------------*/


	process_single_frame = (_Tilemap_Manager: Tilemap_Manager, offset_in_ms: number): Custom_Object => {

		let newObj = _.cloneDeep(this);



		console.log(`old: ${this.pixel_pos.y}   new: ${newObj.pixel_pos.y}`)


		return new Custom_Object({
			get_game_state: this.get_game_state,
			pixel_pos: this.basetype_delegate.process_single_frame(this.pixel_pos, this.get_game_state).pixel_pos,
			type_name: this.type_name,
			unique_id: this.unique_id
		})
	}

	yield_image = () => (
		this.basetype_delegate.yield_image()
	)

}




export type CustomObjectType = CO_Shot;


class Custom_Object_Base_Type {

	process_single_frame = (
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
	}


	yield_image = () => (
		'red_dot'
	)
}

class CO_Shot extends Custom_Object_Base_Type {

	yield_image = () => (
		'red_dot'
	)
}