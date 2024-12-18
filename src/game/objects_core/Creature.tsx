import _, { cloneDeep, find, isBoolean, map, size } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../interfaces';
import { Custom_Object_Type_Name, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "./Custom_Object";
import { Base_Object_Data, New_Base_Object } from "./Base_Object";
import { Creature_Delegate, CT_Hermit_ƒ, CT_Human_Footman_ƒ, CT_Peasant_ƒ, CT_Skeleton_ƒ, CT_Undead_Javelineer_ƒ } from "./Creature_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../core/engine/Game_Manager";
import { Creature_Behavior_ƒ } from "./Creature_Behavior";
import { Asset_Manager_Data } from "../core/engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data } from "../core/engine/Blit_Manager";
import { add, filter, includes, reduce } from "ramda";



export type Path_Node_With_Direction = {
	position: Point2D,
	direction: Direction,
}

export type Creature_Type_Name = 'hermit' | 'peasant' | 'skeleton' | 'undead_javelineer' | 'human_footman';



export type Change_Type = 
	'add' |
	'set';


export type Behavior_Mode = 
	'stand' |
	'walk' |
	'attack';


export type Change_Instance = {
	type: Change_Type,
	value: Change_Value,
	target_variable: keyof Creature_Data,
	target_obj_uuid: string, //uuid, actually
};

type Creature_Keys = (keyof Creature_Data & keyof Base_Object_Data);

export type Variable_Specific_Change_Instance = {
	type: Change_Type,
	value: Change_Value,
}

export type Change_Value = (number|string|Point2D|boolean|Path_Data|Creature_Data);


export type Creature_Data = {
	//static values
	type_name: Creature_Type_Name;
	team: number;

	//state	
	tile_pos: Point2D;
	facing_direction: Direction;
	remaining_action_points: number,
	remaining_move_points: number,
	current_hitpoints: number,
	last_changed_hitpoints: number,
	last_behavior_reconsideration_timestamp: number,
	next_behavior_reconsideration_timestamp: number,
	is_done_with_turn: boolean,
	behavior_mode: Behavior_Mode,

	//intended moves
	planned_tile_pos: Point2D;
	walk_segment_start_time: number,
	path_data: Path_Data;
	target?: Creature_Data;
} & Base_Object_Data;

export type Anim_Schedule_Element = {
	direction: Direction,
	duration: number,
	start_time: number,
	start_pos: Point2D,
	end_pos: Point2D,
}

export type Path_Data = {
	path_this_turn: Array<Point2D>;
	path_this_turn_with_directions: Array<Path_Node_With_Direction>;
	path_reachable_this_turn: Array<Point2D>;
	path_reachable_this_turn_with_directions: Array<Path_Node_With_Direction>;
}

export const path_data_empty = {
	path_this_turn: [],
	path_this_turn_with_directions: [],
	path_reachable_this_turn: [],
	path_reachable_this_turn_with_directions: [],
}


export const New_Creature = (
	p: {
		get_GM_instance: () => Game_Manager_Data;
		_Asset_Manager: () => Asset_Manager_Data,
		_Blit_Manager: () => Blit_Manager_Data,
		_Tilemap_Manager: () => Tilemap_Manager_Data,

		tile_pos: Point2D,
		direction?: Direction,
		remaining_action_points?: number,
		remaining_move_points?: number,
		current_hitpoints?: number,
		last_changed_hitpoints?: number,
		last_behavior_reconsideration_timestamp?: number,
		next_behavior_reconsideration_timestamp?: number,
		is_done_with_turn: boolean,
		behavior_mode: Behavior_Mode,
		planned_tile_pos: Point2D,
		target?: Creature_Data
		type_name: Creature_Type_Name,
		team: number,
		unique_id?: string,
		creation_timestamp: number,
		should_remove: boolean,
	}): Creature_Data => {
	return {
		...New_Base_Object({
			get_GM_instance: p.get_GM_instance,
			_Asset_Manager: p._Asset_Manager,
			_Blit_Manager: p._Blit_Manager,
			_Tilemap_Manager: p._Tilemap_Manager,
			pixel_pos: Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(p._Tilemap_Manager(), p._Asset_Manager(), p.tile_pos),
			unique_id: p.unique_id,
			should_remove: p.should_remove,
			creation_timestamp: p.creation_timestamp,
			is_done_with_turn: p.is_done_with_turn,
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
		last_behavior_reconsideration_timestamp: ƒ.if(p.last_behavior_reconsideration_timestamp !== undefined,
			p.last_behavior_reconsideration_timestamp,
			0,
		),
		next_behavior_reconsideration_timestamp: ƒ.if(p.next_behavior_reconsideration_timestamp !== undefined,
			p.next_behavior_reconsideration_timestamp,
			0,
		),
		target: p.target,
		behavior_mode: p.behavior_mode,


		//intended moves
		planned_tile_pos: p.planned_tile_pos,
		walk_segment_start_time: 0,
		path_data: cloneDeep(path_data_empty),
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
		last_behavior_reconsideration_timestamp: 0,
		last_changed_hitpoints: -300,
		remaining_action_points: 1,
		planned_tile_pos: me.tile_pos,
		path_data: cloneDeep(path_data_empty),
		behavior_mode: 'stand',
		target: undefined,
		is_done_with_turn: false,
		remaining_move_points: Creature_ƒ.get_delegate(me.type_name).yield_moves_per_turn()
	})
),
/*----------------------- introspection -----------------------*/
	list_all_creature_types: (): Array<Creature_Type_Name> => {
		return ['hermit','peasant','skeleton','undead_javelineer','human_footman'];
	},

/*----------------------- run time type guards -----------------------*/

	isPoint2D: (value: ValueOf<Creature_Data>): value is Point2D => {
		return _.isObject(value) && (value as Point2D).x !== undefined && (value as Point2D).y !== undefined;
	},

	isPathData: (value: ValueOf<Creature_Data>): value is Path_Data => {
		return _.isObject(value) && (value as Path_Data).path_reachable_this_turn !== undefined && (value as Path_Data).path_reachable_this_turn_with_directions !== undefined;
	},

	isCreatureData: (value: ValueOf<Creature_Data>): value is Creature_Data => {
		return _.isObject(value) && (value as Creature_Data).behavior_mode !== undefined && (value as Creature_Data).is_done_with_turn !== undefined;
	},
	
	
	isDirection: (value: ValueOf<Creature_Data>): value is Direction => {
		return (
			_.isString(value)
			&& 
			includes(value,
				['north_east',
				'east',
				'south_east',
				'north_west',
				'west',
				'south_west']
			)
		)
	},

	get_value_type: (value: ValueOf<Creature_Data>): 'Point2D' | 'Direction' | 'string' | 'number' | 'undefined' | 'boolean' | 'Path_Data' | 'Creature_Data' => {
		if( isBoolean(value) ){
			return 'boolean';
		} else if ( _.isUndefined(value) ) {
			return 'undefined';
		} else if( Creature_ƒ.isPoint2D(value) ){
			return 'Point2D';
		} else if ( Creature_ƒ.isDirection(value) ){
			return 'Direction';
		} else if ( Creature_ƒ.isPathData(value) ){
			return 'Path_Data';
		} else if ( _.isString(value) ){
			return 'string';
		} else if ( Creature_ƒ.isCreatureData(value) ){
			return 'Creature_Data';
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

	yield_attack_asset_for_direction: (me: Creature_Data, direction: Direction):string => (
		Creature_ƒ.get_delegate(me.type_name).yield_attack_asset_for_direction(Creature_ƒ.get_delegate(me.type_name), direction)
	),


	yield_creature_image: (me: Creature_Data) => (
		Creature_ƒ.get_delegate(me.type_name).yield_creature_image()
	),



	get_current_tile_pos_from_pixel_pos: (me: Creature_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Point2D => (
		Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, me.pixel_pos)
	),


/*----------------------- basetype management -----------------------*/


	get_delegate: (type_name: Creature_Type_Name): Creature_Delegate => {
		return {
			hermit: CT_Hermit_ƒ,
			peasant: CT_Peasant_ƒ,
			skeleton: CT_Skeleton_ƒ,
			undead_javelineer: CT_Undead_Javelineer_ƒ,
			human_footman: CT_Human_Footman_ƒ,
		}[type_name];
	},

/*----------------------- state management -----------------------*/
	apply_changes: (
		me: Creature_Data,
		change_list: Array<Change_Instance>,
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
		let separate_changes_by_key: { [key in Creature_Keys]?: Array<Variable_Specific_Change_Instance> } = 
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

			//this gives us a series of i.e:  { hitpoints:  Array<Variable_Specific_Change_Instance> }, so we need to combine all of these into a single master object, with one key per variable affected.

		let _collated_changes_by_key = _.reduce(separate_changes_by_key, (a,b)=>{
			return _.assign(a,b);
		});

		let collated_changes_by_key: { [key in Creature_Keys]: Array<Variable_Specific_Change_Instance> } = ƒ.if(_collated_changes_by_key != undefined,
			_collated_changes_by_key,
			{}
		)

		let reduced_changes_by_key: Partial<Creature_Data> = _.mapValues( collated_changes_by_key,
			(val: Array<Variable_Specific_Change_Instance>, key: Creature_Keys) => {
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
		incoming_changes: Array<Variable_Specific_Change_Instance>,
		key: Creature_Keys
	):ValueOf<Creature_Data> => {
		/*
			If we have a set operation on this frame, then it overwrites any changes made by an add op.  Make sure the set operations come after any add operations. 
		*/
		// let sorted_values: Array<Variable_Specific_Change_Instance> = _.sortBy(incoming_changes, (val)=>(
		// 	ƒ.if(val.type == 'add',
		// 		1,
		// 		2
		// 	)
		// )) 
		

		// this is some absolute hobgoblin shit because apparently, javascript object children which we're using for a concise switch statement (because we can't have proper Pattern Matching) are actually evaluated greedily, and I'm too lazy to back that out right now.  Fuck JS.
		let guard = (condition: boolean, action: Function) => {
			if(condition){
				return action();
			}
		}

		let add_changes: Array<Change_Value> = map(filter((val)=>(val.type == 'add'), incoming_changes), (val)=>(val.value));
		let set_changes: Array<Change_Value>= map(filter((val)=>(val.type == 'set'), incoming_changes), (val)=>(val.value));

		let reduced_add_op = reduce(
			(a, b) => {
				let value_type = Creature_ƒ.get_value_type(a) != 'undefined' ? Creature_ƒ.get_value_type(a) : Creature_ƒ.get_value_type(b as ValueOf<Creature_Data>)

				return {
					string: (a as unknown as string) + (b as unknown as string),
					number: (a as unknown as number) + (b as unknown as number),
					Direction: (b as unknown as Direction), //no coherent way to add Directions, so we treat it as 'set'
					Point2D: guard(value_type=='Point2D', ()=> Add_Point_2D( (a as unknown as Point2D), (b as unknown as Point2D) )),
					boolean: (a as unknown as boolean) && (b as unknown as boolean),
					Path_Data: (b as unknown as Path_Data), //no coherent way to add Paths, so we treat it as 'set'
					Creature_Data: (b as unknown as Creature_Data),  //no coherent way to add Creatures, so we treat it as 'set'
					undefined: undefined,
				}[value_type]
			},
			me[key] as ValueOf<Creature_Data>,
			add_changes
		);

		let reduced_set_op = reduce(
			(a, b) => {
				let value_type = Creature_ƒ.get_value_type(a) != 'undefined' ? Creature_ƒ.get_value_type(a) : Creature_ƒ.get_value_type(b as ValueOf<Creature_Data>)

				return {
					string: (b as unknown as string),
					number: (b as unknown as number),
					Direction: (b as unknown as Direction),
					Point2D: (b as unknown as Point2D),
					boolean: (b as unknown as boolean),
					Path_Data: (b as unknown as Path_Data),
					Creature_Data: (b as unknown as Creature_Data),
					undefined: undefined,
				}[value_type]
			},
			me[key] as ValueOf<Creature_Data>,
			set_changes
		)

		if(size(set_changes)){
			/*
				Any set() ops will obliterate add() ops, so just take all of them at face value, and wipe out the adds.
			*/
			return reduced_set_op;
		} else {
			return reduced_add_op;
		}
	},



	add: (
		change_list: Array<Change_Instance>,
		me: Creature_Data,
		target_variable: keyof Creature_Data,
		value: Change_Value,
	) => {

		change_list.push({
			type: 'add',
			value: value,
			target_variable: target_variable,
			target_obj_uuid: me.unique_id,
		});		
	},

	set: (
		change_list: Array<Change_Instance>,
		me: Creature_Data,
		target_variable: keyof Creature_Data,
		value: Change_Value,
	) => {

		change_list.push({
			type: 'set',
			value: value,
			target_variable: target_variable,
			target_obj_uuid: me.unique_id,
		});		
	}
}





