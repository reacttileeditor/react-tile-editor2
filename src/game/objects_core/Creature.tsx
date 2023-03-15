import React from "react";
import ReactDOM from "react-dom";
import _, { cloneDeep, find, size } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/Utils";

// import { Canvas_View } from "./Canvas_View";
// import { Asset_Manager } from "./Asset_Manager";
// import { Blit_Manager } from "./Blit_Manager";
// import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Tilemap_Manager, Direction } from "../core/Tilemap_Manager";
import { Pathfinder, Pathfinding_Result } from "../core/Pathfinding";

import { Point2D, Rectangle } from '../interfaces';
import { CustomObjectTypeName, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { Game_State } from "../core/Game_View";
import { Base_Object_Data, New_Base_Object } from "./Base_Object";
import { Creature_Delegate, CT_Hermit_ƒ, CT_Peasant_ƒ, CT_Skeleton_ƒ } from "./Creature_Delegate";

export type PathNodeWithDirection = {
	position: Point2D,
	direction: Direction,
}

export type CreatureTypeName = 'hermit' | 'peasant' | 'skeleton';


export type ChangeType = 
	'add' |
	'set';



export type ChangeInstance = {
	type: ChangeType,
	value: ChangeValue,
	target_variable: keyof Creature_Data,
	target_obj_uuid: string, //uuid, actually
};

type CreatureKeys = keyof Creature_Data;

export type VariableSpecificChangeInstance = {
	type: ChangeType,
	value: ChangeValue,
}

type ChangeValue = (number|string|Point2D);


export type Creature_Data = {
	//static values
	type_name: CreatureTypeName;
	team: number;

	//state	
	tile_pos: Point2D;
	facing_direction: Direction;
	remaining_action_points: number,
	current_hitpoints: number,
	last_changed_hitpoints: number,

	//intended moves
	planned_tile_pos: Point2D;
	path_this_turn: Array<Point2D>;
	path_this_turn_with_directions: Array<PathNodeWithDirection>;
	path_reachable_this_turn: Array<Point2D>;
	path_reachable_this_turn_with_directions: Array<PathNodeWithDirection>;
	animation_this_turn: Array<Anim_Schedule_Element>;	
} & Base_Object_Data;

type Anim_Schedule_Element = {
	direction: Direction,
	duration: number,
	start_time: number,
	start_pos: Point2D,
	end_pos: Point2D,
}




export const New_Creature = (
	p: {
		get_game_state:  () => Game_State,
		tile_pos: Point2D,
		direction?: Direction,
		remaining_action_points?: number,
		current_hitpoints?: number,
		last_changed_hitpoints?: number,
		planned_tile_pos: Point2D,
		type_name: CreatureTypeName,
		team: number,
		unique_id?: string,
	}): Creature_Data => {
	return {
		...New_Base_Object({
			get_game_state: p.get_game_state,
			pixel_pos: {x:0, y: 0}, //TODO use TM
			unique_id: p.unique_id,
		}),

		//static values
		type_name: p.type_name,
		team: p.team,

		//state	
		tile_pos: p.tile_pos,
		facing_direction: ƒ.if(p.direction !== undefined, p.direction, 'south_east'),
		remaining_action_points: ƒ.if(p.remaining_action_points !== undefined, p.remaining_action_points, 2),
		current_hitpoints: ƒ.if(p.current_hitpoints !== undefined,
			p.current_hitpoints,
			Creature_ƒ.get_delegate(p.type_name).yield_max_hitpoints
		),
		last_changed_hitpoints: ƒ.if(p.current_hitpoints !== undefined,
			p.last_changed_hitpoints,
			-50,
		),


		//intended moves
		planned_tile_pos: p.planned_tile_pos,
		path_this_turn: [],
		path_this_turn_with_directions: [],
		path_reachable_this_turn: [],
		path_reachable_this_turn_with_directions: [],
		animation_this_turn: [],
	}	
}


const Add_Point_2D = (a: Point2D, b: Point2D): Point2D => ({
	x: a.x + b.x,
	y: a.y + b.y
})

type ValueOf<T> = T[keyof T];

export const Creature_ƒ = {
/*----------------------- run time type guards -----------------------*/

	isPoint2D: (value: ValueOf<Creature_Data>): value is Point2D => {
		return _.isObject(value) && (value as Point2D).x !== undefined && (value as Point2D).y !== undefined;
	},

	isDirection: (value: ValueOf<Creature_Data>): value is Direction => {
		return value as Direction in ['north_east',
		'east',
		'south_east',
		'north_west',
		'west',
		'south_west']
	},

	get_value_type: (value: ValueOf<Creature_Data>): 'Point2D' | 'Direction' | 'string' | 'number' => {
		if( Creature_ƒ.isPoint2D(value) ){
			return 'Point2D';
		} else if ( Creature_ƒ.isDirection(value) ){
			return 'Direction';
		} else if ( _.isString(value) ){
			return 'string';
		} else {
			return 'number';
		}
	},

/*----------------------- getters -----------------------*/

	yield_move_cost_for_tile_type: (me: Creature_Data, tile_type: string): number|null => (
		Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type)
	),
	
	yield_moves_per_turn: (me: Creature_Data,): number => (
		Creature_ƒ.get_delegate(me.type_name).yield_moves_per_turn()
	),
	
	yield_walk_asset_for_direction: (me: Creature_Data, direction: Direction):string => (
		Creature_ƒ.get_delegate(me.type_name).yield_walk_asset_for_direction(Creature_ƒ.get_delegate(me.type_name), direction)
	),

	yield_stand_asset_for_direction: (me: Creature_Data, direction: Direction):string => (
		Creature_ƒ.get_delegate(me.type_name).yield_stand_asset_for_direction(Creature_ƒ.get_delegate(me.type_name), direction)
	),


	yield_creature_image: (me: Creature_Data) => (
		Creature_ƒ.get_delegate(me.type_name).yield_creature_image()
	),



	get_current_mid_turn_tile_pos: (me: Creature_Data, TM: Tilemap_Manager): Point2D => (
		TM.convert_pixel_coords_to_tile_coords(me.pixel_pos)
	),
/*----------------------- constructor/destructor stuff -----------------------*/

	copy_for_new_turn: (me: Creature_Data): Creature_Data => (
		cloneDeep({
			...me,
			remaining_action_points: 2,
			planned_tile_pos: me.tile_pos,
			path_this_turn: [],
			path_this_turn_with_directions: [],
			path_reachable_this_turn: [],
			path_reachable_this_turn_with_directions: [],
			animation_this_turn: [],
		})
	),


/*----------------------- basetype management -----------------------*/


	get_delegate: (type_name: CreatureTypeName): Creature_Delegate => {
		return {
			hermit: CT_Hermit_ƒ,
			peasant: CT_Peasant_ƒ,
			skeleton: CT_Skeleton_ƒ,
		}[type_name];
	},

/*----------------------- movement -----------------------*/

	set_path: (me: Creature_Data, new_path: Array<Point2D>, _Tilemap_Manager: Tilemap_Manager) => {
		me.path_this_turn = new_path;
		me.path_reachable_this_turn = Creature_ƒ.yield_path_reachable_this_turn(me,new_path);
		
		me.path_this_turn_with_directions = Creature_ƒ.build_directional_path_from_path(
			me,
			me.path_this_turn,
			_Tilemap_Manager
		);

		me.path_reachable_this_turn_with_directions = Creature_ƒ.yield_directional_path_reachable_this_turn(me, me.path_this_turn_with_directions);


		//console.log("directional path", me.path_this_turn_with_directions)

		Creature_ƒ.build_anim_from_path(me,_Tilemap_Manager);

		//console.log('anim:', me.animation_this_turn)
	},
	
	yield_path_reachable_this_turn: (me: Creature_Data, new_path: Array<Point2D>):Array<Point2D> => {
		let moves_remaining = Creature_ƒ.yield_moves_per_turn(me);
		let final_path: Array<Point2D> = [];
	
		_.map( new_path, (val) => {
			moves_remaining = moves_remaining - 1;
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	},

	yield_directional_path_reachable_this_turn: (me: Creature_Data, new_path: Array<PathNodeWithDirection>):Array<PathNodeWithDirection> => {
		let moves_remaining = Creature_ƒ.yield_moves_per_turn(me);
		let final_path: Array<PathNodeWithDirection> = [];
	
		_.map( new_path, (val) => {
			moves_remaining = moves_remaining - 1;
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	},

	
	build_anim_from_path: (me: Creature_Data, _Tilemap_Manager: Tilemap_Manager) => {
		var time_so_far = 0;
		me.animation_this_turn = [];

		_.map(me.path_reachable_this_turn, (val,idx) => {
			if(idx != _.size(me.path_reachable_this_turn) - 1){
				me.animation_this_turn.push({
					direction: Creature_ƒ.extract_direction_from_map_vector(
						me,
						val,
						me.path_reachable_this_turn[idx + 1],
						_Tilemap_Manager
					),
					duration: 300,
					start_time: time_so_far,
					start_pos: val,
					end_pos: me.path_reachable_this_turn[idx + 1],
				})
				
				time_so_far = time_so_far + 300;
			}
		})
	},

	build_directional_path_from_path: (
		me: Creature_Data,
		raw_path: Array<Point2D>,
		_Tilemap_Manager: Tilemap_Manager
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
						_Tilemap_Manager
					)
				}
			}
		} )
	),

	extract_direction_from_map_vector: (
		me: Creature_Data,
		start_pos: Point2D,
		end_pos: Point2D,
		_Tilemap_Manager: Tilemap_Manager
	):Direction => {
		const pixel_start_pos = _Tilemap_Manager.convert_tile_coords_to_pixel_coords(start_pos);
		const pixel_end_pos = _Tilemap_Manager.convert_tile_coords_to_pixel_coords(end_pos);

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


/*----------------------- state management -----------------------*/
	apply_changes: (
		me: Creature_Data,
		change_list: Array<ChangeInstance>,
	): Creature_Data => {
		//_.map( _.range( _.size(change_list) ), ()=> )

		let unique_keys = _.uniq(_.map(change_list, (val)=>(
			val.target_variable
		)))

		/*
			The goal of this fairly -sweaty- function is to build a single object where each possible variable being affected is listed as a key.   Each key then will tally up an array of the potential changes we might be applying to an object — it might not be unreasonable, at all, to for example, have multiple other objects trying to change a target's hitpoints.

			We then need to 'reduce' this using some kind of special, bespoke logic.
		*/
		//@ts-ignore
		let separate_changes_by_key: { [key in CreatureKeys]?: Array<VariableSpecificChangeInstance> } = 
			_.mapValues(unique_keys, (target_variable) => ({
				//@ts-ignore
				[target_variable]: _.map(
					_.filter(change_list, (changeVal) => (
						changeVal.target_variable == target_variable
					)),
					(change_to_correct_variable) => ({
						type: change_to_correct_variable.type,
						value: change_to_correct_variable.value
					})
				)
			}))

			//this gives us a series of i.e:  { hitpoints:  Array<VariableSpecificChangeInstance> }, so we need to combine all of these into a single master object, with one key per variable affected.

		let _collated_changes_by_key = _.reduce(separate_changes_by_key, (a,b)=>{
			return _.assign(a,b);
		});

		let collated_changes_by_key: { [key in CreatureKeys]: Array<VariableSpecificChangeInstance> } = ƒ.if(_collated_changes_by_key != undefined,
			_collated_changes_by_key,
			{}
		)

		let reduced_changes_by_key: Partial<Creature_Data> = _.mapValues( collated_changes_by_key,
			(val: Array<VariableSpecificChangeInstance>, key: CreatureKeys) => {
				return Creature_ƒ.reduce_individual_change_type(me, val, key)
			});


		 
		
		let final_value = _.assign(
			_.cloneDeep(me),
			reduced_changes_by_key
		);
		return final_value;

	},

	/*object_key_to_type: () => {
		//do some run time type alleging here
	}*/

		//@ts-ignore
	reduce_individual_change_type: (
		me: Creature_Data,
		incoming_changes: Array<VariableSpecificChangeInstance>,
		key: CreatureKeys
	):number|string|Point2D => {
		/*
			If we have a set operation on this frame, then it overwrites any changes made by an add op.  Make sure the set operations come after any add operations. 
		*/
		let sorted_values: Array<VariableSpecificChangeInstance> = _.sortBy(incoming_changes, (val)=>(
			ƒ.if(val.type == 'add',
				1,
				2
			)
		)) 
		
		let reduced_values: VariableSpecificChangeInstance = _.reduce(
			sorted_values,
			(a, b) => {
				return 	ƒ.if(b.type == 'set',
					{
						type: 'set', //we're passing this to satisfy the typechecker, but it's going to be ignored.
						value: {
							string: (b.value as unknown as string),
							number: (b.value as unknown as number),
							Direction: (b.value as unknown as Direction),
							Point2D: (b.value as unknown as Point2D)
						}[Creature_ƒ.get_value_type(a.value)]
					},
					{
						type: 'add',
						value: {
							string: (a.value as unknown as string) + (b.value as unknown as string),
							number: (a.value as unknown as number) + (b.value as unknown as number),
							Direction: (b.value as unknown as Direction), //no coherent way to add Directions, so we treat it as 'set'
							Point2D: Add_Point_2D( (a.value as unknown as Point2D), (b.value as unknown as Point2D) )
						}[Creature_ƒ.get_value_type(a.value)]
					}
				);
			},
			{type: 'set', value: me[key]}
		) as VariableSpecificChangeInstance;

		return reduced_values.value;
	},



	process_single_frame: (
		me: Creature_Data,
		TM: Tilemap_Manager,
		offset_in_ms: number
	): {
		change_list: Array<ChangeInstance>,
		spawnees: Array<Custom_Object_Data>
	} => {



		let change_list: Array<ChangeInstance> = [];
		let new_pos = Creature_ƒ.yield_position_for_time_in_post_turn_animation(me, TM, offset_in_ms);

		change_list.push({
			type: 'set',
			value: new_pos,
			target_variable: 'pixel_pos',
			target_obj_uuid: me.unique_id,
		});

		if(me.type_name == 'peasant'){
			console.log(`: ${new_pos.x} ${new_pos.y}`)
		}


		const spawnees: Array<Custom_Object_Data> = ƒ.if(offset_in_ms >= 20 && offset_in_ms <= 100 && me.type_name == 'peasant', [New_Custom_Object({
			get_game_state: me.get_game_state,
			pixel_pos: new_pos,
			type_name: 'shot' as CustomObjectTypeName,
		})], []);

		/*
			MOVEMENT:

			Big bit of temporary bullshit here:  we're axing resolving moves at the end of the turn, so we need to do it here.  Doing it properly is going to be ugly/complicated/etc, so for now we're doing a huge copout/cheat, and just setting the final position.
		*/
		let new_position: PathNodeWithDirection | undefined =
			_.last(
				(me.path_reachable_this_turn_with_directions)
					/*ƒ.dump(_.slice( creature.path_this_turn,
						0, //_.size(creature.path_this_turn) - creature.yield_moves_per_turn(),
						creature.yield_moves_per_turn()
					)),*/
				  //find literally the first available tile at the end of the path, don't give any hoot about whether it's occupied by another creature
			);
		
			//debugger;
		//if we didn't find *any* open slots, give up and remain at our current pos
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
		
		
		/*
			DAMAGE:
		*/
		const target = find( me.get_game_state().current_frame_state.creature_list, (val) => (
			val.type_name === 'hermit'
		));
		


		if( me.type_name == 'peasant' && target){


			//console.log(`test ${new_obj.pixel_pos.x} ${new_obj.pixel_pos.y}`)
			//console.log(`test ${me.pixel_pos.x} ${me.pixel_pos.y}`)

			//console.log( `distance between peasant and hermit: ${TM.get_tile_coord_distance_between(me.tile_pos, target.tile_pos)}`)
			console.log( `distance between peasant and hermit: ${TM.get_tile_coord_distance_between(Creature_ƒ.get_current_mid_turn_tile_pos(me,TM), Creature_ƒ.get_current_mid_turn_tile_pos(target,TM))}`)
			
			//console.log( `distance between peasant and hermit: ${TM.get_tile_coord_distance_between(Creature_ƒ.get_current_mid_turn_tile_pos(new_obj, TM), Creature_ƒ.get_current_mid_turn_tile_pos(target,TM))} ${Creature_ƒ.get_current_mid_turn_tile_pos(new_obj, TM).x} ${Creature_ƒ.get_current_mid_turn_tile_pos(new_obj, TM).y} ${Creature_ƒ.get_current_mid_turn_tile_pos(target, TM).x} ${Creature_ƒ.get_current_mid_turn_tile_pos(target, TM).y}`)

			if(me.remaining_action_points > 0){
				//console.error(me.current_hitpoints)

				//me.current_hitpoints = 5;
				console.error(me.current_hitpoints)
				//me.remaining_action_points -=1;

				change_list.push({
					type: 'add',
					value: -5,
					target_variable: 'current_hitpoints',
					target_obj_uuid: me.unique_id,
				});

				change_list.push({
					type: 'set',
					value: offset_in_ms,
					target_variable: 'last_changed_hitpoints',
					target_obj_uuid: me.unique_id,
				});
				
				
				spawnees.push(New_Custom_Object({
					get_game_state: me.get_game_state,
					pixel_pos: new_pos,
					type_name: 'text_label' as CustomObjectTypeName,
					text: '-5 hp'
				}));

				change_list.push({
					type: 'add',
					value: -1,
					target_variable: 'remaining_action_points',
					target_obj_uuid: me.unique_id,
				});
		
			}
		}

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
	
	yield_position_for_time_in_post_turn_animation: (me: Creature_Data, _Tilemap_Manager: Tilemap_Manager, offset_in_ms: number):Point2D => {
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
				return _Tilemap_Manager.convert_tile_coords_to_pixel_coords(me.planned_tile_pos)
			} else {
				return _Tilemap_Manager.convert_tile_coords_to_pixel_coords(me.tile_pos)
			}
		} else {
			//cheating for some test code - first we'll just do the start pos; then we'll linearly interpolate.   We want to linearly interpolate here, because any "actual" easing function should happen over the whole animation, not one segment (otherwise we'll have a very 'stuttery' movement pattern.
			
			let time_offset_in_anim_segment = (offset_in_ms - animation_segment.start_time);
			let time_offset_normalized = 1.0 - (time_offset_in_anim_segment / animation_segment.duration)
			
            return ƒ.round_point_to_nearest_pixel( 
                ƒ.tween_points(
                    _Tilemap_Manager.convert_tile_coords_to_pixel_coords( animation_segment.start_pos ),
                    _Tilemap_Manager.convert_tile_coords_to_pixel_coords( animation_segment.end_pos ),
                    time_offset_normalized
                )
            );
			
			//return _Tilemap_Manager.convert_tile_coords_to_pixel_coords(animation_segment.start_pos);
		}
	},
}





