

import { zorder } from "../../constants/zorder";
import { Change_Instance, Creature_ƒ } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../../../objects_core/Custom_Object/Custom_Object";
import { Custom_Object_Delegate, Custom_Object_Delegate_Base_ƒ, Custom_Object_Update } from "../../../objects_core/Custom_Object/Custom_Object_Delegate";
import { Gamespace_Pixel_Point, Point2D } from "../../../interfaces";
import { cloneDeep } from "lodash";
import { angle_between, is_even, is_odd, modulo, radians_to_degrees, ƒ } from "../../engine/Utils";
import { Vals } from "../../constants/Constants";
import { Game_Manager_ƒ } from "../../engine/Game_Manager/Game_Manager";
import { CO_Particle_System_State } from "./Particle_System";
import { Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { CO_Shot_Utils_ƒ } from "../Custom_Object_Utilities/Shot_Utils";
import { CO_Shot_State } from "./Shot";




export const CO_Shot_Javelin_ƒ: Custom_Object_Delegate<CO_Shot_State> = {
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
		const source_body_pos = CO_Shot_Utils_ƒ.get_pos_or_fallback_value(source, _prior_delegate_state.last_source_body_pos);
		const target_pos = CO_Shot_Utils_ƒ.get_pos_or_fallback_value(target, _prior_delegate_state.last_target_pos);





		const new_values = CO_Shot_Utils_ƒ.calculate_arcing_shot_trajectory(
			me,
			lifetime_tick,
			source_pos,
			target_pos
		)



		const spawnees: Array<Custom_Object_Data<unknown>> = [];

		return {
			data: {
				...Custom_Object_ƒ.get_base_object_state(me),
				pixel_pos: new_values.pixel_pos,
				rotate: new_values.rotate,
				delegate_state: {
					...me.delegate_state,
					last_source_pos: source_pos,
					last_source_body_pos: source_body_pos,
					last_target_pos: target_pos
				},
			},
			change_list: [],
			spawnees: spawnees,
		}
	},
	yield_asset: () => 'javelin_projectile',

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
			type_name: 'shot_projectile_impact',
			creation_timestamp: tick,
			text: ``,
			parent_id: me.unique_id,
			rotate: me.rotate,
			delegate_state: {
			},
		}));

		return {
			change_list: change_list,
			spawnees: spawnees
		}
	},


	get_custom_image_transform_matrix: (
		me
	) => {

		
		const raw_angle_to_target = angle_between({source: me.delegate_state.last_source_body_pos, dest: me.delegate_state.last_target_pos}) + Math.PI/2

		/*
			The above `raw_angle_to_target` gives the most literal angle between where the shot leaves our unit, towards the "body center" of the enemy unit.  In many cases, as with the Javelineer, this will be at a slight downward angle, even if the units are directly horizontal to each other, as the projectile is hurled from a shoulder-level, but aims at the abdomen.

			However, what we really want is not our "angle around the circle", but rather, our "progression downwards from vertical".

			If the angle is > 180°, we want its inverse.
		*/

		const is_facing_left = is_even( Math.ceil( raw_angle_to_target / Math.PI ) );
		const modulated_angle_to_target =  modulo( raw_angle_to_target , Math.PI );


		const angle_to_target = is_facing_left
			?
			(Math.PI - modulated_angle_to_target)
			:
			modulated_angle_to_target;

		//const angle_to_target = modulo( raw_angle_to_target , Math.PI * 2);

		const rnd = (val: number) => Math.round(radians_to_degrees(val)); 

		const vert_scale = Math.sin( angle_to_target );

		console.log( me.delegate_state.last_source_pos, me.delegate_state.last_target_pos, is_facing_left, rnd(raw_angle_to_target), rnd(modulated_angle_to_target), rnd(angle_to_target),  vert_scale);


		return {
			hor_scale: 1,
			hor_skew: 0,
			vert_skew: 0,
			vert_scale: vert_scale,
			hor_move: 0,
			vert_move: 0,
		}
	}	

}