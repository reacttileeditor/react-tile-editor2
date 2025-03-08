

import { zorder } from "../../constants/zorder";
import { Change_Instance } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";
import * as Utils from "../../engine/Utils";



export type CO_Particle_System_State = {
	angle: number,
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
		const lifetime_tick = (tick - me.creation_timestamp);

		const spawnees: Array<Custom_Object_Data<unknown>> = [];

		if(lifetime_tick % 2 == 0){
			const spawn_angle = Utils.degrees_to_radians( Utils.dice(360) );
			const momentum = Utils.dice(20) / 15.0;

			spawnees.push(New_Custom_Object({
				accessors: Custom_Object_ƒ.get_accessors(me),
				pixel_pos: me.pixel_pos,
				type_name: 'particle',
				creation_timestamp: tick,
				text: ``,
				velocity: {x: momentum * Math.cos(spawn_angle), y: momentum * Math.cos(spawn_angle)},
				delegate_state: {},
			}));
		}		

		return {
			data: {
				...Custom_Object_ƒ.get_base_object_state(me),
				delegate_state: me.delegate_state,
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

