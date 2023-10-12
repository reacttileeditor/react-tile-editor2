import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Game_Manager_Data } from "../core/engine/Game_Manager";
import { Blit_Manager_Data } from "../core/engine/Blit_Manager";
import { Asset_Manager_Data } from "../core/engine/Asset_Manager";



export type Base_Object_Data = {
	//static values
	unique_id: string;
	creation_timestamp: number,

	//state	
	pixel_pos: Point2D;
	rotate: number,
	should_remove: boolean,

	//accessors
	get_GM_instance: () => Game_Manager_Data;
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
}

export const New_Base_Object = (
	p: {
		get_GM_instance: () => Game_Manager_Data;
		_Asset_Manager: () => Asset_Manager_Data,
		_Blit_Manager: () => Blit_Manager_Data,
		_Tilemap_Manager: () => Tilemap_Manager_Data,
	

		creation_timestamp: number,
		should_remove: boolean,
		pixel_pos?: Point2D,
		rotate?: number,
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
		rotate: ƒ.if(p.rotate != undefined,
			p.rotate,
			0
		), 


		//accessors
		get_GM_instance: p.get_GM_instance,
		_Asset_Manager: p._Asset_Manager,
		_Blit_Manager: p._Blit_Manager,
		_Tilemap_Manager: p._Tilemap_Manager,

	}	
}



export const Base_Object_ƒ = {

	get_current_mid_turn_tile_pos: (me: Base_Object_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Point2D => (
		Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, me.pixel_pos)
	)
}


