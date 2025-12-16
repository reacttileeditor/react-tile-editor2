

import { zorder } from "../../constants/zorder";
import { Change_Instance, Creature_ƒ } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";
import { Gamespace_Pixel_Point, Point2D } from "../../../interfaces";
import { cloneDeep } from "lodash";
import { angle_between, ƒ } from "../../engine/Utils";
import { Vals } from "../../constants/Constants";
import { Game_Manager_ƒ } from "../../engine/Game_Manager/Game_Manager";
import { CO_Particle_System_State } from "./Particle_System";
import { Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { CO_Shot_Utils_ƒ } from "../Custom_Object_Utilities/Shot_Utils";



export type CO_Shot_State = {
	target_obj: string, //uuid
	source_obj: string,
	last_source_pos: Gamespace_Pixel_Point,
	last_target_pos: Gamespace_Pixel_Point,
}

export const CO_Shot_Magic_Missile_ƒ: Custom_Object_Delegate<CO_Shot_State> = {
	...Custom_Object_Delegate_Base_ƒ,

	process_single_frame: (
		me: Custom_Object_Data<CO_Shot_State>,
		tick: number,
		parent_object: Custom_Object_Data<unknown> | undefined,
	): {
		data: Custom_Object_Update<CO_Shot_State>,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => {
		const _prior_delegate_state = me.delegate_state;
		const GM = me.get_GM_instance();


		const target = Game_Manager_ƒ.get_creature_by_uuid( GM, _prior_delegate_state.target_obj );
		const source = Game_Manager_ƒ.get_creature_by_uuid( GM, _prior_delegate_state.source_obj );
		const lifetime_tick = (tick - me.creation_timestamp);

		const source_pos = CO_Shot_Utils_ƒ.get_shot_starting_pos_or_fallback_value(source, _prior_delegate_state.last_source_pos);
		const target_pos = CO_Shot_Utils_ƒ.get_pos_or_fallback_value(target, _prior_delegate_state.last_target_pos);





		const new_values = CO_Shot_Utils_ƒ.calculate_serpentine_shot_trajectory(
			me,
			lifetime_tick,
			source_pos,
			target_pos
		)




		const spawnees: Array<Custom_Object_Data<unknown>> = [];

		if(lifetime_tick == 1){
			spawnees.push(New_Custom_Object<CO_Particle_System_State>({
				accessors: Custom_Object_ƒ.get_accessors(me),
				pixel_pos: me.pixel_pos,
				type_name: 'particle_system',
				creation_timestamp: tick,
				text: ``,
				parent_id: me.unique_id,
				delegate_state: {
					spawn_rate_overflow: 0,
					particle_type_name: 'arcane',
				},
			}));
		}

		return {
			data: {
				...Custom_Object_ƒ.get_base_object_state(me),
				pixel_pos: new_values.pixel_pos,
				rotate: new_values.rotate,
				delegate_state: {
					...me.delegate_state,
					last_source_pos: source_pos,
					last_target_pos: target_pos
				},
			},
			change_list: [],
			spawnees: spawnees,
		}
	},
	//yield_asset: () => 'arrow_placeholder',
	yield_asset: () => 'arcane_shot',

	should_be_removed: (
		me: Custom_Object_Data<CO_Shot_State>,
		parent_object: Custom_Object_Data<unknown> | undefined,
		tick: number,
		offset_in_ms: number,
	) => {
		return ƒ.if( (tick - me.creation_timestamp) > Vals.shot_flight_duration, true, false )
	},



	do_upon_removal: (
		me: Custom_Object_Data<CO_Shot_State>,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	): {
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => {

		spawnees.push(New_Custom_Object({
			accessors: Custom_Object_ƒ.get_accessors(me),
			pixel_pos: me.pixel_pos,
			type_name: 'shot_magic_missile_explosion',
			creation_timestamp: tick,
			text: ``,
			parent_id: me.unique_id,
			delegate_state: {
			},
		}));

		console.error('do upon removal: magic missile ${tick}')
		return {
			change_list: change_list,
			spawnees: spawnees
		}
	},

}