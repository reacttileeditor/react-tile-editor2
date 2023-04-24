import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/Utils";

import { Tilemap_Manager, Direction } from "../core/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_Manager_Data } from "../core/Game_Manager";



export type Base_Object_Data = {
	//static values
	unique_id: string;
	creation_timestamp: number,

	//state	
	pixel_pos: Point2D;
	should_remove: boolean,

	//accessors
	GM: Game_Manager_Data;
}

export const New_Base_Object = (
	p: {
		GM: Game_Manager_Data,
		creation_timestamp: number,
		should_remove: boolean,
		pixel_pos?: Point2D,
		unique_id?: string,
	}): Base_Object_Data => {

	return {
		//static values
		unique_id: ƒ.if(p.unique_id != undefined,
			p.unique_id,
			uuid()
		),
		creation_timestamp: p.creation_timestamp,
		should_remove: p.should_remove,
		
		//state	
		pixel_pos: ƒ.if(p.pixel_pos != undefined,
			p.pixel_pos,
			{x:0, y: 0}
		),  //TODO use TM

		//accessors
		GM: p.GM,
	}	
}



export const Base_Object_ƒ = {

	get_current_mid_turn_tile_pos: (me: Base_Object_Data, TM: Tilemap_Manager): Point2D => (
		TM.convert_pixel_coords_to_tile_coords(me.pixel_pos)
	)
}


