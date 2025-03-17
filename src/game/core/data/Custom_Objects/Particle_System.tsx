

import { zorder } from "../../constants/zorder";
import { Change_Instance } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";
import * as Utils from "../../engine/Utils";
import { map, range } from "ramda";
import { CO_Particle_State } from "./Particle";
import { size } from "lodash";


export type Particle_System_Data = {
	spawn_angle_width: number,
	spawn_rate: number,
	momentum: number,
	momentum_delta: number,
}

export const Particle_Type_Data: { [k: string]: Particle_System_Data } = {
	arcane: {
		spawn_angle_width: 360,
		spawn_rate: 0.2,
		momentum: 1/15,
		momentum_delta: 20,
	}
}

//type Particle_Types = { [k: string]: Particle_System_Data }

//export type Particle_Type_Names = keyof Particle_Types;
export type Particle_Type_Names = (keyof typeof Particle_Type_Data)

export type CO_Particle_System_State = {
	spawn_rate_overflow: number,
	particle_type_name: Particle_Type_Names,
}

export const CO_Particle_System_ƒ: Custom_Object_Delegate<CO_Particle_System_State> = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data<CO_Particle_System_State>,
		tick: number,
		parent_object: Custom_Object_Data<unknown> | undefined,
	): {
		data: Custom_Object_Update<CO_Particle_System_State>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => {

		const particle_data = Particle_Type_Data[me.delegate_state.particle_type_name];

		const spawnees: Array<Custom_Object_Data<unknown>> = [];
		const spawn_angle = Utils.degrees_to_radians( Utils.dice( particle_data.spawn_angle_width ) );
		const momentum = Utils.dice( particle_data.momentum_delta ) * particle_data.momentum;
		const spawn_rate = particle_data.spawn_rate; //per frame

		/*
			For the spawn rate, we need to be able to handle fractional values, because it turns out a hugely desirable problem space lies in the 0-2 particles-per-frame amount.   What we do is floor the value, and pass on the fractional part as an addend for the next frame's amount.
		*/
		const cumulative_spawn_amount = spawn_rate + me.delegate_state.spawn_rate_overflow;

		map( (val)=>{
			spawnees.push(New_Custom_Object({
				accessors: Custom_Object_ƒ.get_accessors(me),
				pixel_pos: me.pixel_pos,
				type_name: 'particle',
				creation_timestamp: tick,
				text: ``,
				velocity: {x: momentum * Math.cos(spawn_angle), y: momentum * Math.cos(spawn_angle)},
				delegate_state: {},
			}));
		}, range( 0, Math.floor(cumulative_spawn_amount) ) );

		return {
			data: {
				...Custom_Object_ƒ.get_base_object_state(me),
				delegate_state: {
					spawn_rate_overflow: cumulative_spawn_amount - Math.floor(cumulative_spawn_amount),
					particle_type_name: me.delegate_state.particle_type_name
				},
			},
			change_list: [],
			spawnees: spawnees,
		}
	},
	yield_asset: () => 'omit_image',
	yield_zorder: () => zorder.fx,
	time_to_live: () => 400,

	should_be_removed: (
		me: Custom_Object_Data<unknown>,
		parent_object,
		tick: number,
		offset_in_ms: number,
	) => {

		return (
			parent_object === undefined
		)
	},
}

