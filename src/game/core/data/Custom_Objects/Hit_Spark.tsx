

import { zorder } from "../../constants/zorder";
import { Change_Instance } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";
import { Base_Object_ƒ } from "../../../objects_core/Base_Object";



export type CO_Hit_Spark_State = {
	angle: number,
}

export const CO_Hit_Spark_ƒ: Custom_Object_Delegate<CO_Hit_Spark_State> = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data<CO_Hit_Spark_State>,
		tick: number,
	): {
		data: Custom_Object_Update<CO_Hit_Spark_State>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => {
		const _prior_delegate_state = me.delegate_state;

		console.log('process hit spark', _prior_delegate_state.angle)
				
		const magnitude = 2.5;
		const gravity = 0;
		let addend = {
			x: Math.cos(_prior_delegate_state.angle) * magnitude,
			y: Math.sin(_prior_delegate_state.angle) * magnitude + gravity
		};


		return {
			data: {
				...Base_Object_ƒ.get_base_object_state(me),
				pixel_pos: {x: me.pixel_pos.x + addend.x, y: me.pixel_pos.y + addend.y},
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_asset: () => 'red_dot',
	yield_zorder: () => zorder.fx,
	time_to_live: () => 15,
}

