import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, find, findIndex, isEmpty, isEqual, isNil, isNumber, last, map, reduce, size, toArray, uniq } from "lodash";
import { includes } from "ramda"

import { ƒ } from "./Utils";

import { Canvas_View, Mouse_Button_State } from "../gui/Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "./Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "./Blit_Manager";
import { Tile_Palette_Element } from "../gui/Tile_Palette_Element";
import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ, Tilemap_Single } from "./Tilemap_Manager/Tilemap_Manager";
import { Pathfinder_ƒ } from "./Pathfinding";

import { Creature_ƒ, New_Creature, Creature_Data, Path_Node_With_Direction, Change_Instance, Creature_Type_Name } from "../../objects_core/Creature";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../objects_core/Custom_Object";
import { Tooltip_Data } from "../gui/Game_View";
import { zorder } from "../constants/zorder";

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
	turn_list: Array<Individual_Game_Turn_State>,
	current_frame_state: Individual_Game_Turn_State,
	custom_object_list: Array<Custom_Object_Data>,
}

interface Individual_Game_Turn_State {
	creature_list: Array<Creature_Data>,
}

const Individual_Game_Turn_State_Init = {
	creature_list: [],
}

export const GameStateInit: Game_State = {
	current_turn: 0,
	objective_type: 'extermination',
	objective_text: '',
	selected_object_index: undefined,
	turn_list: [],
	current_frame_state: Individual_Game_Turn_State_Init,
	custom_object_list: [],
};

interface Animation_State {
	processing_tick: number,
	is_animating_live_game: boolean,
	time_live_game_anim_started__in_ticks: number,
	time_paused_game_anim_started__in_ticks: number,
}

type Objective_Types = 'extermination' | 'decapitation';


export type Game_and_Tilemap_Manager_Data = {
	gm: Game_Manager_Data,
	tm: Tilemap_Manager_Data,
}


export type Game_Manager_Data = {
	animation_state: Animation_State;
	game_state: Game_State;
	update_game_state_for_ui: Function;
	update_tooltip_state: (p: Tooltip_Data) => void;
	cursor_pos: Point2D;
}

export type Creature_Map_Instance = {
	pos: Point2D,
	type_name: Creature_Type_Name,
	team: number,
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
		cursor_pos: {x: 0, y: 0},

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
			type_name: creature.type_name,
			team: creature.team,
		})
	}

	const first_turn_state_init = {
		creature_list: map( p._Tilemap_Manager().creature_list, (val)=>( creature_from_setup_data(val) ) ),
		custom_object_list: [],
	};

	game_manager.game_state = {
		...game_manager.game_state,
		turn_list: [first_turn_state_init],
		current_frame_state: first_turn_state_init,
		objective_text: Game_Manager_ƒ.write_full_objective_text(game_manager, Game_Manager_ƒ.get_game_state(game_manager).objective_type, Game_Manager_ƒ.get_game_state(game_manager)),
	}


	return game_manager;
}



export const Game_Manager_ƒ = {

	get_game_state: (me: Game_Manager_Data) => (
		me.game_state
	),

	set_update_function: (me: Game_Manager_Data, func: Function) => {
 		me.update_game_state_for_ui = func;
	},

	set_tooltip_update_function: (me: Game_Manager_Data, func: (p: Tooltip_Data) => void) => {
		me.update_tooltip_state = func;
	},

	/*----------------------- initialization -----------------------*/
	creature_from_setup_data: (p: {
		get_GM: () => Game_Manager_Data,
		get_AM: () => Asset_Manager_Data,
		get_BM: () => Blit_Manager_Data,
		get_TM: () => Tilemap_Manager_Data,
		pos: Point2D,
		type_name: Creature_Type_Name,
		team: number,
	}): Creature_Data => {
		return New_Creature({
			get_GM_instance: p.get_GM,
			tile_pos: p.pos,
			_Asset_Manager: p.get_AM,
			_Blit_Manager: p.get_BM,
			_Tilemap_Manager: p.get_TM,
			planned_tile_pos: p.pos,
			type_name: p.type_name,
			team: p.team,
			creation_timestamp: 0,
			should_remove: false,
			behavior_mode: 'stand',
			is_done_with_turn: false,
		})
	},

	/*----------------------- ui interaction -----------------------*/
	set_cursor_pos: (me: Game_Manager_Data, coords: Point2D, buttons_pressed: Mouse_Button_State): Game_Manager_Data => {
		return {
			...cloneDeep(me),
			cursor_pos: coords,
		}
	},


	handle_click: (
		get_game_state: () => Game_Manager_Data,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		pos: Point2D,
		buttons_pressed: Mouse_Button_State
	): Game_and_Tilemap_Manager_Data => {
		if( !get_game_state().animation_state.is_animating_live_game ){

			let new_game_data = Game_Manager_ƒ.select_object_based_on_tile_click(get_game_state, _TM, _AM, _BM, pos, buttons_pressed)
			const selected_creature = Game_Manager_ƒ.get_selected_creature(new_game_data);

			return {
				tm:	selected_creature != undefined
					?
					Game_Manager_ƒ.adjust_tiles_to_display_unit_path(get_game_state(), selected_creature, _AM, _BM, _TM).tm
					:
					Tilemap_Manager_ƒ.clear_tile_map(_TM, 'ui', _AM),
				gm: new_game_data
			}
		} else {
			return {
				tm: _TM,
				gm: get_game_state(),
			}
		}
	},
		
	
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

/*----------------------- turn management -----------------------*/

	advance_turn_start: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Game_and_Tilemap_Manager_Data => {
		console.log(`beginning turn #${me.game_state.current_turn}`)

		return {
			tm: Tilemap_Manager_ƒ.clear_tile_map(_TM, 'ui', _AM),
			gm: {
				...cloneDeep(me),
				animation_state: {
					processing_tick: 0,
					is_animating_live_game: true,
					time_live_game_anim_started__in_ticks: _BM.time_tracker.current_tick,
					time_paused_game_anim_started__in_ticks: me.animation_state.time_paused_game_anim_started__in_ticks,
				},
				game_state: {
					...cloneDeep(me.game_state),
					current_frame_state: cloneDeep(Game_Manager_ƒ.get_current_turn_state(me)),
					objective_text: Game_Manager_ƒ.write_full_objective_text(me, Game_Manager_ƒ.get_game_state(me).objective_type, Game_Manager_ƒ.get_game_state(me)),
				}
			}
		}
	},

	advance_turn_finish: (me: Game_Manager_Data, _BM: Blit_Manager_Data):Game_Manager_Data => {
		/*
			All behavior is handled inside creature and custom object processing.  Impressing the current state of this into the array of turns is mostly being done as a snapshot.
		*/
		

		let new_turn_state = cloneDeep(me.game_state.current_frame_state);
		new_turn_state = {
			creature_list: map(new_turn_state.creature_list, (val)=>( Creature_ƒ.copy_for_new_turn(val) )),
		};

		console.log(`finishing turn #${me.game_state.current_turn}`)

		return {
			...cloneDeep(me),
			animation_state: {
				processing_tick: me.animation_state.processing_tick,
				is_animating_live_game: false,
				time_live_game_anim_started__in_ticks: me.animation_state.time_live_game_anim_started__in_ticks,
				time_paused_game_anim_started__in_ticks: _BM.time_tracker.current_tick,
			},
			game_state: {
				...cloneDeep(me.game_state),
				current_frame_state: new_turn_state,
				turn_list: concat(
					me.game_state.turn_list,
					[new_turn_state]
				),
				objective_text: Game_Manager_ƒ.write_full_objective_text(me, Game_Manager_ƒ.get_game_state(me).objective_type, Game_Manager_ƒ.get_game_state(me)),
				current_turn: me.game_state.current_turn + 1,
			},
		}
	},


/*----------------------- animation management -----------------------*/

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
	
	get_flip_state_from_direction: ( direction: Direction ): boolean => (
		ƒ.if(	direction == 'north_west' ||
				direction == 'west' ||
				direction == 'south_west',
					true,
					false
		)
	),

	get_current_creatures_move_cost: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): string => {
		const selected_creature = Game_Manager_ƒ.get_selected_creature(me);

		if(selected_creature){
			const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords( _TM, _AM, _BM, me.cursor_pos ), //selected_creature.tile_pos,
				'terrain',
			);

			return `${ Creature_ƒ.get_delegate(selected_creature.type_name).yield_move_cost_for_tile_type( tile_type ) }`
			//return `${ Creature_ƒ.get_delegate(selected_creature.type_name).yield_prettyprint_name() }`
		} else {
			return '';
		}
	},

	get_tooltip_data: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Tooltip_Data => {
		const tile_pos = Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords( _TM, _AM, _BM, me.cursor_pos )

		return {
			pos: me.cursor_pos,
			selected_unit: Game_Manager_ƒ.get_selected_creature(me),
			hovered_unit: Game_Manager_ƒ.get_creature_at_tile(me, tile_pos),
			path_data: !isNil(me.game_state.selected_object_index) ? me.game_state.current_frame_state.creature_list[me.game_state.selected_object_index].path_data : undefined,
			tile_pos: tile_pos,
			unit_pos: !isNil(me.game_state.selected_object_index) ? me.game_state.current_frame_state.creature_list[me.game_state.selected_object_index].tile_pos : undefined,
			tile_name: Tilemap_Manager_ƒ.get_tile_name_for_pos(
				_TM,
				Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords( _TM, _AM, _BM, me.cursor_pos ),
				'terrain',
			),
			tile_cost: `${Game_Manager_ƒ.get_current_creatures_move_cost(me, _TM, _AM, _BM)}`
		}
	},

	do_one_frame_of_processing: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Game_Manager_Data => {
		//me.update_game_state_for_ui(me.game_state);
		//me.update_tooltip_state( Game_Manager_ƒ.get_tooltip_data(me));
		
		if(me.animation_state.is_animating_live_game){
			return Game_Manager_ƒ.do_live_game_processing(me, _TM, _AM, _BM);
		} else {
			return Game_Manager_ƒ.do_paused_game_processing(me, _TM, _AM, _BM);
		}
	},

	do_one_frame_of_rendering: (me: Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): void => {
		if(me.animation_state.is_animating_live_game){
			Game_Manager_ƒ.do_live_game_rendering(me, _BM, _AM, _TM);
		} else {
			Game_Manager_ƒ.do_paused_game_rendering(me, _AM, _BM, _TM);
		}
	},

	draw_cursor: (me: Game_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, _TM: Tilemap_Manager_Data) => {
		//const pos = this._TM.convert_tile_coords_to_pixel_coords(0,4); 

		Asset_Manager_ƒ.draw_image_for_asset_name({
			_AM:						_AM,
			asset_name:					'cursor',
			_BM:						_BM,
			pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(
				_TM,
				_AM,
				Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(
					_TM,
					_AM,
					_BM,
					me.cursor_pos
				)
			),
			zorder:						zorder.map_cursor_low,
			current_milliseconds:		0,
			opacity:					1.0,
			rotate:						0,
			brightness:					1.0,
			horizontally_flipped:		false,
			vertically_flipped:			false,
		})
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
			let spawnees: Array<Custom_Object_Data> = [];
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
				return (Custom_Object_ƒ.process_single_frame(val, _TM, Game_Manager_ƒ.get_time_offset(me, _BM), tick))
			});



			let spawnees_phase2: Array<Custom_Object_Data> = [];

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
			return (Custom_Object_ƒ.process_single_frame(val, _TM, Game_Manager_ƒ.get_time_offset(me, _BM), tick))
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


	do_live_game_rendering: (me: Game_Manager_Data, _BM: Blit_Manager_Data, _AM: Asset_Manager_Data, _TM: Tilemap_Manager_Data) => {
		/*
			This is for when the game is "live" and actually progressing through time.  The player's set up their moves, and hit "go".
		*/

		map( me.game_state.current_frame_state.creature_list, (val,idx) => {
			const timestamp = Game_Manager_ƒ.get_time_offset(me, _BM)
			const timestamp_according_to_creature = Creature_ƒ.get_intended_animation_time_offset(val, timestamp);

			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					Creature_ƒ.yield_animation_asset_for_time(val, _TM, timestamp_according_to_creature),
				_BM:						_BM,
				pos:						val.pixel_pos, 
				zorder:						zorder.rocks,
				current_milliseconds:		timestamp_according_to_creature,
				opacity:					1.0,
				rotate:						val.rotate,
				brightness:					ƒ.if( (Game_Manager_ƒ.get_time_offset(me, _BM) - val.last_changed_hitpoints) < 80, 3.0, 1.0),
				horizontally_flipped:		Game_Manager_ƒ.get_flip_state_from_direction(val.facing_direction),
				vertically_flipped:			false,
			});

			Asset_Manager_ƒ.draw_hitpoints({
				portion:					val.current_hitpoints / Creature_ƒ.get_delegate(val.type_name).yield_max_hitpoints(),
				_BM:						_BM,
				pos:						val.pixel_pos,
				zorder:						zorder.rocks,
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
				opacity:					1.0,
			});
		})

		map( me.game_state.custom_object_list, (val,idx) => {
			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					Custom_Object_ƒ.yield_image(val),
				_BM:						_BM,
				pos:						val.pixel_pos,
				zorder:						Custom_Object_ƒ.yield_zorder(val),
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
				opacity:					1.0,
				rotate:						val.rotate,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})

			Asset_Manager_ƒ.draw_text({
				text:						Custom_Object_ƒ.yield_text(val),
				_BM:						_BM,
				pos:						val.pixel_pos,
				zorder:						Custom_Object_ƒ.yield_zorder(val),
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
				opacity:					1.0,
				rotate:						0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})
		})			
		Game_Manager_ƒ.draw_cursor(me, _AM, _BM, _TM);
	},

	adjust_tiles_to_display_unit_path: (me: Game_Manager_Data, creature: Creature_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, _TM: Tilemap_Manager_Data ): Game_and_Tilemap_Manager_Data => {

		

		//let tilemap_mgr_data: Tilemap_Manager_Data = Tilemap_Manager_ƒ.clear_tile_map(_TM, 'ui', _AM);

		let new_tile_map: Tilemap_Single = Tilemap_Manager_ƒ.create_empty_tile_map(_TM, _AM);

		new_tile_map = map( _TM.tile_maps.ui, (y_val, y_idx) => {
			return map (y_val, (x_val, x_idx)=>{

				/*
					iterate over each of the path values.

					Here we build a brand new tilemap for the unit path, from scratch.
				*/

				// console.log(`tile choice for ${x_idx}, ${y_idx}
				// creature: ${creature.tile_pos.x}, ${creature.tile_pos.y}
				// on_path?: ${includes({x: x_idx, y: y_idx}, creature.path_data.path_this_turn )}`)

				if(
					isEqual({x: x_idx, y: y_idx}, creature.tile_pos)
					&&
					!size(creature.path_data.path_this_turn)
				){
					return 'cursor_green';
				}


				return ƒ.if(  includes({x: x_idx, y: y_idx}, creature.path_data.path_this_turn ),
						ƒ.if( includes({x: x_idx, y: y_idx}, creature.path_data.path_reachable_this_turn),
							ƒ.if( isEqual({x: x_idx, y: y_idx}, last(creature.path_data.path_reachable_this_turn)),
								'arrowhead-green',
								'arrow-green'
							),
							'red-path-unreachable-dot'
						),
						''
					)
				
			})
		})

		return {
			tm: {
				level_name: _TM.level_name,
				metadata: cloneDeep(_TM.metadata),
				tile_maps: {
					...cloneDeep(_TM.tile_maps),
					ui: new_tile_map,
				},
				creature_list: cloneDeep(_TM.creature_list),
				initialized: true,
				...Tilemap_Manager_ƒ.cleared_cache(),
			},
			gm: me,
		}
	},


	do_paused_game_rendering: (me: Game_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, _TM: Tilemap_Manager_Data) => {
		/*
			This particularly means "paused at end of turn".
		*/
		const cursor_pos = Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(
			_TM,
			_AM,
			_BM,
			me.cursor_pos
		);

		map( Game_Manager_ƒ.get_current_turn_state(me).creature_list, (val,idx) => {
			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					Creature_ƒ.yield_animation_asset_for_time(val, _TM, Game_Manager_ƒ.get_time_offset(me, _BM)),
				_BM:						_BM,
				pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, _AM, val.tile_pos),
				zorder:						zorder.rocks,
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
				opacity:					1.0,
				rotate:						val.rotate,
				brightness:					isEqual(cursor_pos, val.tile_pos) ? 1.0 + 0.75 * Math.sin(Game_Manager_ƒ.get_tick_offset(me, _BM) * 0.2) : 1.0,
				horizontally_flipped:		Game_Manager_ƒ.get_flip_state_from_direction(val.facing_direction),
				vertically_flipped:			false,
			})

			Asset_Manager_ƒ.draw_hitpoints({
				portion:					val.current_hitpoints / Creature_ƒ.get_delegate(val.type_name).yield_max_hitpoints(),
				_BM:						_BM,
				pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, _AM, val.tile_pos),
				zorder:						zorder.rocks,
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
				opacity:					1.0,
			})			


			map( me.game_state.custom_object_list, (val,idx) => {

				Asset_Manager_ƒ.draw_image_for_asset_name({
					_AM:						_AM,
					asset_name:					Custom_Object_ƒ.yield_image(val),
					_BM:						_BM,
					pos:						val.pixel_pos,
					zorder:						Custom_Object_ƒ.yield_zorder(val),
					current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
					opacity:					1.0,
					rotate:						val.rotate,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
				})
	
				Asset_Manager_ƒ.draw_text({
					text:						Custom_Object_ƒ.yield_text(val),
					_BM:						_BM,
					pos:						val.pixel_pos,
					zorder:						Custom_Object_ƒ.yield_zorder(val),
					current_milliseconds:		Game_Manager_ƒ.get_time_offset(me, _BM),
					opacity:					1.0,
					rotate:						val.rotate,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
				})
			})	
		})
		Game_Manager_ƒ.draw_cursor(me, _AM, _BM, _TM);

	},


	get_selected_creature: (me: Game_Manager_Data):Creature_Data|undefined => {
		const idx = me.game_state.selected_object_index;
		
		return Game_Manager_ƒ.get_creature_data_for_index(me, idx);
	},

	get_creature_by_uuid: (me: Game_Manager_Data, uuid: string): Creature_Data => {
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

	select_object_based_on_tile_click: (get_game_state: () => Game_Manager_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, pos: Point2D, buttons_pressed: Mouse_Button_State): Game_Manager_Data => {
		/*
			This handles two "modes" simultaneously.  If we click on an object, then we change the current selected object to be the one we clicked on (its position is occupied, and ostensibly can't be moved into - this might need to change with our game rules being what they are, but we'll cross that bridge later).  If we click on the ground, then we're intending to move the current object to that location.
		*/
		const new_pos = Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords( _TM, _AM, _BM, pos );
		const me = get_game_state();
		
		let newly_selected_creature_index: number|undefined = Game_Manager_ƒ.get_creature_index_for_pos(me, new_pos);
		

		let new_creature: Creature_Data|undefined = undefined;
		let new_creature_array = cloneDeep(me.game_state.current_frame_state.creature_list);

		if(newly_selected_creature_index === -1){
			/*
				The player didn't click on any unit; they clicked on terrain, so this is a move command.
			*/
			if( me.game_state.selected_object_index != undefined ){
				/*
					That said; it's not a move command if nobody's selected.
				*/


				const creature = Game_Manager_ƒ.get_current_turn_state(me).creature_list[ me.game_state.selected_object_index ];
				/*
					If it's a regular click, we're setting the path.
					If it's a right click, we're clearing the path.
				*/

				if( buttons_pressed.left == true ){
					new_creature = {
						...cloneDeep(creature),
						path_data: Creature_ƒ.set_path(
							creature,
							Pathfinder_ƒ.find_path_between_map_tiles( _TM, _AM, creature.tile_pos, new_pos, creature ).successful_path,
							_TM
						),
						planned_tile_pos: new_pos,
					}

					new_creature_array[me.game_state.selected_object_index] = new_creature;

				} else if ( buttons_pressed.right == true ){
					new_creature = {
						...cloneDeep(creature),
						path_data: Creature_ƒ.clear_path(creature),
					}

					new_creature_array[me.game_state.selected_object_index] = new_creature;
				}
			}
		} else if(newly_selected_creature_index === me.game_state.selected_object_index ) {
			/*
				We just clicked, a second time, on the current unit, so instead of selecting it, we actually want to toggle; to de-select it.
			*/
			newly_selected_creature_index = undefined;
		} else {
			/*
				We've clicked on a new creature, so we want to pass along the index to the return statement, which means we don't need to do anything.
			*/
		}

		let new_turn_list = cloneDeep(me.game_state.turn_list);
		new_turn_list[size(new_turn_list) - 1].creature_list = new_creature_array;

		return {
			...cloneDeep(me),
			game_state: {
				...cloneDeep(me.game_state),
				current_frame_state: {
					creature_list: new_creature_array
				},
				selected_object_index: newly_selected_creature_index == -1 ? me.game_state.selected_object_index : newly_selected_creature_index,
				turn_list: new_turn_list
			}
		}
	}
}

