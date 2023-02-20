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

type CombinedObjectTypes = CustomObjectTypeName | CreatureTypeName

export class Base_Object {
	pixel_pos: Point2D;
	unique_id: string;
	type_name: CombinedObjectTypes;
	get_game_state: () => Game_State;




	constructor(p: {
		get_game_state: () => Game_State,
		pixel_pos: Point2D,
		type_name: CombinedObjectTypes,
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


	}

	get_current_mid_turn_tile_pos = (TM: Tilemap_Manager): Point2D => (
		TM.convert_pixel_coords_to_tile_coords(this.pixel_pos)
	)






}


