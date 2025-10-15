

import { zorder } from "../../constants/zorder";
import { Change_Instance } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";
import { Gamespace_Pixel_Point } from "../../../interfaces";


export const CO_Skull_Icon_ƒ: Custom_Object_Delegate<{}> = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data<{}>,
		tick: number,
		parent_object: Custom_Object_Data<unknown> | undefined,
	): {
		data: Custom_Object_Update<{}>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => {



		let addend = {x: 0, y: -1};

		return {
			data: {
				...Custom_Object_ƒ.get_base_object_state(me),
				pixel_pos: {x: me.pixel_pos.x + addend.x, y: me.pixel_pos.y + addend.y} as Gamespace_Pixel_Point,
				delegate_state: me.delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_asset: () => 'deaths_head',
}
