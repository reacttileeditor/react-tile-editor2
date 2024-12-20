
import _, { cloneDeep, filter, find, first, isBoolean, isEqual, map, size } from "lodash";

import { angle_between, ƒ } from "../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager/Tilemap_Manager";
import { Pathfinder_ƒ } from "../core/engine/Pathfinding";

import { Point2D, Rectangle } from '../interfaces';
import { Custom_Object_Type_Name, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { Base_Object_Data, Base_Object_ƒ, New_Base_Object } from "./Base_Object";
import { Creature_Delegate, CT_Hermit_ƒ, CT_Peasant_ƒ, CT_Skeleton_ƒ } from "./Creature_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { Anim_Schedule_Element, Behavior_Mode, Change_Instance, Creature_Data, Creature_ƒ, Path_Node_With_Direction, Path_Data } from "./Creature";
import { AI_Core_ƒ } from "./AI_Core";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../core/engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ms_to_ticks, ticks_to_ms } from "../core/engine/Blit_Manager";
import { Vals } from "../core/constants/Constants";




export const Creature_Behavior_ƒ = {


/*----------------------- movement -----------------------*/

	set_path: (me: Creature_Data, new_path: Array<Point2D>, _TM: Tilemap_Manager_Data): Path_Data => {
		const path_this_turn_with_directions = Creature_ƒ.build_directional_path_from_path(
			me,
			new_path,
			_TM
		);

		return {
			path_this_turn: new_path,
			path_reachable_this_turn:Creature_ƒ.yield_path_reachable_this_turn(me, _TM, new_path),
			path_this_turn_with_directions: path_this_turn_with_directions,
			path_reachable_this_turn_with_directions: Creature_ƒ.yield_directional_path_reachable_this_turn(me, _TM, path_this_turn_with_directions)
		}
	},

	clear_path: (me: Creature_Data): Path_Data => {
		return {
			path_this_turn: [],
			path_reachable_this_turn: [],
			path_this_turn_with_directions: [],
			path_reachable_this_turn_with_directions: [],
		}
	},
	
	yield_path_reachable_this_turn: (me: Creature_Data, _TM: Tilemap_Manager_Data, new_path: Array<Point2D>):Array<Point2D> => {
		let moves_remaining = cloneDeep(me.remaining_move_points);
		let final_path: Array<Point2D> = [];
	
		_.map( new_path, (val) => {
			const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				val,
				'terrain',
			);
			const move_cost = Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type) ?? 100000000000000;

			moves_remaining = Math.max(moves_remaining - move_cost,0);
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	},

	yield_directional_path_reachable_this_turn: (me: Creature_Data, _TM: Tilemap_Manager_Data, new_path: Array<Path_Node_With_Direction>):Array<Path_Node_With_Direction> => {
		let moves_remaining = cloneDeep(me.remaining_move_points);
		let final_path: Array<Path_Node_With_Direction> = [];
	
		_.map( new_path, (val) => {
			const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				val.position,
				'terrain',
			);
			const move_cost = Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type) ?? 100000000000000;

			moves_remaining = Math.max(moves_remaining - move_cost,0);
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	},

	


	calculate_current_walk_anim_segment: (me: Creature_Data, _TM: Tilemap_Manager_Data, path_data: Path_Data, initial_time_so_far: number = 0): Anim_Schedule_Element|undefined => {
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


	build_directional_path_from_path: (
		me: Creature_Data,
		raw_path: Array<Point2D>,
		_TM: Tilemap_Manager_Data
	): Array<Path_Node_With_Direction> => {
		if( size(raw_path) > 1 ){
			return _.map( raw_path, (val, idx) => {
				if( idx == (size(raw_path) -1) ){
					return {
						position: raw_path[idx],
						direction: Creature_ƒ.extract_direction_from_map_vector(
							me,
							raw_path[idx - 1],
							raw_path[idx],
							_TM
						)
					}
				} else {
					return {
						position: raw_path[idx],
						direction: Creature_ƒ.extract_direction_from_map_vector(
							me,
							raw_path[idx],
							raw_path[idx + 1],
							_TM
						)
					}
				}

			} )
		} else {
			//we have a single-tile path.  We shouldn't have to calculate this, but some code path might hit it.
			return _.map( raw_path, (val, idx) => {
				return {
					position: raw_path[idx],
					direction: me.facing_direction
				}
			});
		}
	},

	extract_direction_from_map_vector: (
		me: Creature_Data,
		start_pos: Point2D,
		end_pos: Point2D,
		_TM: Tilemap_Manager_Data
	):Direction => {
		const pixel_start_pos = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), start_pos);
		const pixel_end_pos = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), end_pos);

		if( pixel_start_pos.y == pixel_end_pos.y ){
			if(pixel_start_pos.x < pixel_end_pos.x){
				return 'east';
			} else {
				return 'west';
			}
		} else if( pixel_start_pos.y >= pixel_end_pos.y  ){
			if(pixel_start_pos.x < pixel_end_pos.x){
				return 'north_east';
			} else {
				return 'north_west';
			}
		} else {
			if(pixel_start_pos.x < pixel_end_pos.x){
				return 'south_east';
			} else {
				return 'south_west';
			}
		}
	},
	// extract_direction_from_map_vectorCubic: (
	// 	me: Creature_Data,
	// 	start_pos: Point2D,
	// 	end_pos: Point2D,
	// 	_TM: Tilemap_Manager_Data
	// ):Direction => {
	// 	const pixel_start_pos = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, start_pos);
	// 	const pixel_end_pos = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, end_pos);

	// 	return Tilemap_Manager_ƒ.extract_direction_from_map_vector(start_pos,end_pos);
	// },
	


/*----------------------- turn processing management -----------------------*/

	get_time_since_mode_start: (me: Creature_Data, tick: number ): number => {
		return tick - me.last_behavior_reconsideration_timestamp
	},

	get_intended_animation_time_offset: (me: Creature_Data, offset_in_ms: number ): number => {
		if( me.behavior_mode == 'attack'){
			return ticks_to_ms( Creature_ƒ.get_time_since_mode_start(me, ms_to_ticks(offset_in_ms)));
		} else {
			return offset_in_ms
		}
	},

	update_pixel_pos: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		change_list: Array<Change_Instance>,
	) => {
		/*-------- Updating pixel position --------*/
		const anim_type = Creature_ƒ.yield_current_animation_type( me, _TM, offset_in_ms);

		let new_pos = {
			walk: Creature_ƒ.yield_walk_anim_position(me, _TM, offset_in_ms),
			attack: me.pixel_pos,
			stand: me.pixel_pos,
		}[anim_type];


		Creature_ƒ.set(change_list, me, 'pixel_pos', new_pos);
	},

	renegotiate_path: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
	) => {

		const new_path_data = Creature_Behavior_ƒ.reassess_current_intended_path(me,_TM, _AM, change_list);

		Creature_Behavior_ƒ.deduct_cost_from_last_move(me,_TM, _AM, change_list);

		Creature_Behavior_ƒ.walk_next_segment(me,_TM, _AM, offset_in_ms, tick, change_list, new_path_data);

	},

	reassess_current_intended_path: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		change_list: Array<Change_Instance>,
	): Path_Data => {
		const new_path_data = cloneDeep(Creature_ƒ.set_path(
			me,
			Pathfinder_ƒ.find_path_between_map_tiles( _TM, _AM, me.tile_pos, me.planned_tile_pos, me ).successful_path,
			_TM
		));

		return new_path_data;
	},



	deduct_cost_from_last_move: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		change_list: Array<Change_Instance>,
	) => {
		/*
			We're at a new tile.  Pathfind a new route to our destination, in case something is now in the way.

			First, however, deduct the cost of our current tile from our existing move_points:
		*/
		const prior_tile_pos = first(me.path_data.path_reachable_this_turn);
		let current_tile_type = '';
		if( prior_tile_pos != undefined) {
			current_tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				prior_tile_pos as Point2D,
				'terrain',
			)
		}

		let prior_tile_cost = 0;
		if( current_tile_type != undefined) {
			prior_tile_cost = Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(current_tile_type) as number;
		}

		Creature_ƒ.add(change_list, me, 'remaining_move_points', -prior_tile_cost);

		if(me.remaining_move_points - prior_tile_cost < 0){
			Creature_ƒ.set(change_list, me, 'is_done_with_turn', true);
		}

	},

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
		spawnees: Array<Custom_Object_Data>
	) => {
		Creature_ƒ.set(change_list, me, 'is_done_with_turn', true);
	},
	



	begin_attack_mode: (
		me: Creature_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data>,
		target: Creature_Data,
	) => {


		Creature_ƒ.set(change_list, me, 'behavior_mode', 'attack');


		const attack_direction = Tilemap_Manager_ƒ.extract_direction_from_map_vector(
			Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), me.tile_pos ),
			Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), target.tile_pos ),
		)		
		Creature_ƒ.set(change_list, me, 'facing_direction', attack_direction);


		Creature_ƒ.set(change_list, me, 'target', target);
		

		Creature_ƒ.add(change_list, me, 'remaining_action_points', -1);

		if(me.remaining_action_points - 1 < 0){
			Creature_ƒ.set(change_list, me, 'is_done_with_turn', true);
		}
	},


/*----------------------- processing commands -----------------------*/

	process_single_frame__movement: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data>
	) => {
		/*
			MOVEMENT:
		*/

		/*
			If we are at a different tile position, we need to renegotiate our path — in the act of attempting to move to a new tile, we can assume that the next tile will be guaranteed to be open for movement (this is a temporary lie we're adopting to expedite development; we'll need to reconsider this, possibly on a per-frame basis of checking the tile we're moving towards and seeing if it's occupied, and thus, we're "bumped").

			Once we're at the new tile, though, we must reassess everything about what our plan of action is.  In the future, we'll reassess whether we're even walking further at all (perhaps we switch to attacking if available), but for now, we retain our "intended destination", and continue to walk towards it. 
		*/
		//let current_tile_pos = Creature_ƒ.get_current_tile_pos_from_pixel_pos(me, _TM);

		Creature_Behavior_ƒ.update_pixel_pos(me, _TM, offset_in_ms, change_list);

	},

	process_single_frame__attacking: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data>
	) => {
		let mode_tick = Creature_ƒ.get_time_since_mode_start(me, tick)

		if( me.target && mode_tick == Creature_ƒ.get_delegate(me.type_name).action_delay_for_animation('attack') ){
			Creature_ƒ.perform_attack_instance(
				me,
				offset_in_ms,
				tick,
				change_list,
				spawnees,
				me.target
			);
		}


		const image_data = Asset_Manager_ƒ.get_data_for_individual_asset(_AM, Creature_ƒ.yield_attack_asset_for_direction( me, me.facing_direction )).image_data;


		if(image_data != undefined){
			const time_since_start = ticks_to_ms(Creature_ƒ.get_time_since_mode_start(me, tick));

			const current_frame_cycle = Asset_Manager_ƒ.get_current_frame_cycle( image_data, time_since_start);

			if( current_frame_cycle > 1 ){
				Creature_ƒ.set(change_list, me, 'behavior_mode', 'stand');
			}
		}

	},

	perform_attack_instance: (
		me: Creature_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data>,
		target: Creature_Data,

	) => {

		if( Creature_ƒ.get_delegate(me.type_name).yield_weapon_range() > 1 ){

			spawnees.push(New_Custom_Object({
				accessors: Base_Object_ƒ.get_accessors(me),
				pixel_pos: me.pixel_pos,
				type_name: 'shot' as Custom_Object_Type_Name,
				creation_timestamp: tick,
				delegate_state: {
					target_obj: target.unique_id,
					source_obj: me.unique_id,
					original_pos: me.pixel_pos,
				},
				scheduled_events: [{
					tick_offset: tick + Vals.shot_flight_duration,
					command: (change_list_: Array<Change_Instance>, spawnees_: Array<Custom_Object_Data>) => {
						//alert('damage')

						Creature_ƒ.add(change_list_, target, 'current_hitpoints', -Creature_ƒ.get_delegate(me.type_name).yield_damage());
						Creature_ƒ.set(change_list_, target, 'last_changed_hitpoints', offset_in_ms);

						spawnees_.push(New_Custom_Object({
							accessors: Base_Object_ƒ.get_accessors(me),
							pixel_pos: {x: target.pixel_pos.x + 1, y: target.pixel_pos.y - 20 - 2},
							type_name: 'text_label' as Custom_Object_Type_Name,
							creation_timestamp: tick,
							text: `${Creature_ƒ.get_delegate(me.type_name).yield_damage()}`,
						}));
				
						spawnees_.push(New_Custom_Object({
							accessors: Base_Object_ƒ.get_accessors(me),
							pixel_pos: {x: target.pixel_pos.x, y: target.pixel_pos.y - 20},
							type_name: 'hit_star_bg' as Custom_Object_Type_Name,
							creation_timestamp: tick,
							delegate_state: {
								angle: angle_between({source: me.tile_pos, dest: target.tile_pos})
							},
						}));					
					}
				}],
				is_done_with_turn: false,
			}));
		} else {
			Creature_ƒ.add(change_list, target, 'current_hitpoints', -Creature_ƒ.get_delegate(me.type_name).yield_damage());
			Creature_ƒ.set(change_list, target, 'last_changed_hitpoints', offset_in_ms);

			spawnees.push(New_Custom_Object({
				accessors: Base_Object_ƒ.get_accessors(me),
				pixel_pos: {x: target.pixel_pos.x + 1, y: target.pixel_pos.y - 20 - 2},
				type_name: 'text_label' as Custom_Object_Type_Name,
				creation_timestamp: tick,
				text: `${Creature_ƒ.get_delegate(me.type_name).yield_damage()}`,
			}));
	
			spawnees.push(New_Custom_Object({
				accessors: Base_Object_ƒ.get_accessors(me),
				pixel_pos: {x: target.pixel_pos.x, y: target.pixel_pos.y - 20},
				type_name: 'hit_star_bg' as Custom_Object_Type_Name,
				creation_timestamp: tick,
				delegate_state: {
					angle: angle_between({source: me.tile_pos, dest: target.tile_pos})
				},
			}));				
		}
	},



	process_single_frame__damage: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data>
	) => {
		if( me.current_hitpoints <= 0 ) {
			spawnees.push(New_Custom_Object({
				accessors: Base_Object_ƒ.get_accessors(me),
				pixel_pos: me.pixel_pos,
				type_name: 'skull_icon' as Custom_Object_Type_Name,
				creation_timestamp: tick,
			}));


			Creature_ƒ.set(change_list, me, 'should_remove', true);
		}
	},

	process_single_frame: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		offset_in_ms: number,
		tick: number,
	): {
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data>
	} => {
		let change_list: Array<Change_Instance> = [];
		const spawnees: Array<Custom_Object_Data> = [];


		if( tick >= me.next_behavior_reconsideration_timestamp ) {
			AI_Core_ƒ.reconsider_behavior(me, _TM, _AM, _BM, offset_in_ms, tick, change_list, spawnees);
		}

		if(me.behavior_mode == 'walk'){
			/*-------- handle any ongoing behavior related to movement --------*/
			Creature_ƒ.process_single_frame__movement(
				me,
				_TM,
				_AM,
				_BM,
				offset_in_ms,
				tick,
				change_list,
				spawnees
			);
		} else if(me.behavior_mode == 'attack') {
			/*-------- handle any ongoing behavior related to attacking --------*/
			Creature_ƒ.process_single_frame__attacking(
				me,
				_TM,
				_AM,
				_BM,
				offset_in_ms,
				tick,
				change_list,
				spawnees
			);
		}

		/*-------- handle any ongoing behavior (really, just "the potential for death") related to taking damage --------*/
		Creature_ƒ.process_single_frame__damage(
			me,
			_TM,
			offset_in_ms,
			tick,
			change_list,
			spawnees
		);
		


		return {
			change_list: change_list,
			spawnees: spawnees
		};
	},


/*----------------------- animation — walking parts -----------------------*/

	yield_walk_anim_position: (me: Creature_Data, _TM: Tilemap_Manager_Data, offset_in_ms: number):Point2D => {
		const animation_segment = Creature_ƒ.calculate_current_walk_anim_segment(me, _TM, me.path_data);


		if( animation_segment ){
			let time_offset_in_anim_segment = (offset_in_ms - me.walk_segment_start_time);//animation_segment.start_time);
			let time_offset_normalized = 1.0 - (time_offset_in_anim_segment / animation_segment.duration)
			
			return ƒ.round_point_to_nearest_pixel( 
				ƒ.tween_points(
					Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), animation_segment.start_pos ),
					Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), animation_segment.end_pos ),
					time_offset_normalized
				)
			);
		} else {
			return me.pixel_pos;
		}
	},

	

/*----------------------- animation — full info -----------------------*/
	yield_current_animation_type: (me: Creature_Data, _TM: Tilemap_Manager_Data, offset_in_ms: number): Behavior_Mode => (
		me.behavior_mode
	),

	yield_animation_asset_for_time: (me: Creature_Data, _TM: Tilemap_Manager_Data, offset_in_ms: number):  string => {
		const anim_type = Creature_ƒ.yield_current_animation_type( me, _TM, offset_in_ms);

		return {
			walk: Creature_ƒ.yield_walk_asset_for_direction( me, me.facing_direction ),
			attack: Creature_ƒ.yield_attack_asset_for_direction( me, me.facing_direction ),
			stand: Creature_ƒ.yield_stand_asset_for_direction( me, me.facing_direction ),
		}[anim_type];
	},
}





