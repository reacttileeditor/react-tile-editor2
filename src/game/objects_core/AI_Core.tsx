
import _, { cloneDeep, filter, find, first, isBoolean, isEqual, map, size } from "lodash";

import { ƒ } from "../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager";
import { Pathfinder_ƒ } from "../core/engine/Pathfinding";

import { Point2D, Rectangle } from '../interfaces';
import { CustomObjectTypeName, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { Anim_Schedule_Element, ChangeInstance, Creature_Data, Creature_ƒ, PathNodeWithDirection } from "./Creature";
import { Creature_Behavior_ƒ } from "./Creature_Behavior";




export const AI_Core_ƒ = {


/*----------------------- movement -----------------------*/
	

	reconsider_behavior: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>
	) => {

		/*
			This is where we decide if it's appropriate to launch an attack.
			
			This is a work in progress, and we'll have to expand the criterion as we figure them out.   The first, obvious thing is detecting if there are valid targets.  The second thing we'll do later is figuring out if we've still got enough moves left.
		*/

		const targets = filter( Game_Manager_ƒ.get_game_state(me.get_GM_instance()).current_frame_state.creature_list, (val) => (
			val.team !== me.team
		));
		
		let valid_targets: Array<Creature_Data> = []; 
		if( size(targets) ){
			valid_targets = filter(targets, (target)=>{
				const distance = Tilemap_Manager_ƒ.get_tile_coord_distance_between(
					Creature_ƒ.get_current_tile_pos_from_pixel_pos(me, _TM),
					Creature_ƒ.get_current_tile_pos_from_pixel_pos(target, _TM)
				);
	
				return (distance <= 1);
			});
		}

		if( size(valid_targets) && (me.remaining_action_points > 0) ){
			/*
				We have at least one valid target.  I think we'll probably want some priority criterion, but for now, just pick the first one.

				We have to set some kind of mode indicator that we're attacking, right now.
			*/

			Creature_Behavior_ƒ.perform_attack_instance(me, _TM, offset_in_ms, change_list, spawnees, valid_targets[0]);

		} else {
			/*
				We don't have any targets, so we're moving, instead.
			*/

			//TODO gate on remaining action points
			if( (me.remaining_action_points > 0) ){
				Creature_Behavior_ƒ.renegotiate_path(me, _TM, offset_in_ms, change_list);
			} else {
				Creature_Behavior_ƒ.terminate_movement(me, _TM, offset_in_ms, change_list, spawnees);
			}
		}
	},


	
}




