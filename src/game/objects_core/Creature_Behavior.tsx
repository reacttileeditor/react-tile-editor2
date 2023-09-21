
import _, { cloneDeep, filter, find, first, isBoolean, isEqual, map, size } from "lodash";

import { ƒ } from "../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager";
import { Pathfinder_ƒ } from "../core/engine/Pathfinding";

import { Point2D, Rectangle } from '../interfaces';
import { CustomObjectTypeName, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { Base_Object_Data, New_Base_Object } from "./Base_Object";
import { Creature_Delegate, CT_Hermit_ƒ, CT_Peasant_ƒ, CT_Skeleton_ƒ } from "./Creature_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { Anim_Schedule_Element, ChangeInstance, Creature_Data, Creature_ƒ, PathNodeWithDirection } from "./Creature";




export const Creature_Behavior_ƒ = {


/*----------------------- movement -----------------------*/

	set_path: (me: Creature_Data, new_path: Array<Point2D>, _TM: Tilemap_Manager_Data) => {
		me.path_this_turn = new_path;
		me.path_reachable_this_turn = Creature_ƒ.yield_path_reachable_this_turn(me, _TM, new_path);
		
		me.path_this_turn_with_directions = Creature_ƒ.build_directional_path_from_path(
			me,
			me.path_this_turn,
			_TM
		);

		me.path_reachable_this_turn_with_directions = Creature_ƒ.yield_directional_path_reachable_this_turn(me, _TM, me.path_this_turn_with_directions);
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

	


	calculate_next_anim_segment: (me: Creature_Data, _TM: Tilemap_Manager_Data, initial_time_so_far: number = 0) => {
		var time_so_far = initial_time_so_far;

		const first_tile = first(me.path_reachable_this_turn_with_directions);
		const second_tile = me.path_reachable_this_turn_with_directions[1];

		me.current_walk_anim_segment = ƒ.if((first_tile != undefined) && (second_tile != undefined),
			{
				direction: (first_tile as PathNodeWithDirection).direction,
				duration: 300,
				start_time: time_so_far,
				start_pos: (first_tile as PathNodeWithDirection).position,
				end_pos: (second_tile as PathNodeWithDirection).position,
			},
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
		const pixel_start_pos = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, start_pos);
		const pixel_end_pos = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, end_pos);

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
			Creature_Behavior_ƒ.renegotiate_path(me, _TM, offset_in_ms, change_list);
		}

	},

	update_pixel_pos: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		change_list: Array<ChangeInstance>,
	) => {
		/*-------- Updating pixel position --------*/
		let new_pos = Creature_ƒ.yield_walk_anim_position(me, _TM, offset_in_ms);

		change_list.push({
			type: 'set',
			value: new_pos,
			target_variable: 'pixel_pos',
			target_obj_uuid: me.unique_id,
		});

	},

	renegotiate_path: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		change_list: Array<ChangeInstance>,
	) => {
		console.log(me.remaining_move_points, me.is_done_with_turn);

		/*
			We're at a new tile.  Pathfind a new route to our destination, in case something is now in the way.

			First, however, deduct the cost of our current tile from our existing move_points:
		*/
		const prior_tile_pos = first(me.path_reachable_this_turn);
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


		change_list.push({
			type: 'add',
			value: -prior_tile_cost,
			target_variable: 'remaining_move_points',
			target_obj_uuid: me.unique_id,
		});

		Creature_ƒ.set_path(
			me,
			Pathfinder_ƒ.find_path_between_map_tiles( _TM, me.tile_pos, me.planned_tile_pos, me ).successful_path,
			_TM
		);

		let next_tile_pos = me.tile_pos;
		if( size(me.path_reachable_this_turn_with_directions) > 1){
			Creature_ƒ.calculate_next_anim_segment(me, _TM, offset_in_ms);
			next_tile_pos = me.path_reachable_this_turn_with_directions[1].position;
		} else {
			me.current_walk_anim_segment = undefined;
		}

		if(me.remaining_move_points - prior_tile_cost < 0){
			change_list.push({
				type: 'set',
				value: true,
				target_variable: 'is_done_with_turn',
				target_obj_uuid: me.unique_id,
			});
		}


		/*
			Because we want not *merely* a tile, but also a direction, grab the first element from our new path.  We already know the tile (we had to to calculate the path), but this gives us the direction as well.
		*/ 

		const new_position = {
			position: next_tile_pos,
			direction: ƒ.if(me.current_walk_anim_segment != undefined,
				me.current_walk_anim_segment?.direction,
				me.facing_direction
			),
		};
		

		change_list.push({
			type: 'set',
			value: offset_in_ms + 300,
			target_variable: 'next_behavior_reconsideration_timestamp',
			target_obj_uuid: me.unique_id,
		});

		change_list.push({
			type: 'set',
			value: new_position.position,
			target_variable: 'tile_pos',
			target_obj_uuid: me.unique_id,
		});

		change_list.push({
			type: 'set',
			value: new_position.direction,
			target_variable: 'facing_direction',
			target_obj_uuid: me.unique_id,
		});	
	},

	reconsider_behavior: (

	) => {

	},
	
	process_single_frame__damage: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>
	) => {
		/*
			DAMAGE:
		*/
		const targets = filter( Game_Manager_ƒ.get_game_state(me.get_GM_instance()).current_frame_state.creature_list, (val) => (
			val.team !== me.team
		));
		

		if( size(targets) ){
			map(targets, (target)=>{
				const distance = Tilemap_Manager_ƒ.get_tile_coord_distance_between(
					Creature_ƒ.get_current_tile_pos_from_pixel_pos(me, _TM),
					Creature_ƒ.get_current_tile_pos_from_pixel_pos(target, _TM)
				);

				//console.log( `distance between ${me.type_name} and ${target.type_name}: ${distance}`)


				if(me.remaining_action_points > 0){

					if(distance <= 1 ){
						change_list.push({
							type: 'add',
							value: -Creature_ƒ.get_delegate(me.type_name).yield_damage(),
							target_variable: 'current_hitpoints',
							target_obj_uuid: target.unique_id,
						});

						change_list.push({
							type: 'set',
							value: offset_in_ms,
							target_variable: 'last_changed_hitpoints',
							target_obj_uuid: target.unique_id,
						});
						

						spawnees.push(New_Custom_Object({
							get_GM_instance: me.get_GM_instance,
							pixel_pos: target.pixel_pos,
							type_name: 'shot' as CustomObjectTypeName,
							creation_timestamp: offset_in_ms,
							should_remove: false,
							text: ``,
							delegate_state: {
								target_obj: target.unique_id,
								source_obj: me.unique_id,
							},
						}));
						
						
						spawnees.push(New_Custom_Object({
							get_GM_instance: me.get_GM_instance,
							pixel_pos: target.pixel_pos,
							type_name: 'text_label' as CustomObjectTypeName,
							creation_timestamp: offset_in_ms,
							should_remove: false,
							text: `-${Creature_ƒ.get_delegate(me.type_name).yield_damage()}`,
							delegate_state: {},
						}));

						change_list.push({
							type: 'add',
							value: -1,
							target_variable: 'remaining_action_points',
							target_obj_uuid: me.unique_id,
						});
					}
				}			
			})
		}

		if( me.current_hitpoints <= 0 ) {
			spawnees.push(New_Custom_Object({
				get_GM_instance: me.get_GM_instance,
				pixel_pos: me.pixel_pos,
				type_name: 'skull_icon' as CustomObjectTypeName,
				creation_timestamp: offset_in_ms,
				should_remove: false,
				text: ``,
				delegate_state: {},
			}));


			change_list.push({
				type: 'set',
				value: true,
				target_variable: 'should_remove',
				target_obj_uuid: me.unique_id,
			});

		}
	},

	process_single_frame: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
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
		const animation_segment = me.current_walk_anim_segment;

		if( animation_segment ){
			let time_offset_in_anim_segment = (offset_in_ms - animation_segment.start_time);
			let time_offset_normalized = 1.0 - (time_offset_in_anim_segment / animation_segment.duration)
			
			return ƒ.round_point_to_nearest_pixel( 
				ƒ.tween_points(
					Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( _TM, animation_segment.start_pos ),
					Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( _TM, animation_segment.end_pos ),
					time_offset_normalized
				)
			);
		} else {
			return me.pixel_pos;
		}
	},

	

/*----------------------- animation — full info -----------------------*/
	yield_current_animation_type: (me: Creature_Data, _TM: Tilemap_Manager_Data, offset_in_ms: number): 'stand'|'walk'|'attack' => {
		if( me.current_walk_anim_segment != undefined ){
			return 'walk';
		} else if (false){
			return 'attack';
		} else {
			return 'stand';
		}
	},

	yield_animation_asset_for_time: (me: Creature_Data, _TM: Tilemap_Manager_Data, offset_in_ms: number):  string => {
		const anim_type = Creature_ƒ.yield_current_animation_type( me, _TM, offset_in_ms);

		return {
			walk: Creature_ƒ.yield_walk_asset_for_direction( me, me.facing_direction ),
			attack: Creature_ƒ.yield_stand_asset_for_direction( me, me.facing_direction ),
			stand: Creature_ƒ.yield_stand_asset_for_direction( me, me.facing_direction ),
		}[anim_type];
	},
}





