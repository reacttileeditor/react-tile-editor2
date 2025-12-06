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

import { Gamespace_Pixel_Point, Point2D, Rectangle, Screenspace_Pixel_Point, Tile_Pos_Point } from '../../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { zorder } from "../../constants/zorder";
import { Vals } from "../../constants/Constants";
import { Game_Manager_Data, Game_Manager_ƒ, Game_State, Individual_Game_Turn_State, Individual_Game_Turn_State_Init, Objective_Types } from "./Game_Manager";
import { Game_Tooltip_Data } from "../../gui/Game_Components/Game_Tooltip_Manager";

export const Game_Manager_ƒ_Accessors = {

/*----------------------- objective management -----------------------*/

validate_objectives: (me: Game_Manager_Data, _game_state: Game_State ): {
	is_won: boolean,
	team_winner: number, 
} => {
	//TODO:  since we don't have a concept of a 'leader' unit, we're using elimination as our only placeholder for now.  However, it, at least, can be written out, fully.

	let extract_team_numbers: Array<number> = uniq(map(Game_Manager_ƒ.get_current_turn_state(me).creature_list, (val)=>(
		val.team
	)));


	return {
		is_won: size(extract_team_numbers) == 1,
		team_winner: ƒ.if( size(extract_team_numbers) == 1, extract_team_numbers[0], 0), 
	}
},

describe_objectives: (objective_type: Objective_Types): string => (
	{
		'extermination': `Kill off all units on the enemy team.`,
		'decapitation': `Kill the leaders of the enemy team.`,
	}[objective_type]
),

write_full_objective_text: (me: Game_Manager_Data, objective_type: Objective_Types, _game_state: Game_State): string => (
	`The game will be won by the first team to:\n${Game_Manager_ƒ.describe_objectives(objective_type)} ${
		ƒ.if( Game_Manager_ƒ.validate_objectives(me, _game_state).is_won,
			`Team #${Game_Manager_ƒ.validate_objectives(me, _game_state).team_winner} has won the game!`,
			`No team has won the game, yet.`
		)
	}`
),



/*----------------------- GUI values -----------------------*/

get_tooltip_data: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Game_Tooltip_Data => {
	const constrained_pos = constrain_point_within_rect(me.cursor_pos, Vals.default_canvas_rect) as Screenspace_Pixel_Point;

	const tile_pos = Tilemap_Manager_ƒ.convert_screenspace_pixel_coords_to_tile_coords( _TM, _AM, _BM, constrained_pos )

	return {
		pos: constrained_pos,
		selected_unit: Game_Manager_ƒ.get_selected_creature(me),
		hovered_unit: Game_Manager_ƒ.get_creature_at_tile(me, tile_pos),
		path_data: !isNil(me.game_state.selected_object_index) ? me.game_state.current_frame_state.creature_list[me.game_state.selected_object_index].path_data : undefined,
		tile_pos: tile_pos,
		unit_pos: !isNil(me.game_state.selected_object_index) ? me.game_state.current_frame_state.creature_list[me.game_state.selected_object_index].tile_pos : undefined,
		tile_name: Tilemap_Manager_ƒ.get_tile_name_for_pos(
			_TM,
			Tilemap_Manager_ƒ.convert_screenspace_pixel_coords_to_tile_coords( _TM, _AM, _BM, me.cursor_pos ),
			'terrain',
		),
		tile_cost: `${Game_Manager_ƒ.get_current_creatures_move_cost(me, _TM, _AM, _BM)}`,
		cumulative_move_cost: `${me.game_state.selected_object_potential_move_cost}`
	}
},


/*----------------------- turn management -----------------------*/

	is_turn_finished: (me: Game_Manager_Data):boolean => {

		return Game_Manager_ƒ.is_turn_finished_for_creatures(me) && Game_Manager_ƒ.is_turn_finished_for_custom_objects(me)
	},

	is_turn_finished_for_creatures: (me: Game_Manager_Data):boolean => {
		const creatures = me.game_state.current_frame_state.creature_list;

		if( size(creatures) > 0){
			return reduce(
				map(
					creatures,
					(val) => ( val.is_done_with_turn )
				),
				(left, right) => ( left && right )
			) as boolean;
		} else {
			return true;
		}
	},

	is_turn_finished_for_custom_objects: (me: Game_Manager_Data):boolean => {
		const c_objects = me.game_state.custom_object_list;

		if( size(c_objects) > 0){
			return reduce(
				map(
					c_objects,
					(val) => ( val.is_done_with_turn )
				),
				(left, right) => ( left && right )
			) as boolean;
		} else {
			return true;
		}
	},	

/*----------------------- getters -----------------------*/

get_current_human_players_team_number: (me: Game_Manager_Data): number => (
	1
),

is_creature_player_controlled: (me: Game_Manager_Data, creature: Creature_Data): boolean => (
	creature.team == Game_Manager_ƒ.get_current_human_players_team_number(me)
),



get_selected_creature: (me: Game_Manager_Data):Creature_Data|undefined => {
	const idx = me.game_state.selected_object_index;
	
	return Game_Manager_ƒ.get_creature_data_for_index(me, idx);
},

get_highlit_creature: (
	me: Game_Manager_Data,
	_TM: Tilemap_Manager_Data,
	_AM: Asset_Manager_Data,
	_BM: Blit_Manager_Data	
):Creature_Data|undefined => {
	if(!me.is_cursor_behind_hud){
		return Game_Manager_ƒ.get_creature_at_tile(me, Tilemap_Manager_ƒ.convert_screenspace_pixel_coords_to_tile_coords(
			_TM,
			_AM,
			_BM,
			me.cursor_pos
		) );
	} else {
		return undefined;
	}
},

get_creature_by_uuid: (me: Game_Manager_Data, uuid: string): Creature_Data|undefined => {
	let creature = find( Game_Manager_ƒ.get_game_state(me).current_frame_state.creature_list, (val) => (
		val.unique_id === uuid
	))

	return creature;
},


get_creature_by_uuid_or_die: (me: Game_Manager_Data, uuid: string): Creature_Data => {
	let creature = find( Game_Manager_ƒ.get_game_state(me).current_frame_state.creature_list, (val) => (
		val.unique_id === uuid
	))

	if( creature == undefined){
		throw new Error(`An attempt to get_creature_by_uuid(${uuid}) failed, because that uuid isn't in the list.`);
	} else {
		return creature;
	}
},

get_previous_turn_state: (me: Game_Manager_Data): Individual_Game_Turn_State => {
	const state = me.game_state.turn_list[ size(me.game_state.turn_list) -2 ];

	return state ? state : Individual_Game_Turn_State_Init;
},

get_current_turn_state: (me: Game_Manager_Data): Individual_Game_Turn_State => {
	const state = last(me.game_state.turn_list);

	return state ? state : Individual_Game_Turn_State_Init;
},

get_creature_index_for_pos: (me: Game_Manager_Data, target_pos: Point2D): number|undefined => {
	return findIndex( Game_Manager_ƒ.get_current_turn_state(me).creature_list, {
		tile_pos: target_pos
	} )
},

get_creature_data_for_index: (me: Game_Manager_Data, idx: number|undefined): Creature_Data|undefined => (
	!isNil(idx)
	?
	Game_Manager_ƒ.get_current_turn_state(me).creature_list[idx as number]
	:
	undefined
),

get_creature_at_tile: (me: Game_Manager_Data, pos: Point2D): Creature_Data|undefined => (
	Game_Manager_ƒ.get_creature_data_for_index(
		me,
		Game_Manager_ƒ.get_creature_index_for_pos(me, pos)
	)
),

get_list_of_occupied_tiles: (me: Game_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, _TM: Tilemap_Manager_Data): Array<Tile_Pos_Point> => {
	return map( me.game_state.current_frame_state.creature_list, (creature) => {

		//return Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, _AM,
			return Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, creature.pixel_pos as Gamespace_Pixel_Point)
		//);
	});
},

get_current_creatures_move_cost: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): string => {
	const selected_creature = Game_Manager_ƒ.get_selected_creature(me);

	if(selected_creature){
		const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
			_TM,
			Tilemap_Manager_ƒ.convert_screenspace_pixel_coords_to_tile_coords( _TM, _AM, _BM, me.cursor_pos ), //selected_creature.tile_pos,
			'terrain',
		);

		return `${ Creature_ƒ.get_delegate(selected_creature.type_name).yield_move_cost_for_tile_type( tile_type ) }`
		//return `${ Creature_ƒ.get_delegate(selected_creature.type_name).yield_prettyprint_name() }`
	} else {
		return '';
	}
},

	
get_flip_state_from_direction: ( direction: Direction ): boolean => (
	ƒ.if(	direction == 'north_west' ||
			direction == 'west' ||
			direction == 'south_west',
				true,
				false
	)
),


get_time_offset: (me: Game_Manager_Data, _BM: Blit_Manager_Data) => {
	return ticks_to_ms( Game_Manager_ƒ.get_tick_offset(me, _BM) ); 
},

get_tick_offset: (me: Game_Manager_Data, _BM: Blit_Manager_Data) => {
	if(me.animation_state.is_animating_live_game){
		return (_BM.time_tracker.current_tick - me.animation_state.time_live_game_anim_started__in_ticks)
	} else {
		return (_BM.time_tracker.current_tick - me.animation_state.time_paused_game_anim_started__in_ticks)
	}
},

get_cost_of_path: (_TM: Tilemap_Manager_Data, me: Creature_Data|undefined, path: Array<Tile_Pos_Point>) => {
	var cumulative_move_cost = 0;

	if(me !== undefined){
		map( path, (val) => {
			const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				val,
				'terrain',
			);
			const move_cost = Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type) ?? 100000000000000;

			cumulative_move_cost += move_cost;
		})
	};

	return cumulative_move_cost;
},

}

