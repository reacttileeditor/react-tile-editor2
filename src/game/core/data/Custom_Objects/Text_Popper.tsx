

import { zorder } from "../../constants/zorder";
import { Change_Instance } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";
import { Gamespace_Pixel_Point, Point2D } from "../../../interfaces";
import { cloneDeep } from "lodash";
import { angle_between, ƒ } from "../../engine/Utils";
import { Vals } from "../../constants/Constants";
import { Game_Manager_ƒ } from "../../engine/Game_Manager/Game_Manager";
import * as Utils from "../../engine/Utils";




export const CO_Text_Popper_ƒ: Custom_Object_Delegate<{}> = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data<{}>,
		tick: number,
		parent_object: Custom_Object_Data<unknown> | undefined,
	): {
		data: Custom_Object_Update<{}>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<{}>>,
	} => {
		const impetus_angle = Utils.degrees_to_radians( Utils.dice(30) - 15 - 90 );
		const magnitude = 2 + Utils.dice(10) / 10.0;

		const velocity = (tick == me.creation_timestamp) ?
			{
				x: magnitude * Math.cos(impetus_angle),
				y: magnitude * Math.sin(impetus_angle)
			} : {
				x: me.velocity.x * 0.90,
				y: me.velocity.y * 0.90
			};




		//		const addend: Point2D = { x: lifetime_tick * magnitude * Math.cos(angle_to_target), y: lifetime_tick * magnitude * Math.sin(angle_to_target) + arcing_height }

		//let addend = {x: magnitude * Math.sin(impetus_angle), y: magnitude * Math.cos(impetus_angle) };
		let addend = {x: 0, y: 0 };

		return {
			data: {
				...Custom_Object_ƒ.get_base_object_state(me),
				pixel_pos: {x: me.pixel_pos.x + addend.x, y: me.pixel_pos.y + addend.y} as Gamespace_Pixel_Point,
				delegate_state: me.delegate_state,
				velocity: velocity,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_asset: () => 'omit_image',
	yield_zorder: () => zorder.hp_text,
	time_to_live: () => 70,

	
}

