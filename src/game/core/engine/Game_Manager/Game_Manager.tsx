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

import { Point2D, Rectangle, Screenspace_Pixel_Point, Tile_Pos_Point } from '../../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { zorder } from "../../constants/zorder";
import { Vals } from "../../constants/Constants";
import { Game_Manager_ƒ_Drawing } from "./Drawing";
import { Game_Manager_ƒ_State_Management } from "./State_Management";
import { Game_Manager_ƒ_Accessors } from "./Accessors";
import { Game_Manager_ƒ_Processing } from "./Processing";
import { Game_Tooltip_Data } from "../../gui/Game_Components/Game_Tooltip_Manager";
import { Game_Manager_ƒ_Tile_Indicator_Generation } from "./Tile_Indicator_Generation";

interface Game_View_Props {
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	assets_loaded: boolean,
	initialize_tilemap_manager: Function,
	dimensions: Point2D,
}

export interface Game_State {
	current_turn: number,
	objective_type: Objective_Types,
	objective_text: string,
	selected_object_index?: number,
	selected_object_possible_moves: Array<Point2D>,
	turn_list: Array<Individual_Game_Turn_State>,
	current_frame_state: Individual_Game_Turn_State,
	custom_object_list: Array<Custom_Object_Data<unknown>>,
	selected_object_potential_move_cost: number,
}

export interface Individual_Game_Turn_State {
	creature_list: Array<Creature_Data>,
	tiles_blocked_by_creatures: Array<Tile_Pos_Point>,
}

export const Individual_Game_Turn_State_Init: Individual_Game_Turn_State = {
	creature_list: [],
	tiles_blocked_by_creatures: [],
}

export const GameStateInit: Game_State = {
	current_turn: 0,
	objective_type: 'extermination',
	objective_text: '',
	selected_object_index: undefined,
	selected_object_possible_moves: [],
	turn_list: [],
	current_frame_state: Individual_Game_Turn_State_Init,
	custom_object_list: [],
	selected_object_potential_move_cost: 0,
};

interface Animation_State {
	processing_tick: number,
	is_animating_live_game: boolean,
	time_live_game_anim_started__in_ticks: number,
	time_paused_game_anim_started__in_ticks: number,
}

export type Objective_Types = 'extermination' | 'decapitation';


export type Game_and_Tilemap_Manager_Data = {
	gm: Game_Manager_Data,
	tm: Tilemap_Manager_Data,
}


export type Game_Manager_Data = {
	animation_state: Animation_State;
	game_state: Game_State;
	update_game_state_for_ui: Function;
	update_tooltip_state: (p: Game_Tooltip_Data) => void;
	cursor_pos: Screenspace_Pixel_Point;
	cursor_tile_pos: Tile_Pos_Point,
	last_cursor_move_tick: number,
}

export type Creature_Map_Instance = {
	pos: Tile_Pos_Point,
	type_name: Creature_Type_Name,
	team: number,
	direction: Direction,
}



export const New_Game_Manager = (p: {
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	get_GM_instance: ()=> Game_Manager_Data,
}): Game_Manager_Data => {


	const game_manager: Game_Manager_Data = {
		update_game_state_for_ui: ()=>{},
		update_tooltip_state: ()=>{},
		cursor_pos: {x: 0, y: 0} as Screenspace_Pixel_Point,
		cursor_tile_pos: {x: 0, y: 0} as Tile_Pos_Point,
		last_cursor_move_tick: 0,

		animation_state: {
			processing_tick: 0,
			is_animating_live_game: false,
			time_live_game_anim_started__in_ticks: 0,
			time_paused_game_anim_started__in_ticks: 0,
		},




		game_state: GameStateInit,
	}

	const creature_from_setup_data = ( creature: Creature_Map_Instance ) => {
		return Game_Manager_ƒ.creature_from_setup_data({
			get_GM: p.get_GM_instance,
			get_AM: p._Asset_Manager,
			get_BM: p._Blit_Manager,
			get_TM: p._Tilemap_Manager,
			pos: creature.pos,
			direction: creature.direction,
			type_name: creature.type_name,
			team: creature.team,
		})
	}

	const first_turn_state_init = {
		creature_list: map( p._Tilemap_Manager().creature_list, (val)=>( creature_from_setup_data(val) ) ),
		tiles_blocked_by_creatures: [],
	};

	game_manager.game_state = {
		...game_manager.game_state,
		turn_list: [first_turn_state_init],
		current_frame_state: first_turn_state_init,
		objective_text: Game_Manager_ƒ.write_full_objective_text(game_manager, Game_Manager_ƒ.get_game_state(game_manager).objective_type, Game_Manager_ƒ.get_game_state(game_manager)),
	}

	const revised_first_turn_state_init = {
		creature_list: first_turn_state_init.creature_list,
		tiles_blocked_by_creatures: Game_Manager_ƒ.get_list_of_occupied_tiles(game_manager, p._Asset_Manager(), p._Blit_Manager(), p._Tilemap_Manager()),
	}

	game_manager.game_state = {
		...game_manager.game_state,
		turn_list: [revised_first_turn_state_init],
		current_frame_state: revised_first_turn_state_init,
	}	

	return game_manager;
}



export const Game_Manager_ƒ = {
	...Game_Manager_ƒ_Drawing,
	...Game_Manager_ƒ_Accessors,
	...Game_Manager_ƒ_State_Management,
	...Game_Manager_ƒ_Processing,
	...Game_Manager_ƒ_Tile_Indicator_Generation,

	get_game_state: (me: Game_Manager_Data) => (
		me.game_state
	),

	set_update_function: (me: Game_Manager_Data, func: Function) => {
 		me.update_game_state_for_ui = func;
	},

	set_tooltip_update_function: (me: Game_Manager_Data, func: (p: Game_Tooltip_Data) => void) => {
		me.update_tooltip_state = func;
	},

	/*----------------------- initialization -----------------------*/
	creature_from_setup_data: (p: {
		get_GM: () => Game_Manager_Data,
		get_AM: () => Asset_Manager_Data,
		get_BM: () => Blit_Manager_Data,
		get_TM: () => Tilemap_Manager_Data,
		pos: Tile_Pos_Point,
		type_name: Creature_Type_Name,
		team: number,
		direction: Direction
	}): Creature_Data => {
		return New_Creature({
			get_GM_instance: p.get_GM,
			tile_pos: p.pos,
			_Asset_Manager: p.get_AM,
			_Blit_Manager: p.get_BM,
			_Tilemap_Manager: p.get_TM,
			planned_tile_pos: p.pos,
			direction: p.direction,
			type_name: p.type_name,
			team: p.team,
			creation_timestamp: 0,
			should_remove: false,
			behavior_mode: 'stand',
			is_done_with_turn: false,
		})
	},

}

