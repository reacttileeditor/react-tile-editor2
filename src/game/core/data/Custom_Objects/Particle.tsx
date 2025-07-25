

import { zorder } from "../../constants/zorder";
import { Change_Instance } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";



export type CO_Particle_State = {
	angle: number,
}

export const CO_Particle_ƒ: Custom_Object_Delegate<CO_Particle_State> = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data<CO_Particle_State>,
		tick: number,
		parent_object: Custom_Object_Data<unknown> | undefined,
	): {
		data: Custom_Object_Update<CO_Particle_State>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => {

		return {
			data: {
				...Custom_Object_ƒ.get_base_object_state(me),
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_asset: () => 'arcane_shot_particle',
	yield_zorder: () => zorder.fx,
	time_to_live: () => 1000,
	should_remove_at_animation_end: (me: Custom_Object_Data<unknown>) => (
		true
	),	

}

