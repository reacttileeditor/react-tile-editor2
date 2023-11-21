import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, find } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/engine/Utils";

import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { CreatureTypeName } from "./Creature";
import { Custom_Object_Delegate, CO_Shot_ƒ, CO_Text_Label_ƒ, Custom_Object_Delegate_States, CO_Shot_State, CO_Skull_Icon_ƒ, CO_Hit_Star_BG_ƒ } from "./Custom_Object_Delegate";
import { Base_Object_Data, New_Base_Object } from "./Base_Object";
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { Blit_Manager_Data } from "../core/engine/Blit_Manager";
import { Asset_Manager_Data } from "../core/engine/Asset_Manager";
import { filter, map, without } from "ramda";
 

export type CustomObjectTypeName = 'shot' | 'text_label' | 'skull_icon';

export type Custom_Object_Data = {
	type_name: CustomObjectTypeName,
	text: string,
	delegate_state: Custom_Object_Delegate_States,
	scheduled_events: Array<Scheduled_Event>,
} & Base_Object_Data;

export type Scheduled_Event = {
	tick_offset: number,
	command: () => void,
}

export const New_Custom_Object = (
	p: {
		get_GM_instance: () => Game_Manager_Data;
		_Asset_Manager: () => Asset_Manager_Data,
		_Blit_Manager: () => Blit_Manager_Data,
		_Tilemap_Manager: () => Tilemap_Manager_Data,
		pixel_pos: Point2D,
		rotate: number,
		type_name: CustomObjectTypeName,
		creation_timestamp: number,
		should_remove: boolean,
		unique_id?: string,
		text?: string,
		scheduled_events?: Array<Scheduled_Event>,
		delegate_state: Custom_Object_Delegate_States,
	}): Custom_Object_Data => {

	return {
		...New_Base_Object({
			get_GM_instance: p.get_GM_instance,
			_Asset_Manager: p._Asset_Manager,
			_Blit_Manager: p._Blit_Manager,
			_Tilemap_Manager: p._Tilemap_Manager,
			pixel_pos: cloneDeep(p.pixel_pos),
			rotate: p.rotate,
			unique_id: p.unique_id,
			creation_timestamp: p.creation_timestamp,
			should_remove: p.should_remove,
		}),
		type_name: p.type_name,
		text: ƒ.if(p.text != undefined,
			p.text,
			''
		),
		scheduled_events: ƒ.if(p.scheduled_events != undefined,
			p.scheduled_events,
			[]
		),
		delegate_state: Custom_Object_ƒ.cast_delegate_state(p.type_name, p.delegate_state),
	}
}

export const Custom_Object_ƒ = {
/*----------------------- basetype management -----------------------*/


	get_delegate: (type_name: CustomObjectTypeName): Custom_Object_Delegate => {
		return {
			shot: CO_Shot_ƒ,
			text_label: CO_Text_Label_ƒ,
			skull_icon: CO_Skull_Icon_ƒ,
			hit_star_bg: CO_Hit_Star_BG_ƒ,
		}[type_name];
	},

	cast_delegate_state: (type_name: CustomObjectTypeName, p: Custom_Object_Delegate_States): Custom_Object_Delegate_States => {
		return {
			shot: p as CO_Shot_State,
			text_label: p as {},
			skull_icon: p as {},
			hit_star_bg: p as {},
		}[type_name];
	},

/*----------------------- movement -----------------------*/
	get_current_mid_turn_tile_pos: (me: Base_Object_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Point2D => (
		Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, me.pixel_pos)
	),

	process_single_frame: (me: Custom_Object_Data, _Tilemap_Manager: Tilemap_Manager_Data, offset_in_ms: number, tick: number): Custom_Object_Data => {


		const processed_object = Custom_Object_ƒ.get_delegate(me.type_name).process_single_frame(
			me.pixel_pos,
			me.rotate,
			me.get_GM_instance(),
			me.delegate_state,
			tick,
		);

		let scheduled_events = me.scheduled_events;
		
		let current_events = filter( (val)=>(
			val.tick_offset == tick
		), scheduled_events);

		map( (val)=>{
			val.command();
		}, current_events );

		scheduled_events = without( current_events, scheduled_events);

		return New_Custom_Object({
			get_GM_instance: me.get_GM_instance,
			_Asset_Manager: me._Asset_Manager,
			_Blit_Manager: me._Blit_Manager,
			_Tilemap_Manager: me._Tilemap_Manager,

			pixel_pos: processed_object.pixel_pos,
			rotate: processed_object.rotate,
			type_name: me.type_name,
			creation_timestamp: me.creation_timestamp,
			should_remove: ƒ.if( (offset_in_ms - me.creation_timestamp) > 900, true, false ),
			text: me.text,
			unique_id: me.unique_id,
			scheduled_events: scheduled_events,
			delegate_state: processed_object.delegate_state,
		})
	},

	yield_image: (me: Custom_Object_Data) => (
		Custom_Object_ƒ.get_delegate(me.type_name).yield_image()
	),

	yield_text: (me: Custom_Object_Data) => (
		me.text
	),

	yield_zorder: (me: Custom_Object_Data) => (
		Custom_Object_ƒ.get_delegate(me.type_name).yield_zorder()
	),
}

