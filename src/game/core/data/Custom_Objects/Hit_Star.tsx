

import { zorder } from "../../constants/zorder";
import { Change_Instance } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";
import { Base_Object_ƒ } from "../../../objects_core/Base_Object";
import { map, range } from "lodash";
import { degrees_to_radians, dice } from "../../engine/Utils";




export type CO_Hit_Star_State = {
	angle: number,
}



export const CO_Hit_Star_BG_ƒ: Custom_Object_Delegate<CO_Hit_Star_State> = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data<CO_Hit_Star_State>,
		tick: number,
	): {
		data: Custom_Object_Update<CO_Hit_Star_State>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => {
		const _prior_delegate_state = me.delegate_state as CO_Hit_Star_State;
		console.log('process hit star', _prior_delegate_state.angle)

		const local_tick = tick - me.creation_timestamp; 

		const spawnees = (local_tick == 0 ? map(range(3), (val) => (
				New_Custom_Object({
					accessors: Base_Object_ƒ.get_accessors(me),
					pixel_pos: me.pixel_pos,
					type_name: 'hit_spark',
					creation_timestamp: tick,
					velocity: {x:0, y:-7.5},
					accel: {x:0, y:1.0},
					delegate_state: {
						angle: _prior_delegate_state.angle + degrees_to_radians(-30 + dice(60))
					},
				})
			)
		) : []);


		let addend = {x: 0, y: 0};

		return {
			data: {
				...Custom_Object_ƒ.get_base_object_state(me),
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: spawnees,
		}
	},
	yield_asset: () => 'hit_star',
	yield_zorder: () => zorder.fx,
	time_to_live: () => 70,
}
