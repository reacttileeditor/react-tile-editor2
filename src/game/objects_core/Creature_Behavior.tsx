
import _, { cloneDeep, filter, find, isBoolean, isEqual, map, size } from "lodash";

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


		//console.log("directional path", me.path_this_turn_with_directions)

		//Creature_ƒ.build_anim_from_path(me,_TM);

		//console.log('anim:', me.animation_this_turn)
	},
	
	yield_path_reachable_this_turn: (me: Creature_Data, _TM: Tilemap_Manager_Data, new_path: Array<Point2D>):Array<Point2D> => {
		let moves_remaining = Creature_ƒ.yield_moves_per_turn(me);
		let final_path: Array<Point2D> = [];
	
		_.map( new_path, (val) => {
			const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				val,
				'terrain',
			);
			const move_cost = Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type) ?? 1;

			moves_remaining = moves_remaining - move_cost;
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	},

	yield_directional_path_reachable_this_turn: (me: Creature_Data, _TM: Tilemap_Manager_Data, new_path: Array<PathNodeWithDirection>):Array<PathNodeWithDirection> => {
		let moves_remaining = Creature_ƒ.yield_moves_per_turn(me);
		let final_path: Array<PathNodeWithDirection> = [];
	
		_.map( new_path, (val) => {
			const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				val.position,
				'terrain',
			);
			const move_cost = Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type) ?? 1;

			moves_remaining = moves_remaining - move_cost;
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	},

	
	build_anim_from_path: (me: Creature_Data, _TM: Tilemap_Manager_Data, initial_time_so_far: number = 0) => {
		var time_so_far = initial_time_so_far;
		me.animation_this_turn = [];

		_.map(me.path_reachable_this_turn, (val,idx) => {
			if(idx != _.size(me.path_reachable_this_turn) - 1){
				me.animation_this_turn.push({
					direction: Creature_ƒ.extract_direction_from_map_vector(
						me,
						val,
						me.path_reachable_this_turn[idx + 1],
						_TM
					),
					duration: 300,
					start_time: time_so_far,
					start_pos: val,
					end_pos: me.path_reachable_this_turn[idx + 1],
				})
				if(idx == 1){
					me.next_anim_reconsideration_timestamp = initial_time_so_far + 300;
				}


				time_so_far = time_so_far + 300;
			}
		})
	},

	build_directional_path_from_path: (
		me: Creature_Data,
		raw_path: Array<Point2D>,
		_TM: Tilemap_Manager_Data
	): Array<PathNodeWithDirection> => (

		_.map( raw_path, (val, idx) => {


			if( idx == 0){
				return {
					position: raw_path[idx],
					direction: me.facing_direction
				}
			} else {
				return {
					position: raw_path[idx],
					direction: Creature_ƒ.extract_direction_from_map_vector(
						me,
						raw_path[idx - 1],
						raw_path[idx],
						_TM
					)
				}
			}
		} )
	),

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
	
	calculate_total_anim_duration: (me: Creature_Data): number => {
		return ƒ.if( _.size(me.animation_this_turn) > 0,
			_.reduce(
				_.map(me.animation_this_turn, (val)=> (val.duration)),
				(left,right) => (left + right)
			) as number,
			0
		)
	},




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

			Big bit of temporary bullshit here:  we're axing resolving moves at the end of the turn, so we need to do it here.  Doing it properly is going to be ugly/complicated/etc, so for now we're doing a huge copout/cheat, and just setting the final position.
		*/
/*		let new_position: PathNodeWithDirection | undefined =
			_.last(
				(me.path_reachable_this_turn_with_directions)
*/					/*ƒ.dump(_.slice( creature.path_this_turn,
						0, //_.size(creature.path_this_turn) - creature.yield_moves_per_turn(),
						creature.yield_moves_per_turn()
					)),*/
				  //find literally the first available tile at the end of the path, don't give any hoot about whether it's occupied by another creature
/*			);
		
			//debugger;
		//if we didn't find *any* open slots, give up and remain at our current pos
		if( new_position == undefined){
			new_position = {
				position: me.tile_pos,
				direction: me.facing_direction,
			};
		}
*/
		/*
			If we are at a different tile position, we need to renegotiate our path — in the act of attempting to move to a new tile, we can assume that the next tile will be guaranteed to be open for movement (this is a temporary lie we're adopting to expedite development; we'll need to reconsider this, possibly on a per-frame basis of checking the tile we're moving towards and seeing if it's occupied, and thus, we're "bumped").

			Once we're at the new tile, though, we must reassess everything about what our plan of action is.  In the future, we'll reassess whether we're even walking further at all (perhaps we switch to attacking if available), but for now, we retain our "intended destination", and continue to walk towards it. 
		*/
		let current_tile_pos = Creature_ƒ.get_current_mid_turn_tile_pos(me, _TM);

		
		//if( !isEqual(current_tile_pos, me.tile_pos)) {
		if( offset_in_ms >= me.next_anim_reconsideration_timestamp ) {
				//we're at a new tile.  Pathfind a new route to our destination, in case something is now in the way.

			if(size(me.path_this_turn) > 0){
				console.log('BEFORE', me.animation_this_turn)
			}
			Creature_ƒ.set_path(
				me,
				Pathfinder_ƒ.find_path_between_map_tiles( _TM, current_tile_pos, me.planned_tile_pos, me ).successful_path,
				_TM
			);

			Creature_ƒ.build_anim_from_path(me,_TM, offset_in_ms);
			if(size(me.path_this_turn) > 0){
				console.log('AFTER',me.animation_this_turn)
			}
			/*
				Because we want not *merely* a tile, but also a direction, grab the first element from our new path.  We already know the tile (we had to to calculate the path), but this gives us the direction as well.
			*/ 
			let new_position: PathNodeWithDirection | undefined =
				_.first(
					(me.path_reachable_this_turn_with_directions)
				);

			//There actually should be no circumstance in which this fires, since pathfinding should always return at least ONE tile, but the type system isn't aware of that subtlety.  This code basically just says: give up and remain at our current pos
			if( new_position == undefined){
				new_position = {
					position: me.tile_pos,
					direction: me.facing_direction,
				};
			}				


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
		}

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
					Creature_ƒ.get_current_mid_turn_tile_pos(me, _TM),
					Creature_ƒ.get_current_mid_turn_tile_pos(target, _TM)
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

		/*-------- Updating pixel position --------*/
		let new_pos = Creature_ƒ.yield_position_for_time_in_post_turn_animation(me, _TM, offset_in_ms);

		change_list.push({
			type: 'set',
			value: new_pos,
			target_variable: 'pixel_pos',
			target_obj_uuid: me.unique_id,
		});



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


/*----------------------- data reading -----------------------*/

	yield_animation_segment_for_time_offset: (me: Creature_Data, offset_in_ms: number): Anim_Schedule_Element|undefined => (
		_.find(me.animation_this_turn, (val) => {
			//			console.log(`start ${val.start_time}, offset ${offset_in_ms}, end ${val.start_time + val.duration}`);
		
			return val.start_time <= offset_in_ms
			&&
			offset_in_ms < (val.start_time + val.duration)
		})
	),


	yield_direction_for_time_in_post_turn_animation: (me: Creature_Data, offset_in_ms: number ):Direction => {
		var animation_segment = Creature_ƒ.yield_animation_segment_for_time_offset(me, offset_in_ms);

		if(animation_segment == undefined){
			/*
				TODO -I don't really have the time to think through this - this comment's getting written during some test implementation.
				We'll just return 'east' for now.
			*/
			return 'east';
		} else {
			return animation_segment.direction;
		}
	},
	
	yield_position_for_time_in_post_turn_animation: (me: Creature_Data, _TM: Tilemap_Manager_Data, offset_in_ms: number):Point2D => {
//		console.log(me.animation_this_turn);
		var animation_segment = Creature_ƒ.yield_animation_segment_for_time_offset(me, offset_in_ms);
		
		if(animation_segment == undefined){
			/*
				There are a few reasons we might not be able to find a corresponding animation segment.
				If the desired time is off the end of the animation, return our final position.
				
				If it's absolutely anything else, then let's just return the initial starting position.  The most common case for this would be one where we just don't really have an animation.
				(Nominally this would include "before the start of the animation", but as much as that's an error case, it makes no sense why we'd end up there)
			*/

			if(offset_in_ms >= Creature_ƒ.calculate_total_anim_duration(me) ){
				return Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( _TM, me.planned_tile_pos)
			} else {
				return Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( _TM, me.tile_pos)
			}
		} else {
			//cheating for some test code - first we'll just do the start pos; then we'll linearly interpolate.   We want to linearly interpolate here, because any "actual" easing function should happen over the whole animation, not one segment (otherwise we'll have a very 'stuttery' movement pattern.
			
			let time_offset_in_anim_segment = (offset_in_ms - animation_segment.start_time);
			let time_offset_normalized = 1.0 - (time_offset_in_anim_segment / animation_segment.duration)
			
            return ƒ.round_point_to_nearest_pixel( 
                ƒ.tween_points(
                    Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( _TM, animation_segment.start_pos ),
                    Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( _TM, animation_segment.end_pos ),
                    time_offset_normalized
                )
            );
			
			//return _Tilemap_Manager.convert_tile_coords_to_pixel_coords(animation_segment.start_pos);
		}
	},
}





