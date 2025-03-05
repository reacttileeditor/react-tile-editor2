import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, find, size } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../../core/engine/Utils";

import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { Change_Instance, Creature_Type_Name } from "../Creature/Creature";
import { Custom_Object_Delegate, Custom_Object_Delegate_States} from "./Custom_Object_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../../core/engine/Game_Manager/Game_Manager";
import { Blit_Manager_Data } from "../../core/engine/Blit_Manager";
import { Asset_Manager_Data } from "../../core/engine/Asset_Manager/Asset_Manager";
import { filter, isEmpty, map, without } from "ramda";
import { CO_Shot_State, CO_Shot_ƒ } from "../../core/data/Custom_Objects/Shot";
import { CO_Text_Label_ƒ } from "../../core/data/Custom_Objects/Text_Label";
import { CO_Skull_Icon_ƒ } from "../../core/data/Custom_Objects/Skull_Icon";
import { CO_Hit_Star_BG_ƒ, CO_Hit_Star_State } from "../../core/data/Custom_Objects/Hit_Star";
import { CO_Hit_Spark_State, CO_Hit_Spark_ƒ } from "../../core/data/Custom_Objects/Hit_Spark";
import { Custom_Object_ƒ_Accessors } from "./Accessors";
import { Custom_Object_ƒ_Processing } from "./Processing";
import { CO_Particle_System_ƒ } from "../../core/data/Custom_Objects/Particle_System";
import { CO_Particle_ƒ } from "../../core/data/Custom_Objects/Particle";
 

export type Custom_Object_Type_Name = 'shot' | 'text_label' | 'skull_icon' | 'hit_star_bg' | 'hit_spark' | 'particle_system' | 'particle' ;

export type Custom_Object_Data<Delegate_State_Type> = {
	type_name: Custom_Object_Type_Name,
	text: string,
	delegate_state: Delegate_State_Type,
	scheduled_events: Array<Scheduled_Event>,
} & Base_Object_Statics &
Base_Object_State &
Base_Object_Accessors;

export type Scheduled_Event = {
	tick_offset: number,
	command: (
		change_list_inner: Array<Change_Instance>,
		spawnees_: Array<Custom_Object_Data<unknown>>,
	) => void,
}

/*----------------------- base values -----------------------*/

export type Base_Object_Data = 
	Base_Object_Statics &
	Base_Object_State &
	Base_Object_Accessors;

export type Base_Object_Statics = {
	creation_timestamp: number,
	unique_id: string;
	parent_id?: string;
}

export type Base_Object_State = {
	pixel_pos: Point2D;
	rotate: number,
	should_remove: boolean,
	is_done_with_turn: boolean,
	velocity: Point2D,
	accel: Point2D,
}

export type Base_Object_Accessors = {
	get_GM_instance: () => Game_Manager_Data;
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
} 




export const New_Custom_Object = <Delegate_State_Type>(
	p: {
		accessors: Base_Object_Accessors,
		//base object statics
		creation_timestamp?: number,
		unique_id?: string,
		parent_id?: string,

		//base object state
		pixel_pos?: Point2D,
		should_remove?: boolean,
		is_done_with_turn?: boolean,
		rotate?: number,
		velocity?: Point2D,
		accel?: Point2D, 

		type_name: Custom_Object_Type_Name,
		text?: string,
		scheduled_events?: Array<Scheduled_Event>,
		delegate_state: Delegate_State_Type,
	}
): Custom_Object_Data<Delegate_State_Type> => {

	return {
		//accessors
		get_GM_instance: p.accessors.get_GM_instance,
		_Asset_Manager: p.accessors._Asset_Manager,
		_Blit_Manager: p.accessors._Blit_Manager,
		_Tilemap_Manager: p.accessors._Tilemap_Manager,

		//static values
		creation_timestamp: p.creation_timestamp ?? 0,
		unique_id: p.unique_id ?? uuid(),
		parent_id: p.parent_id ?? undefined,

		//state	
		pixel_pos: cloneDeep(p.pixel_pos) ?? {x:0, y: 0},  //TODO use TM
		should_remove: p.should_remove ?? false,
		is_done_with_turn: p.is_done_with_turn ?? false,	
		rotate: p.rotate ?? 0,
		velocity: cloneDeep(p.velocity) ?? {x: 0, y: 0},
		accel: cloneDeep(p.accel) ?? {x: 0, y: 0},


		type_name: p.type_name,
		text: p.text ?? '',
		scheduled_events: ƒ.if(p.scheduled_events != undefined,
			p.scheduled_events,
			[]
		),
		delegate_state: p.delegate_state,
	}
}

export const Custom_Object_ƒ = {
	...Custom_Object_ƒ_Accessors,
	...Custom_Object_ƒ_Processing,
	
/*----------------------- basetype management -----------------------*/


	/*
		A huge architectural feature of Custom_Objects is that there's a broad layer of universal functionality.

		All -UNIQUE- functionality, instead of being provided via inheritance, is provided via a delegate pattern; there's a sidecar/assistant object called a "delegate", and it supplies all of the specific behavior like what graphics a CO uses, how it moves, whether it has effects on things in-game (like a projectile dealing damage to a victim, etc, etc).

		The reason for this choice is that virtually all of this behavior would be additive; rather than replacing a broad swath of the behavior inside a Custom Object.  95% of the behavior/inherited-code would remain the same.  We've cordoned off that 5% that "might change", and established it as "delegate code".  Said delegate code -does- use inheritance from a base type, since for these delegates, they almost always replace the code in question rather than adding new functions.
	*/
	get_delegate: (type_name: Custom_Object_Type_Name): Custom_Object_Delegate<any> => {
		return {
			shot: CO_Shot_ƒ,
			text_label: CO_Text_Label_ƒ,
			skull_icon: CO_Skull_Icon_ƒ,
			hit_star_bg: CO_Hit_Star_BG_ƒ,
			hit_spark: CO_Hit_Spark_ƒ,
			particle_system: CO_Particle_System_ƒ,
			particle: CO_Particle_ƒ,
		}[type_name];
	},





}

