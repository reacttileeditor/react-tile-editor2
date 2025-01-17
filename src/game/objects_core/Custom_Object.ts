import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, find, size } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/engine/Utils";

import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Change_Instance, Creature_Type_Name } from "./Creature/Creature";
import { Custom_Object_Delegate, Custom_Object_Delegate_States} from "./Custom_Object_Delegate";
import { Base_Object_Accessors, Base_Object_Data, Base_Object_State, Base_Object_Statics, Base_Object_ƒ, New_Base_Object } from "./Base_Object";
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager/Game_Manager";
import { Blit_Manager_Data } from "../core/engine/Blit_Manager";
import { Asset_Manager_Data } from "../core/engine/Asset_Manager/Asset_Manager";
import { filter, isEmpty, map, without } from "ramda";
import { CO_Shot_State, CO_Shot_ƒ } from "../core/data/Custom_Objects/Shot";
import { CO_Text_Label_ƒ } from "../core/data/Custom_Objects/Text_Label";
import { CO_Skull_Icon_ƒ } from "../core/data/Custom_Objects/Skull_Icon";
import { CO_Hit_Star_BG_ƒ, CO_Hit_Star_State } from "../core/data/Custom_Objects/Hit_Star";
import { CO_Hit_Spark_State, CO_Hit_Spark_ƒ } from "../core/data/Custom_Objects/Hit_Spark";
 

export type Custom_Object_Type_Name = 'shot' | 'text_label' | 'skull_icon' | 'hit_star_bg' | 'hit_spark' ;

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



export const New_Custom_Object = <Delegate_State_Type>(
	p: {
		accessors: Base_Object_Accessors,
		//base object statics
		creation_timestamp?: number,
		unique_id?: string,

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
		unique_id: p.unique_id ?? uuid(),
		creation_timestamp: p.creation_timestamp ?? 0,

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
/*----------------------- basetype management -----------------------*/
	get_accessors: (me: Base_Object_Data): Base_Object_Accessors => ({
		get_GM_instance: me.get_GM_instance,
		_Asset_Manager: me._Asset_Manager,
		_Blit_Manager: me._Blit_Manager,
		_Tilemap_Manager: me._Tilemap_Manager,
	}),


	get_delegate: (type_name: Custom_Object_Type_Name): Custom_Object_Delegate<any> => {
		return {
			shot: CO_Shot_ƒ,
			text_label: CO_Text_Label_ƒ,
			skull_icon: CO_Skull_Icon_ƒ,
			hit_star_bg: CO_Hit_Star_BG_ƒ,
			hit_spark: CO_Hit_Spark_ƒ,
		}[type_name];
	},

	cast_delegate_state: (type_name: Custom_Object_Type_Name, p: unknown): Custom_Object_Delegate_States => {
		return {
			shot: p as CO_Shot_State,
			text_label: p as {},
			skull_icon: p as {},
			hit_star_bg: p as CO_Hit_Star_State,
			hit_spark: p as CO_Hit_Spark_State,
		}[type_name];
	},

	get_delegate_state: (me: Custom_Object_Data<unknown>) => {
		return Custom_Object_ƒ.cast_delegate_state(me.type_name, me.delegate_state)
	},

/*----------------------- movement -----------------------*/
	get_current_mid_turn_tile_pos: (me: Base_Object_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Point2D => (
		Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, me.pixel_pos)
	),

	process_single_frame: (me: Custom_Object_Data<unknown>, _Tilemap_Manager: Tilemap_Manager_Data, offset_in_ms: number, tick: number): {
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
		new_object: Custom_Object_Data<unknown>
	} => {

		if( me.accel.y !== 0){
			//debugger;
		}
		const me_after_physics = {
			...me,
			...Base_Object_ƒ.process_physics(me),
		};
		if( me.accel.y !== 0){
			//debugger;
		}

		const processed_results = Custom_Object_ƒ.get_delegate(me_after_physics.type_name).process_single_frame(
			me_after_physics,
			tick,
		);

		const processed_data = processed_results.data;

		const change_list: Array<Change_Instance> = processed_results.change_list;
		const spawnees: Array<Custom_Object_Data<unknown>> = processed_results.spawnees;

		let scheduled_events = me_after_physics.scheduled_events;
		
		let current_events = filter( (val)=>(
			val.tick_offset == tick
		), scheduled_events);

		map( (val)=>{
			val.command(change_list, spawnees);

			console.warn( change_list, spawnees )
		}, current_events );


		scheduled_events = without( current_events, scheduled_events);




		const final_values = { 
			change_list: change_list,
			spawnees: spawnees,
			new_object: New_Custom_Object({
				accessors: Custom_Object_ƒ.get_accessors(me),

				pixel_pos: processed_data.pixel_pos,
				velocity: processed_data.velocity,
				accel: processed_data.accel,
				rotate: processed_data.rotate,
				type_name: me.type_name,
				is_done_with_turn: false, //isEmpty(scheduled_events),
				creation_timestamp: me.creation_timestamp,
				should_remove: Custom_Object_ƒ.get_delegate(me.type_name).should_be_removed(
					me,
					tick,
					offset_in_ms
				),
				text: me.text,
				unique_id: me.unique_id,
				scheduled_events: scheduled_events,
				delegate_state: processed_data.delegate_state,
			})
		}

		return final_values;
	},

	yield_asset: (me: Custom_Object_Data<unknown>) => (
		Custom_Object_ƒ.get_delegate(me.type_name).yield_asset()
	),

	yield_text: (me: Custom_Object_Data<unknown>) => (
		me.text
	),

	yield_zorder: (me: Custom_Object_Data<unknown>) => (
		Custom_Object_ƒ.get_delegate(me.type_name).yield_zorder()
	),
}

