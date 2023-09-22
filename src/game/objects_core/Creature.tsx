import _, { cloneDeep, filter, find, isBoolean, map, size } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { CustomObjectTypeName, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { Base_Object_Data, New_Base_Object } from "./Base_Object";
import { Creature_Delegate, CT_Hermit_ƒ, CT_Peasant_ƒ, CT_Skeleton_ƒ } from "./Creature_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { Creature_Behavior_ƒ } from "./Creature_Behavior";

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

type CreatureKeys = keyof Creature_Data & keyof Base_Object_Data;

export type VariableSpecificChangeInstance = {
	type: ChangeType,
	value: ChangeValue,
}

type ChangeValue = (number|string|Point2D|boolean);


export type Creature_Data = {
	//static values
	type_name: CreatureTypeName;
	team: number;

	//state	
	tile_pos: Point2D;
	facing_direction: Direction;
	remaining_action_points: number,
	remaining_move_points: number,
	current_hitpoints: number,
	last_changed_hitpoints: number,
	next_behavior_reconsideration_timestamp: number,
	current_walk_anim_segment?: Anim_Schedule_Element,
	is_done_with_turn: boolean,

	//intended moves
	planned_tile_pos: Point2D;
	path_this_turn: Array<Point2D>;
	path_this_turn_with_directions: Array<PathNodeWithDirection>;
	path_reachable_this_turn: Array<Point2D>;
	path_reachable_this_turn_with_directions: Array<PathNodeWithDirection>;
	animation_this_turn: Array<Anim_Schedule_Element>;	
} & Base_Object_Data;

export type Anim_Schedule_Element = {
	direction: Direction,
	duration: number,
	start_time: number,
	start_pos: Point2D,
	end_pos: Point2D,
}




export const New_Creature = (
	p: {
		get_GM_instance: () => Game_Manager_Data;
		_TM: Tilemap_Manager_Data,
		tile_pos: Point2D,
		direction?: Direction,
		remaining_action_points?: number,
		remaining_move_points?: number,
		current_hitpoints?: number,
		last_changed_hitpoints?: number,
		next_behavior_reconsideration_timestamp?: number,
		current_walk_anim_segment?: Anim_Schedule_Element,
		is_done_with_turn: boolean,
		planned_tile_pos: Point2D,
		type_name: CreatureTypeName,
		team: number,
		unique_id?: string,
		creation_timestamp: number,
		should_remove: boolean,
	}): Creature_Data => {
	return {
		...New_Base_Object({
			get_GM_instance: p.get_GM_instance,
			pixel_pos: Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(p._TM, p.tile_pos),
			unique_id: p.unique_id,
			should_remove: p.should_remove,
			creation_timestamp: p.creation_timestamp,
		}),

		//static values
		type_name: p.type_name,
		team: p.team,

		//state	
		tile_pos: p.tile_pos,
		facing_direction: ƒ.if(p.direction !== undefined, p.direction, 'south_east'),
		remaining_action_points: ƒ.if(p.remaining_action_points !== undefined, p.remaining_action_points, 1),
		remaining_move_points: ƒ.if(p.remaining_move_points !== undefined,
			p.remaining_move_points,
			Creature_ƒ.get_delegate(p.type_name).yield_moves_per_turn()
		),
		current_hitpoints: ƒ.if(p.current_hitpoints !== undefined,
			p.current_hitpoints,
			Creature_ƒ.get_delegate(p.type_name).yield_max_hitpoints()
		),
		last_changed_hitpoints: ƒ.if(p.current_hitpoints !== undefined,
			p.last_changed_hitpoints,
			-200,
		),
		next_behavior_reconsideration_timestamp: ƒ.if(p.next_behavior_reconsideration_timestamp !== undefined,
			p.next_behavior_reconsideration_timestamp,
			0,
		),
		current_walk_anim_segment: p.current_walk_anim_segment,
		is_done_with_turn: p.is_done_with_turn,


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
/*----------------------- function imports -----------------------*/
	...Creature_Behavior_ƒ,

/*----------------------- constructor/destructor stuff -----------------------*/

copy_for_new_turn: (me: Creature_Data): Creature_Data => (
	cloneDeep({
		...me,
		next_behavior_reconsideration_timestamp: 0,
		remaining_action_points: 1,
		planned_tile_pos: me.tile_pos,
		path_this_turn: [],
		path_this_turn_with_directions: [],
		path_reachable_this_turn: [],
		path_reachable_this_turn_with_directions: [],
		animation_this_turn: [],
		is_done_with_turn: false,
		remaining_move_points: Creature_ƒ.get_delegate(me.type_name).yield_moves_per_turn()
	})
),

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

	get_value_type: (value: ValueOf<Creature_Data>): 'Point2D' | 'Direction' | 'string' | 'number' | 'boolean' => {
		if( isBoolean(value) ){
			return 'boolean';
		} else if( Creature_ƒ.isPoint2D(value) ){
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



	get_current_tile_pos_from_pixel_pos: (me: Creature_Data, _TM: Tilemap_Manager_Data): Point2D => (
		Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, me.pixel_pos)
	),


/*----------------------- basetype management -----------------------*/


	get_delegate: (type_name: CreatureTypeName): Creature_Delegate => {
		return {
			hermit: CT_Hermit_ƒ,
			peasant: CT_Peasant_ƒ,
			skeleton: CT_Skeleton_ƒ,
		}[type_name];
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
	):number|string|Point2D|boolean|Direction => {
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
							Point2D: (b.value as unknown as Point2D),
							boolean: (b.value as unknown as boolean)
						}[Creature_ƒ.get_value_type(a.value)]
					},
					{
						type: 'add',
						value: {
							string: (a.value as unknown as string) + (b.value as unknown as string),
							number: (a.value as unknown as number) + (b.value as unknown as number),
							Direction: (b.value as unknown as Direction), //no coherent way to add Directions, so we treat it as 'set'
							Point2D: Add_Point_2D( (a.value as unknown as Point2D), (b.value as unknown as Point2D) ),
							boolean: (a.value as unknown as boolean) && (b.value as unknown as boolean)
						}[Creature_ƒ.get_value_type(a.value)]
					}
				);
			},
			{type: 'set', value: me[key]}
		) as VariableSpecificChangeInstance;

		return reduced_values.value;
	},




}





