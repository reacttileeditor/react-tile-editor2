
import _, { cloneDeep, filter, find, first, isBoolean, isEqual, map, size } from "lodash";

import { ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";
import { Pathfinder_ƒ } from "../../core/engine/Pathfinding";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../Custom_Object/Custom_Object";
import { Game_Manager_Data, Game_Manager_ƒ } from "../../core/engine/Game_Manager/Game_Manager";
import { Anim_Schedule_Element, Change_Instance, Creature_Data, Creature_ƒ, Path_Node_With_Direction, Path_Data, path_data_empty } from "./Creature";
import { Asset_Manager_Data } from "../../core/engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data } from "../../core/engine/Blit_Manager";
import { sort } from "ramda";



/*
	Statement of Intent:


	'hunt_seek':  typically used for AI-controlled enemies; if they don't have a path, they deliberately make one, and it's designed to home in on an enemy unit.
	
	'attack_move': the typical behavior for a move command;  move, and if you get in range of an enemy, stop moving and attack.
	
	'move': currently inaccessible via the UI, but this will be a move command where you specifically DON'T want to engage and attack — where you're wounded and you're trying to get the hell out of there.

	'stand' — just hold your ground and only attack if something is in range.
*/

type Behavior_Mode = 'hunt_seek' | 'attack_move' | 'move' | 'stand';





export const AI_Core_ƒ = {
/*----------------------- Data Accessors -----------------------*/
	is_ai_controlled: (
		me: Creature_Data,
	): boolean => (
		/*
			The most sad hack:  for now, "team 2" is the AI-controlled enemy.  Actual indicator variables come later.
		*/
		me.team == 2
	),

	find_closest_target: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
	): Creature_Data|undefined => {
		const targets = filter( Game_Manager_ƒ.get_game_state(me.get_GM_instance()).current_frame_state.creature_list, (val) => (
			val.team !== me.team
		));
		
		let valid_targets: Array<Creature_Data> = []; 
		if( size(targets) ){
			valid_targets = filter(targets, (target)=>{
				const distance = Tilemap_Manager_ƒ.get_tile_coord_distance_between(
					Creature_ƒ.get_current_tile_pos_from_pixel_pos(me, _TM, _AM, _BM),
					Creature_ƒ.get_current_tile_pos_from_pixel_pos(target, _TM, _AM, _BM)
				);

				return ( distance <= Creature_ƒ.get_delegate(me.type_name).yield_weapon_range() );
			});
		}

		if( size(valid_targets) ){
			return valid_targets[0];
		} else {
			return undefined;
		}
	},


	find_destination: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
	): Creature_Data|undefined => {
		// const targets = filter( Game_Manager_ƒ.get_game_state(me.get_GM_instance()).current_frame_state.creature_list, (val) => (
		// 	val.team !== me.team
		// ));
		

		// if( size(targets) ){
		// 	return targets[0];
		// } else {
		// 	return undefined;
		// }

		return AI_Core_ƒ.get_closest_enemy(me);
	},
	

/*----------------------- AI Control -----------------------*/
	// assess_behavior_mode: (
	// 	me: Creature_Data,
	// 	target: 
	// ): Behavior_Mode => {

	// 	if( AI_Core_ƒ.is_ai_controlled(me) ){
	// 		return 'hunt_seek'
	// 	} else {
	// 		me.behavior_mode
	// 	}
	// },


	// consider_attack_move: (
	// 	me: Creature_Data,
	// 	_TM: Tilemap_Manager_Data,
	// 	_AM: Asset_Manager_Data,
	// 	_BM: Blit_Manager_Data,
	// 	offset_in_ms: number,
	// 	tick: number,
	// 	change_list: Array<Change_Instance>,
	// 	spawnees: Array<Custom_Object_Data>
	// ) => {

	// },


	make_AI_driven_choices: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_GM: Game_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>
	) => {
		/*
			Units will not have paths upon starting a turn, so basically, at this juncture, we make one.

			Only make one if we don't have one, which would be at the start of the turn.
		*/
		
		if( size(me.path_data.path_this_turn) === 0 ){
			const target = AI_Core_ƒ.find_destination(me, _TM, _AM, _BM);

			if( target ){
				const new_path_data = cloneDeep(Creature_ƒ.set_path(
					me,
					Pathfinder_ƒ.find_path_between_map_tiles( _TM, _AM, _GM, _BM, me.tile_pos, target.tile_pos, me ).successful_path,
					_TM
				));

				Creature_ƒ.set(change_list, me, 'path_data', new_path_data);
				Creature_ƒ.set(change_list, me, 'planned_tile_pos', target.tile_pos);


				Creature_ƒ.walk_next_segment(me,_TM, _AM, offset_in_ms, tick, change_list, new_path_data);
			}
		}
	},


	construct_path_for_AI_enemies: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_GM: Game_Manager_Data,
	): Path_Data => {
		/*
			AI units don't have paths assigned by the player, so they need to construct them, manually, at the start of the turn (and may also need to replace them later, if the situation changes — i.e. if their target dies, and they need a new one).
		*/
		const target = AI_Core_ƒ.find_destination(me, _TM, _AM, _BM);

		if( target ){
			return cloneDeep(Creature_ƒ.set_path(
				me,
				Pathfinder_ƒ.find_path_between_map_tiles( _TM, _AM, _GM, _BM, me.tile_pos, target.tile_pos, me ).successful_path,
				_TM
			));
		} else {
			return path_data_empty;
		}
	},


	get_closest_enemy: (me: Creature_Data): Creature_Data|undefined => {
		const _GM = me.get_GM_instance();
		const creatures = _GM.game_state.current_frame_state.creature_list;
		const dist = Tilemap_Manager_ƒ.get_tile_coord_distance_between;

		if( size(creatures) ){
			const enemy_creatures = filter( creatures, (val) => (
				val.team !== me.team
			));

			const sorted_creatures = sort(
				(a,b) => ( dist(a.tile_pos, me.tile_pos) - dist(b.tile_pos, me.tile_pos) ),
				enemy_creatures
			);


			return sorted_creatures[0];
		} else {
			return undefined;
		}
	},

/*----------------------- movement -----------------------*/

	reconsider_behavior: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_GM: Game_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>
	) => {


		// if( AI_Core_ƒ.is_ai_controlled(me) ){
		// 	AI_Core_ƒ.make_AI_driven_choices(me, _TM, _AM, _BM, offset_in_ms, tick, change_list, spawnees)
		// }


		/*
			This is where we decide if it's appropriate to launch an attack.
			
			This is a work in progress, and we'll have to expand the criterion as we figure them out.   The first, obvious thing is detecting if there are valid targets.  The second thing we'll do later is figuring out if we've still got enough moves left.
		*/

		const target = AI_Core_ƒ.find_closest_target(me, _TM, _AM, _BM);


		if( target && (me.remaining_action_points > 0) ){
			/*
				We have at least one valid target.  I think we'll probably want some priority criterion, but for now, just pick the first one.

				We have to set some kind of mode indicator that we're attacking, right now.
			*/

			Creature_ƒ.begin_attack_mode(me, offset_in_ms, tick, change_list, spawnees, target);

		} else {
			/*
				We don't have any targets, so we're moving, instead.
			*/

			if( me.behavior_mode !== 'attack' ){
				if( (me.remaining_action_points > 0) ){
					const new_path_data = ( AI_Core_ƒ.is_ai_controlled(me) )
						?
						AI_Core_ƒ.construct_path_for_AI_enemies(me, _TM, _AM, _BM, _GM)
						:
						Creature_ƒ.reassess_current_intended_path(me,_TM, _AM, _GM, _BM, change_list);


					Creature_ƒ.set(change_list, me, 'path_data', new_path_data);


					Creature_ƒ.deduct_cost_from_last_move(me,_TM, _AM, change_list);
					Creature_ƒ.walk_next_segment(me,_TM, _AM, offset_in_ms, tick, change_list, new_path_data);
				} else {
					Creature_ƒ.terminate_movement(me, _TM, offset_in_ms, tick, change_list, spawnees);
				}
			}
		}
	},

	
}





