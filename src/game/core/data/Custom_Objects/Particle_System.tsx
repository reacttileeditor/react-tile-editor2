

import { zorder } from "../../constants/zorder";
import { Change_Instance } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";



export type CO_Particle_System_State = {
	angle: number,
}

export const CO_Particle_System_ƒ: Custom_Object_Delegate<CO_Particle_System_State> = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data<CO_Particle_System_State>,
		tick: number,
	): {
		data: Custom_Object_Update<CO_Particle_System_State>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => {
		const lifetime_tick = (tick - me.creation_timestamp);

		const spawnees: Array<Custom_Object_Data<unknown>> = [];

		if(lifetime_tick % 10 == 0){
			spawnees.push(New_Custom_Object({
				accessors: Custom_Object_ƒ.get_accessors(me),
				pixel_pos: me.pixel_pos,
				type_name: 'particle',
				creation_timestamp: tick,
				text: ``,
				velocity: {x: 1.5, y: 1.5},
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
	yield_asset: () => 'deaths_head',
	yield_zorder: () => zorder.fx,
	time_to_live: () => 400,
}

