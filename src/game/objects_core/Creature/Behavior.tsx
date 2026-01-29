
import _, { cloneDeep, filter, find, first, isBoolean, isEqual, map, size } from "lodash";

import { angle_between, radians_to_degrees, ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";
import { Pathfinder_ƒ } from "../../core/engine/Pathfinding";

import { Gamespace_Pixel_Point, Point2D, Rectangle, Tile_Pos_Point } from '../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../Custom_Object/Custom_Object";
import { Anim_Schedule_Element, Behavior_Mode, Change_Instance, Creature_Data, Creature_ƒ, Path_Node_With_Direction, Path_Data } from "./Creature";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../../core/engine/Asset_Manager/Asset_Manager";
import { Vals } from "../../core/constants/Constants";
import { Game_Manager_Data } from "../../core/engine/Game_Manager/Game_Manager";
import { Blit_Manager_Data } from "../../core/engine/Blit_Manager";
import { CO_Shot_State } from "../../core/data/Custom_Objects/Shot";
import { slice } from "ramda";



/*
	By way of contrast; "Behavior" is for intermittent choices that get made during a creature's turn (such as when a creature reaches a new tile); "Processing" is for code that gets run every frame.
*/



export const Creature_ƒ_Behavior = {


/*----------------------- movement -----------------------*/
	calculate_current_walk_anim_segment: (me: Creature_Data, _TM: Tilemap_Manager_Data, path_data: Path_Data, initial_time_so_far: number = 0): Anim_Schedule_Element|undefined => {
		/*
			To be clear; this is JUST one tile long; just the hop between two adjacent tiles.
		*/
		var time_so_far = initial_time_so_far;

		const first_tile = first(path_data.path_reachable_this_turn_with_directions);
		const second_tile = path_data.path_reachable_this_turn_with_directions[1];

		return (((first_tile != undefined) && (second_tile != undefined))
			?
			{
				direction: first_tile.direction,
				duration: 300,
				start_time: time_so_far,
				start_pos: first_tile.position,
				end_pos: second_tile.position,
			}
			:
			undefined
		);
	},

	guess_anim_pos_at_time_offset: (me: Creature_Data, _TM: Tilemap_Manager_Data, path_data: Path_Data, time_so_far: number): Tile_Pos_Point|undefined => {

		const duration_per_tile_walked = 300;
		const tile_offset = Math.floor( time_so_far / duration_per_tile_walked);

		const truncated_tile_offset = Math.min( Math.max(size(path_data.path_reachable_this_turn_with_directions) - 1, 0), tile_offset );

		if( truncated_tile_offset == 0 ){
			return me.tile_pos;
		} else {
			//console.log(`path size: ${size(path_data.path_reachable_this_turn_with_directions)}, index: ${tile_offset}`)
			return path_data.path_reachable_this_turn_with_directions[truncated_tile_offset].position;
		}
	},



/*----------------------- mid-turn path management -----------------------*/

	// renegotiate_path: (
	// 	me: Creature_Data,
	// 	_TM: Tilemap_Manager_Data,
	// 	_AM: Asset_Manager_Data,
	// 	offset_in_ms: number,
	// 	tick: number,
	// 	change_list: Array<Change_Instance>,
	// ) => {

	// 	const new_path_data = Creature_ƒ.reassess_current_intended_path(me,_TM, _AM, change_list);

	// 	Creature_ƒ.deduct_cost_from_last_move(me,_TM, _AM, change_list);

	// 	Creature_ƒ.walk_next_segment(me,_TM, _AM, offset_in_ms, tick, change_list, new_path_data);

	// },

	reassess_current_intended_path: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_GM: Game_Manager_Data,
		_BM: Blit_Manager_Data,
		change_list: Array<Change_Instance>,
	): Path_Data => {
		const new_path_data = cloneDeep(Creature_ƒ.set_path(
			me,
			Pathfinder_ƒ.find_path_between_map_tiles( _TM, _AM, _GM, _BM, me.tile_pos, me.planned_tile_pos, me ).successful_path,
			_TM
		));

		return new_path_data;
	},



	deduct_cost_from_last_move: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		tick: number,
		change_list: Array<Change_Instance>,
		new_path: Path_Data,
	) => {
		/*
			We're at a new tile.  Pathfind a new route to our destination, in case something is now in the way.

			First, however, deduct the cost of our current tile from our existing move_points:
		*/
//		const prior_tile_pos = first(slice(1, Infinity, me.path_data.path_reachable_this_turn));
		const prior_tile_pos = first(new_path.path_reachable_this_turn);
		let current_tile_type = '';
		if( prior_tile_pos != undefined) {
			current_tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				prior_tile_pos,
				'terrain',
			)
		}

		let prior_tile_cost = 0;
		if( current_tile_type != undefined) {
			prior_tile_cost = Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(current_tile_type) as number;
		}

		console.log(tick, me.type_name, prior_tile_pos, current_tile_type, prior_tile_cost, me.remaining_move_points)
		Creature_ƒ.add(change_list, me, 'remaining_move_points', -prior_tile_cost);

		if(me.remaining_move_points - prior_tile_cost < 0){
			Creature_ƒ.set(change_list, me, 'is_done_with_turn', true);
		}

	},


/*----------------------- commands - walking/stopping -----------------------*/

	walk_next_segment: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		new_path_data: Path_Data,
	) => {


		Creature_ƒ.set(change_list, me, 'walk_segment_start_time', offset_in_ms);

		
		/*
			Decide if we're even walking; no path left?  No walk.
		*/ 

		let next_tile_pos = me.tile_pos;
		if( size(new_path_data.path_reachable_this_turn_with_directions) > 1){
			next_tile_pos = new_path_data.path_reachable_this_turn_with_directions[1].position;

			Creature_ƒ.set(change_list, me, 'behavior_mode', 'walk');
		} else {
			Creature_ƒ.set(change_list, me, 'behavior_mode', 'stand');
		}



		/*
			Because we want not *merely* a tile, but also a direction, grab the first element from our new path.  We already know the tile (we had to to calculate the path), but this gives us the direction as well.
		*/ 

		const current_anim_segment = Creature_ƒ.calculate_current_walk_anim_segment(me, _TM, new_path_data);

		const new_position = {
			position: next_tile_pos,
			direction: (current_anim_segment != undefined
				?
				current_anim_segment.direction
				:
				me.facing_direction
			),
		};
		

		Creature_ƒ.set(change_list, me, 'last_behavior_reconsideration_timestamp', tick);
		Creature_ƒ.set(change_list, me, 'next_behavior_reconsideration_timestamp', tick + 18);

		Creature_ƒ.set(change_list, me, 'tile_pos', new_position.position);
		Creature_ƒ.set(change_list, me, 'facing_direction', new_position.direction);

	},




	terminate_movement: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>
	) => {
		Creature_ƒ.set(change_list, me, 'is_done_with_turn', true);
	},
	


/*----------------------- commands - attacking -----------------------*/

	begin_attack_mode: (
		me: Creature_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
		target: Creature_Data,
	) => {


		Creature_ƒ.set(change_list, me, 'behavior_mode', 'attack');


		const attack_direction = Tilemap_Manager_ƒ.extract_direction_from_map_vector(
			Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), me.tile_pos ) as unknown as Tile_Pos_Point,
			Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), target.tile_pos ) as unknown as Tile_Pos_Point,
		)		
		Creature_ƒ.set(change_list, me, 'facing_direction', attack_direction);


		Creature_ƒ.set(change_list, me, 'target', target);
		

		Creature_ƒ.add(change_list, me, 'remaining_action_points', -1);

		if(me.remaining_action_points - 1 < 0){
			Creature_ƒ.set(change_list, me, 'is_done_with_turn', true);
		}
	},



	perform_attack_instance: (
		me: Creature_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>,
		target: Creature_Data,

	) => {

		if( Creature_ƒ.get_delegate(me.type_name).yield_weapon_range() > 1 ){

			const tick_offset = tick + Vals.shot_flight_duration;


			spawnees.push(New_Custom_Object<CO_Shot_State>({
				accessors: Creature_ƒ.get_accessors(me),
				pixel_pos: Creature_ƒ.get_shot_start_position(me),
				type_name: Creature_ƒ.get_delegate(me.type_name).yield_shot_type(),
				creation_timestamp: tick,
				delegate_state: {
					target_obj: target.unique_id,
					source_obj: me.unique_id,
					last_source_pos: Creature_ƒ.get_shot_start_position(me),
					last_source_body_pos: Creature_ƒ.get_midpoint(me),
					last_target_pos: Creature_ƒ.get_midpoint(target)
				},
				scheduled_events: [{
					tick_offset: tick_offset,
					command: (CO: Custom_Object_Data<unknown>, change_list_: Array<Change_Instance>, spawnees_: Array<Custom_Object_Data<unknown>>) => {

						Creature_ƒ.adjust_hitpoints(
							target,
							change_list_,
							tick_offset,
							Creature_ƒ.get_delegate(me.type_name).yield_damage(),
						);

						// spawnees_.push(New_Custom_Object({
						// 	accessors: Creature_ƒ.get_accessors(me),
						// 	pixel_pos: {x: target.pixel_pos.x + 1, y: target.pixel_pos.y - 20 - 2} as Gamespace_Pixel_Point,
						// 	type_name: 'text_label',
						// 	creation_timestamp: tick_offset,
						// 	text: `${Creature_ƒ.get_delegate(me.type_name).yield_damage()}`,
						// 	delegate_state: {},
						// }));
				
						// spawnees_.push(New_Custom_Object({
						// 	accessors: Creature_ƒ.get_accessors(me),
						// 	pixel_pos: {x: target.pixel_pos.x, y: target.pixel_pos.y - 20} as Gamespace_Pixel_Point,
						// 	type_name: 'hit_star_bg',
						// 	creation_timestamp: tick_offset,
						// 	delegate_state: {
						// 		angle: angle_between({source: me.tile_pos, dest: target.tile_pos})
						// 	},
						// }));					
					}
				}],
				is_done_with_turn: false,
			}));
		} else {
			Creature_ƒ.adjust_hitpoints(
				target,
				change_list,
				tick,
				Creature_ƒ.get_delegate(me.type_name).yield_damage(),
			);

			// spawnees.push(New_Custom_Object({
			// 	accessors: Creature_ƒ.get_accessors(me),
			// 	pixel_pos: {x: target.pixel_pos.x + 1, y: target.pixel_pos.y - 20 - 2} as Gamespace_Pixel_Point,
			// 	type_name: 'text_label',
			// 	creation_timestamp: tick,
			// 	text: `${Creature_ƒ.get_delegate(me.type_name).yield_damage()}`,
			// 	delegate_state: {},
			// }));
	
			spawnees.push(New_Custom_Object({
				accessors: Creature_ƒ.get_accessors(me),
				pixel_pos: Creature_ƒ.get_midpoint(target),
				type_name: 'melee_slash_impact',
				creation_timestamp: tick,
				rotate: radians_to_degrees(angle_between({source: me.tile_pos, dest: target.tile_pos})),
				delegate_state: {
					angle: angle_between({source: me.tile_pos, dest: target.tile_pos})
				},
			}));				
		}
	},



}





