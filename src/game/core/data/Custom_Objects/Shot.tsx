

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



export type CO_Shot_State = {
	target_obj: string, //uuid
	source_obj: string,
	original_pos: Point2D,
}

export const CO_Shot_ƒ: Custom_Object_Delegate = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data,
		tick: number,
	): {
		data: Custom_Object_Update,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data>,
	} => {
		const _prior_delegate_state = me.delegate_state as CO_Shot_State;
		const GM = me.get_GM_instance();
		const prior_pos = me.pixel_pos;
		const original_pos = _prior_delegate_state.original_pos;


		const target = Game_Manager_ƒ.get_creature_by_uuid( GM, _prior_delegate_state.target_obj );
		const source = Game_Manager_ƒ.get_creature_by_uuid( GM, _prior_delegate_state.source_obj );
		const lifetime_tick = (tick - me.creation_timestamp);

		let next_pos = cloneDeep(original_pos);

		let visual_rotate_angle = me.rotate;

		if(target){
			const target_pos = target.pixel_pos;
			const source_pos = source.pixel_pos;

			const angle = angle_between({source: original_pos, dest: target_pos});

			const magnitude = Math.hypot( (original_pos.x - target_pos.x), (original_pos.y - target_pos.y) ) / Vals.shot_flight_duration;


			const arcing_height = -40 * Math.sin( (lifetime_tick / Vals.shot_flight_duration) * Math.PI );






			const addend: Point2D = { x: lifetime_tick * magnitude * Math.cos(angle), y: lifetime_tick * magnitude * Math.sin(angle) + arcing_height }

			next_pos = {x: original_pos.x + addend.x, y: original_pos.y + addend.y}

			/*
				The calculations for the visual angle are a fair bit different, since we don't care about the final position, but rather, the position of the very next "key point"
			*/

			visual_rotate_angle = Math.atan2(  next_pos.y - prior_pos.y , next_pos.x - prior_pos.x )
			visual_rotate_angle = 90 + visual_rotate_angle * 180 / Math.PI ;
			console.error(visual_rotate_angle)

		}

		return {
			data: {
				...Base_Object_ƒ.get_base_object_state(me),
				pixel_pos: next_pos,
				rotate: visual_rotate_angle,
				delegate_state: _prior_delegate_state,
			},
			change_list: [],
			spawnees: [],
		}
	},
	yield_asset: () => 'arrow_placeholder',

	should_be_removed: (
		me: Custom_Object_Data,
		tick: number,
		offset_in_ms: number,
	) => {
		return ƒ.if( (tick - me.creation_timestamp) > Vals.shot_flight_duration, true, false )
	},

}