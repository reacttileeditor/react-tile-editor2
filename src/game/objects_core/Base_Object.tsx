import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/Utils";

import { Tilemap_Manager, Direction } from "../core/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_State } from "../core/Game_View";
import { CreatureType, CreatureTypeName } from "./Creature";
import { CustomObjectTypeName } from "./Custom_Object";
import { CustomObjectType } from "./Custom_Object_Base_Type";



export type Base_Object_Data = {
	//static values
	unique_id: string;

	//state	
	pixel_pos: Point2D;

	//accessors
	get_game_state: () => Game_State;
}

export const New_Base_Object = (
	p: {
		get_game_state: () => Game_State,
		pixel_pos: Point2D,
		unique_id?: string,
	}): Base_Object_Data => {

	return {
		//static values
		unique_id: ƒ.if(p.unique_id != undefined,
			p.unique_id,
			uuid()
		),

		//state	
		pixel_pos: {x:0, y: 0},  //TODO use TM

		//accessors
		get_game_state: p.get_game_state,
	}	
}



export const Base_Object_ƒ = {

	get_current_mid_turn_tile_pos: (me: Base_Object_Data, TM: Tilemap_Manager): Point2D => (
		TM.convert_pixel_coords_to_tile_coords(me.pixel_pos)
	)
}


