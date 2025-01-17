

import { zorder } from "../../constants/zorder";
import { Change_Instance } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object_Delegate";
import { Base_Object_ƒ } from "../../../objects_core/Base_Object";
import { Point2D } from "../../../interfaces";
import { cloneDeep } from "lodash";
import { angle_between, ƒ } from "../../engine/Utils";
import { Vals } from "../../constants/Constants";
import { Game_Manager_ƒ } from "../../engine/Game_Manager/Game_Manager";




export const CO_Text_Label_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data,
		tick: number,
	): {
		data: Custom_Object_Update,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data>,
	} => {



		let addend = {x: 0, y: 0};

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
	yield_asset: () => 'omit_image',
	yield_zorder: () => zorder.text,
	time_to_live: () => 70,

	
}

