import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, find, findIndex, isEmpty, isEqual, isNil, isNumber, last, map, reduce, size, toArray, uniq } from "lodash";
import { includes } from "ramda"

import { constrain_point_within_rect, ƒ } from "../Utils";

import { Canvas_View, Mouse_Button_State } from "../../gui/Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../Blit_Manager";
import { Tile_Palette_Element } from "../../gui/Tile_Palette_Element";
import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ, Tilemap_Single } from "../Tilemap_Manager/Tilemap_Manager";
import { Pathfinder_ƒ } from "../Pathfinding";

import { Creature_ƒ, New_Creature, Creature_Data, Path_Node_With_Direction, Change_Instance, Creature_Type_Name } from "../../../objects_core/Creature/Creature";

import { Point2D, Rectangle } from '../../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { Tooltip_Data } from "../../gui/Game_View";
import { zorder } from "../../constants/zorder";
import { Vals } from "../../constants/Constants";
import { Game_Manager_Data, Game_Manager_ƒ, Game_and_Tilemap_Manager_Data } from "./Game_Manager";



export const Game_Manager_ƒ_Processing = {
/*----------------------- processing -----------------------*/


	
do_one_frame_of_processing: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Game_Manager_Data => {
	//me.update_game_state_for_ui(me.game_state);
	//me.update_tooltip_state( Game_Manager_ƒ.get_tooltip_data(me));
	
	if(me.animation_state.is_animating_live_game){
		return Game_Manager_ƒ.do_live_game_processing(me, _TM, _AM, _BM);
	} else {
		return Game_Manager_ƒ.do_paused_game_processing(me, _TM, _AM, _BM);
	}
},


do_live_game_processing: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Game_Manager_Data => {
	/*
		Process all of the existing creatures.
		
		The result of this will give us two lists;  one is a list of any Custom_Objects they're going to spawn, the other is a list of changes we would like to apply to our list of creatures.
	*/

	const tick = me.animation_state.processing_tick;

	if( Game_Manager_ƒ.is_turn_finished(me) ){

		return Game_Manager_ƒ.advance_turn_finish(me, _BM);


	} else {		
		let spawnees: Array<Custom_Object_Data<unknown>> = [];
		let master_change_list: Array<Change_Instance> = [];

		map( me.game_state.current_frame_state.creature_list, (val,idx) => {
			const processed_results = Creature_ƒ.process_single_frame(val, _TM, _AM, _BM, Game_Manager_ƒ.get_time_offset(me, _BM), tick);

			map(processed_results.spawnees, (val)=>{ spawnees.push(val) });
			map(processed_results.change_list, (val)=>{ master_change_list.push(val) });

		});


		/*
			Add the new custom_objects to our existing list, and then process all custom_objects (existing and new).
		*/
		let all_objects = concat( cloneDeep(me.game_state.custom_object_list), cloneDeep(spawnees));
		let all_objects_processed_data = map( all_objects, (val,idx) => {
			let parent_object: Custom_Object_Data<unknown> | undefined = undefined;

			if(val.parent_id !== undefined){
				parent_object = find(all_objects, (obj)=>(obj.unique_id == val.parent_id));

				console.error(parent_object?.type_name);
			}

			return (Custom_Object_ƒ.process_single_frame(val, _TM, Game_Manager_ƒ.get_time_offset(me, _BM), tick, parent_object))
		});



		let spawnees_phase2: Array<Custom_Object_Data<unknown>> = [];

		/*
			collate all of the changes and new objects
		*/
		map( all_objects_processed_data, (obj_val)=>{
			map(obj_val.spawnees, (val)=>{ spawnees_phase2.push(val) });
			map(obj_val.change_list, (val)=>{ master_change_list.push(val) });
		} );

		/*
			get the list of new objects
		*/
		const all_objects_processed = map(all_objects_processed_data, (val)=>(
			val.new_object
		));

		/*
			TODO: Major conundrum here!  We may want a recursive solution to ensure all processing happens in the same frame.  For the time being, this is too difficult to do, so we're doing the awful compromise that "objects spawned this turn" don't get a chance to process.

			This is important because otherwise any attempt to spawn an "object tree" is going to spread out all subsequent spawns frame by frame, which will be disastrous if we've got compound objects.
		*/
		map( spawnees_phase2, (val) => all_objects_processed.push(val) );

		let all_objects_processed_and_culled = filter( all_objects_processed, (val)=>(
			val.should_remove !== true
		) );

		
		let all_creatures_processed = map( me.game_state.current_frame_state.creature_list, (creature) => (
			cloneDeep(Creature_ƒ.apply_changes(
				creature,
				filter( master_change_list, (val)=> (
					val.target_obj_uuid == creature.unique_id
				))
			))
		))

		let all_creatures_processed_and_culled = filter( all_creatures_processed, (val)=>(
			val.should_remove !== true
		) );
		
		
		return {
			...cloneDeep(me),
			animation_state: {
				...cloneDeep(me.animation_state),
				processing_tick: tick + 1,
			},
			game_state: {
				...cloneDeep(me.game_state),
				current_frame_state: {
					creature_list: all_creatures_processed_and_culled,
				},
				custom_object_list: all_objects_processed_and_culled,
			}
		}
	}
},

do_paused_game_processing: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Game_Manager_Data => {
	/*
		This is considerably simpler; we just run existing custom objects through their processing.
	*/
	const tick = me.animation_state.processing_tick;

	let all_objects = cloneDeep(me.game_state.custom_object_list);
	let all_objects_processed_data = map( all_objects, (val,idx) => {
		let parent_object: Custom_Object_Data<unknown> | undefined = undefined;

		if(val.parent_id !== undefined){
			parent_object = find(all_objects, (obj)=>(obj.unique_id == val.parent_id));
		}

		return (Custom_Object_ƒ.process_single_frame(val, _TM, Game_Manager_ƒ.get_time_offset(me, _BM), tick, parent_object))
	});

	/*
		get the list of new objects

		Yes, we're just completely ignoring the potential for spawnees/changes, and throwing them away.  Spawnees is likely bad for us to do, but changes puts in a firewall against unit effects.
	*/
	const all_objects_processed = map(all_objects_processed_data, (val)=>(
		val.new_object
	));

	let all_objects_processed_and_culled = filter( all_objects_processed, (val)=>(
		val.should_remove !== true
	) );



	return {
		...cloneDeep(me),
		animation_state: {
			...cloneDeep(me.animation_state),
			processing_tick: tick + 1,
		},
		game_state: {
			...cloneDeep(me.game_state),
			custom_object_list: all_objects_processed_and_culled,
		}
	}
},

}

