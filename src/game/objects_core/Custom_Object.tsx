import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/Utils";

import { Tilemap_Manager, Direction } from "../core/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_State } from "../core/Game_View";
import { CreatureTypeName } from "./Creature";
import { CustomObjectType, CO_Shot } from "./Custom_Object_Base_Type";
 

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



		//console.log(`old: ${this.pixel_pos.y}   new: ${newObj.pixel_pos.y}`)


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



