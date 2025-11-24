
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Gamespace_Pixel_Point, Point2D, Rectangle } from '../../interfaces';
import { Change_Instance, Creature_Type_Name } from "../Creature/Creature";
import { Custom_Object_Delegate, Custom_Object_Delegate_States} from "./Custom_Object_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../../core/engine/Game_Manager/Game_Manager";
import { Blit_Manager_Data } from "../../core/engine/Blit_Manager";
import { Asset_Manager_Data } from "../../core/engine/Asset_Manager/Asset_Manager";
import { Base_Object_Data, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { filter, map, without } from "ramda";
import { add_points } from "../../core/engine/Utils";
import { cloneDeep } from "lodash";
 

export const Custom_Object_ƒ_Processing = {
/*----------------------- movement -----------------------*/

	process_single_frame: (
		me: Custom_Object_Data<unknown>,
		_Tilemap_Manager: Tilemap_Manager_Data,
		offset_in_ms: number,
		tick: number,
		parent_object: Custom_Object_Data<unknown> | undefined,
	): {
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
		new_object: Custom_Object_Data<unknown>,
	} => {

/*----------------------- physics -----------------------*/
		const me_after_physics = {
			...me,
			...Custom_Object_ƒ.process_physics(me),
		};


/*----------------------- parent handling -----------------------*/
		let parent_id = me.parent_id;

		if( parent_object !== undefined ){
			me_after_physics.pixel_pos = cloneDeep(parent_object.pixel_pos)

		}

/*----------------------- base values -----------------------*/
		const processed_results = Custom_Object_ƒ.get_delegate(me_after_physics.type_name).process_single_frame(
			me_after_physics,
			tick,
			parent_object
		);

		const processed_data = processed_results.data;

		let change_list: Array<Change_Instance> = processed_results.change_list;
		let spawnees: Array<Custom_Object_Data<unknown>> = processed_results.spawnees;

/*----------------------- scheduled events -----------------------*/
		let scheduled_events = me_after_physics.scheduled_events;
		
		let current_events = filter( (val)=>(
			val.tick_offset == tick
		), scheduled_events);

		map( (val)=>{
			val.command(me_after_physics, change_list, spawnees);

			//console.warn( change_list, spawnees )
		}, current_events );


		scheduled_events = without( current_events, scheduled_events);


		const should_be_removed = Custom_Object_ƒ.get_delegate(me.type_name)._should_be_removed(
			me,
			parent_object,
			tick,
			offset_in_ms
		);

		if(should_be_removed) {
			const new_lists = Custom_Object_ƒ.do_upon_removal(
				me_after_physics,		//TODO: WARNING <- could be stale data here; we're not rebuilding a whole CO after the physics, just part of one
				offset_in_ms,
				tick,
				change_list,
				spawnees
			)

			change_list = new_lists.change_list;
			spawnees = new_lists.spawnees;
		}


/*----------------------- final object -----------------------*/
		const final_values = { 
			change_list: change_list,
			spawnees: spawnees,
			new_object: New_Custom_Object({
				accessors: Custom_Object_ƒ.get_accessors(me),

				pixel_pos: processed_data.pixel_pos,
				velocity: processed_data.velocity,
				accel: processed_data.accel,
				rotate: processed_data.rotate,
				type_name: me.type_name,
				is_done_with_turn: false, //isEmpty(scheduled_events),
				creation_timestamp: me.creation_timestamp,
				should_remove: should_be_removed,
				text: me.text,
				unique_id: me.unique_id,
				parent_id: parent_id,
				scheduled_events: scheduled_events,
				delegate_state: processed_data.delegate_state,
			})
		}

		return final_values;
	},


	process_physics: (me: Base_Object_Data): Base_Object_Data => {
		const new_velocity = add_points(me.velocity, me.accel);


		return {
			...me,
			pixel_pos: add_points(me.pixel_pos, new_velocity) as Gamespace_Pixel_Point,
			velocity: new_velocity,
		}
	},

	do_upon_removal: (
		me: Custom_Object_Data<unknown>,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	): {
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
	} => (Custom_Object_ƒ.get_delegate(me.type_name).do_upon_removal(
		me,
		offset_in_ms,
		tick,
		change_list,
		spawnees,
	)),
}

