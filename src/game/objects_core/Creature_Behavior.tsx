
import _, { cloneDeep, filter, find, first, isBoolean, isEqual, map, size } from "lodash";

import { ƒ } from "../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager";
import { Pathfinder_ƒ } from "../core/engine/Pathfinding";

import { Point2D, Rectangle } from '../interfaces';
import { CustomObjectTypeName, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { Base_Object_Data, New_Base_Object } from "./Base_Object";
import { Creature_Delegate, CT_Hermit_ƒ, CT_Peasant_ƒ, CT_Skeleton_ƒ } from "./Creature_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { Anim_Schedule_Element, BehaviorMode, ChangeInstance, Creature_Data, Creature_ƒ, PathNodeWithDirection, Path_Data } from "./Creature";
import { AI_Core_ƒ } from "./AI_Core";
import { Asset_Manager_Data } from "../core/engine/Asset_Manager";
import { Blit_Manager_Data } from "../core/engine/Blit_Manager";




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

	yield_directional_path_reachable_this_turn: (me: Creature_Data, _TM: Tilemap_Manager_Data, new_path: Array<PathNodeWithDirection>):Array<PathNodeWithDirection> => {
		let moves_remaining = cloneDeep(me.remaining_move_points);
		let final_path: Array<PathNodeWithDirection> = [];
	
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
	): Array<PathNodeWithDirection> => {
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
	process_single_frame__movement: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		offset_in_ms: number,
		change_list: Array<ChangeInstance>,
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

		if( offset_in_ms >= me.next_behavior_reconsideration_timestamp ) {
			AI_Core_ƒ.reconsider_behavior(me, _TM, _AM, _BM, offset_in_ms, change_list, spawnees);
		}

	},

	update_pixel_pos: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		change_list: Array<ChangeInstance>,
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
		change_list: Array<ChangeInstance>,
	) => {
		//console.log(me.remaining_move_points, me.is_done_with_turn);

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

		//TODO major thing we gotta fix for the functional refactor:
		const new_path_data = cloneDeep(Creature_ƒ.set_path(
				me,
				Pathfinder_ƒ.find_path_between_map_tiles( _TM, _AM, me.tile_pos, me.planned_tile_pos, me ).successful_path,
				_TM
			));
		Creature_ƒ.set(change_list, me, 'path_data', new_path_data);
		Creature_ƒ.set(change_list, me, 'walk_segment_start_time', offset_in_ms);
		if(me.type_name == 'undead_javelineer'){
			//debugger;
		}

		let next_tile_pos = me.tile_pos;
		if( size(new_path_data.path_reachable_this_turn_with_directions) > 1){
			next_tile_pos = new_path_data.path_reachable_this_turn_with_directions[1].position;

			Creature_ƒ.set(change_list, me, 'behavior_mode', 'walk');
		} else {
			Creature_ƒ.set(change_list, me, 'behavior_mode', 'stand');
		}

		if(me.remaining_move_points - prior_tile_cost < 0){
			Creature_ƒ.set(change_list, me, 'is_done_with_turn', true);
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
		

		Creature_ƒ.set(change_list, me, 'next_behavior_reconsideration_timestamp', offset_in_ms + 300);

		Creature_ƒ.set(change_list, me, 'tile_pos', new_position.position);
		Creature_ƒ.set(change_list, me, 'facing_direction', new_position.direction);
	},


	terminate_movement: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>
	) => {
		Creature_ƒ.set(change_list, me, 'is_done_with_turn', true);
	},
	



	perform_attack_instance: (
		me: Creature_Data,
		offset_in_ms: number,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>,
		target: Creature_Data,
	) => {


		Creature_ƒ.set(change_list, me, 'last_changed_hitpoints', offset_in_ms);
		Creature_ƒ.set(change_list, me, 'behavior_mode', 'attack');


		const attack_direction = Tilemap_Manager_ƒ.extract_direction_from_map_vector(
			Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), me.tile_pos ),
			Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me._Tilemap_Manager(), me._Asset_Manager(), target.tile_pos ),
		)		
		Creature_ƒ.set(change_list, me, 'facing_direction', attack_direction);

		spawnees.push(New_Custom_Object({
			get_GM_instance: me.get_GM_instance,
			_Asset_Manager: me._Asset_Manager,
			_Blit_Manager: me._Blit_Manager,
			_Tilemap_Manager: me._Tilemap_Manager,

			pixel_pos: me.pixel_pos,
			rotate: 0,
			type_name: 'shot' as CustomObjectTypeName,
			creation_timestamp: offset_in_ms,
			should_remove: false,
			text: ``,
			delegate_state: {
				target_obj: target.unique_id,
				source_obj: me.unique_id,
			},
			scheduled_events: [{
				tick_offset: 100,
				command: (change_list_inner: Array<ChangeInstance>) => {
					alert('damage')

					Creature_ƒ.add(change_list_inner, target, 'current_hitpoints', -Creature_ƒ.get_delegate(me.type_name).yield_damage());
				}
			}],
		}));
		
		spawnees.push(New_Custom_Object({
			get_GM_instance: me.get_GM_instance,
			_Asset_Manager: me._Asset_Manager,
			_Blit_Manager: me._Blit_Manager,
			_Tilemap_Manager: me._Tilemap_Manager,

			pixel_pos: {x: target.pixel_pos.x + 1, y: target.pixel_pos.y - 20 - 2},
			rotate: 0,
			type_name: 'text_label' as CustomObjectTypeName,
			creation_timestamp: offset_in_ms,
			should_remove: false,
			text: `${Creature_ƒ.get_delegate(me.type_name).yield_damage()}`,
			delegate_state: {},
		}));

		spawnees.push(New_Custom_Object({
			get_GM_instance: me.get_GM_instance,
			_Asset_Manager: me._Asset_Manager,
			_Blit_Manager: me._Blit_Manager,
			_Tilemap_Manager: me._Tilemap_Manager,

			pixel_pos: {x: target.pixel_pos.x, y: target.pixel_pos.y - 20},
			rotate: 0,
			type_name: 'hit_star_bg' as CustomObjectTypeName,
			creation_timestamp: offset_in_ms,
			should_remove: false,
			text: ``,
			delegate_state: {},
		}));

		Creature_ƒ.add(change_list, me, 'remaining_action_points', -1);

		if(me.remaining_action_points - 1 < 0){
			Creature_ƒ.set(change_list, me, 'is_done_with_turn', true);
		}
	},

	process_single_frame__damage: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>
	) => {
		if( me.current_hitpoints <= 0 ) {
			spawnees.push(New_Custom_Object({
				get_GM_instance: me.get_GM_instance,
				_Asset_Manager: me._Asset_Manager,
				_Blit_Manager: me._Blit_Manager,
				_Tilemap_Manager: me._Tilemap_Manager,
	
				pixel_pos: me.pixel_pos,
				rotate: 0,
				type_name: 'skull_icon' as CustomObjectTypeName,
				creation_timestamp: offset_in_ms,
				should_remove: false,
				text: ``,
				delegate_state: {},
			}));


			Creature_ƒ.set(change_list, me, 'should_remove', true);
		}
	},

	process_single_frame: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		offset_in_ms: number
	): {
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>
	} => {
		let change_list: Array<ChangeInstance> = [];
		const spawnees: Array<Custom_Object_Data> = [];




		/*-------- Delegating the actual work to sub-functions --------*/
		Creature_ƒ.process_single_frame__movement(
			me,
			_TM,
			_AM,
			_BM,
			offset_in_ms,
			change_list,
			spawnees
		);

		Creature_ƒ.process_single_frame__damage(
			me,
			_TM,
			offset_in_ms,
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
	yield_current_animation_type: (me: Creature_Data, _TM: Tilemap_Manager_Data, offset_in_ms: number): BehaviorMode => (
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





