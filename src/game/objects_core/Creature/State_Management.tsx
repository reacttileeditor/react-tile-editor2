import _, { cloneDeep, find, isBoolean, map, size } from "lodash";
import { v4 as uuid } from "uuid";

import { add_points, ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { add, filter, includes, reduce } from "ramda";
import { Change_Instance, Change_Value, Creature_Data, Creature_Keys, Creature_ƒ, Path_Data, ValueOf, Variable_Specific_Change_Instance } from "./Creature";



export const Creature_ƒ_State_Management = {
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

		let add_changes: Array<Change_Value> = map(filter((changeItem)=>(changeItem.type == 'add'), incoming_changes), (val: Variable_Specific_Change_Instance)=>(val.value));
		let set_changes: Array<Change_Value>= map(filter((changeItem)=>(changeItem.type == 'set'), incoming_changes), (val: Variable_Specific_Change_Instance)=>(val.value));

		let reduced_add_op = reduce(
			(a, b) => {
				let value_type = Creature_ƒ.get_value_type(a) != 'undefined' ? Creature_ƒ.get_value_type(a) : Creature_ƒ.get_value_type(b as ValueOf<Creature_Data>)

				return {
					string: (a as unknown as string) + (b as unknown as string),
					number: (a as unknown as number) + (b as unknown as number),
					Direction: (b as unknown as Direction), //no coherent way to add Directions, so we treat it as 'set'
					Point2D: guard(value_type=='Point2D', ()=> add_points( (a as unknown as Point2D), (b as unknown as Point2D) )),
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





