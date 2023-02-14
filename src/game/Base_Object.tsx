import React from "react";
import ReactDOM from "react-dom";
import _, { find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "./Utils";

import { Tilemap_Manager, Direction } from "./Tilemap_Manager";

import { Point2D, Rectangle } from './interfaces';
import { Game_State } from "./Game_View";
import { CreatureType, CreatureTypeName } from "./Creature";
import { CustomObjectType, CustomObjectTypeName } from "./Custom_Object";

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









}


