
import _, { cloneDeep, filter, find, first, isBoolean, isEqual, map, size } from "lodash";

import { angle_between, ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../Custom_Object/Custom_Object";
import { Anim_Schedule_Element, Behavior_Mode, Change_Instance, Creature_Data, Creature_ƒ, Path_Node_With_Direction, Path_Data } from "./Creature";
import { AI_Core_ƒ } from "./AI_Core";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../../core/engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ms_to_ticks, ticks_to_ms } from "../../core/engine/Blit_Manager";
import { Vals } from "../../core/constants/Constants";
import { Image_Data_Names } from "../../core/data/Image_Data";
import { Game_Manager_Data } from "../../core/engine/Game_Manager/Game_Manager";




export const Creature_ƒ_Processing = {
/*----------------------- data queries used for processing -----------------------*/

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

	yield_current_animation_type: (me: Creature_Data, _TM: Tilemap_Manager_Data, offset_in_ms: number): Behavior_Mode => (
		me.behavior_mode
	),

	yield_animation_asset_for_time: (me: Creature_Data, _TM: Tilemap_Manager_Data, offset_in_ms: number):  Image_Data_Names => {
		const anim_type = Creature_ƒ.yield_current_animation_type( me, _TM, offset_in_ms);

		return {
			walk: Creature_ƒ.yield_walk_asset_for_direction( me, me.facing_direction ),
			attack: Creature_ƒ.yield_attack_asset_for_direction( me, me.facing_direction ),
			stand: Creature_ƒ.yield_stand_asset_for_direction( me, me.facing_direction ),
		}[anim_type];
	},	

/*----------------------- core processing commands -----------------------*/

	process_single_frame__movement: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>
	) => {
		/*
			MOVEMENT:
		*/

		/*
			If we are at a different tile position, we need to renegotiate our path — in the act of attempting to move to a new tile, we can assume that the next tile will be guaranteed to be open for movement (this is a temporary lie we're adopting to expedite development; we'll need to reconsider this, possibly on a per-frame basis of checking the tile we're moving towards and seeing if it's occupied, and thus, we're "bumped").

			Once we're at the new tile, though, we must reassess everything about what our plan of action is.  In the future, we'll reassess whether we're even walking further at all (perhaps we switch to attacking if available), but for now, we retain our "intended destination", and continue to walk towards it. 
		*/
		//let current_tile_pos = Creature_ƒ.get_current_tile_pos_from_pixel_pos(me, _TM);

		Creature_ƒ.update_pixel_pos(me, _TM, offset_in_ms, change_list);

	},

	process_single_frame__attacking: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>
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


	process_single_frame__damage: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		offset_in_ms: number,
		tick: number,
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>
	) => {
		if( me.current_hitpoints <= 0 ) {
			spawnees.push(New_Custom_Object<{}>({
				accessors: Creature_ƒ.get_accessors(me),
				pixel_pos: me.pixel_pos,
				type_name: 'skull_icon',
				creation_timestamp: tick,
				delegate_state: {}
			}));


			Creature_ƒ.set(change_list, me, 'should_remove', true);
		}
	},


/*----------------------- management -----------------------*/
	// manage_hitpoint_mutation: (
	// 	me: Creature_Data,
	// 	offset_in_ms: number,
	// 	tick: number,

	// ): {
	// 	change_list: Array<Change_Instance>,
	// 	spawnees: Array<Custom_Object_Data<unknown>>
	// } => {
	// 	if(
	// 		me.last_changed_hitpoints == (tick - 1)
	// 	){

	// 	}
	// },

/*----------------------- central processing -----------------------*/

	process_single_frame: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_GM: Game_Manager_Data,
		offset_in_ms: number,
		tick: number,
	): {
		change_list: Array<Change_Instance>,
		spawnees: Array<Custom_Object_Data<unknown>>
	} => {
		let change_list: Array<Change_Instance> = [];
		const spawnees: Array<Custom_Object_Data<unknown>> = [];


		if( tick >= me.next_behavior_reconsideration_timestamp ) {
			AI_Core_ƒ.reconsider_behavior(me, _TM, _AM, _BM, _GM, offset_in_ms, tick, change_list, spawnees);
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


}





