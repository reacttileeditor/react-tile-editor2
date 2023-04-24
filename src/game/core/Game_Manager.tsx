import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, findIndex, includes, isEmpty, isNil, isNumber, last, map, reduce, size, uniq } from "lodash";

import { ƒ } from "./Utils";

import { Canvas_View } from "./Canvas_View";
import { Asset_Manager } from "./Asset_Manager";
import { Blit_Manager, ticks_to_ms } from "./Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Tilemap_Manager, Direction } from "./Tilemap_Manager";
import { Pathfinder } from "./Pathfinding";

import { Creature_ƒ, New_Creature, Creature_Data, PathNodeWithDirection, ChangeInstance } from "../objects_core/Creature";

import "./Primary_View.scss";
import "./Game_Status_Display.scss";

import { Point2D, Rectangle } from '../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../objects_core/Custom_Object";
import { TooltipData } from "./Game_View";

interface Game_View_Props {
	_Asset_Manager: Asset_Manager,
	_Blit_Manager: Blit_Manager,
	assets_loaded: boolean,
	initialize_tilemap_manager: Function,
	_Tilemap_Manager: Tilemap_Manager,
	dimensions: Point2D,
}

export interface Game_State {
	current_turn: number,
	objective_type: ObjectiveTypes,
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

interface AnimationState {
	is_animating_turn_end: boolean,
	time_turn_end_anim_started__in_ticks: number
}

type ObjectiveTypes = 'extermination' | 'decapitation';





export type Game_Manager_Data = {
	_Blit_Manager: Blit_Manager;
	_Asset_Manager: Asset_Manager;
	_Tilemap_Manager: Tilemap_Manager;
	animation_state: AnimationState;
	game_state: Game_State;
	update_game_state_for_ui: Function;
	update_tooltip_state: (p: TooltipData) => void;
	_Pathfinder: Pathfinder;
	cursor_pos: Point2D;
}


export const New_Game_Manager = (p: {
	_Blit_Manager: Blit_Manager,
	_Asset_Manager: Asset_Manager,
	_Tilemap_Manager: Tilemap_Manager,
	get_GM_instance: ()=> Game_Manager_Data,
}): Game_Manager_Data => {


	const game_manager: Game_Manager_Data = {
		_Blit_Manager: p._Blit_Manager,
		_Asset_Manager: p._Asset_Manager,
		_Tilemap_Manager: p._Tilemap_Manager,
		update_game_state_for_ui: ()=>{},
		update_tooltip_state: ()=>{},
		cursor_pos: {x: 0, y: 0},

		animation_state: {
			is_animating_turn_end: false,
			time_turn_end_anim_started__in_ticks: 0
		},




		game_state: GameStateInit,
	
		_Pathfinder: new Pathfinder(),
	}

	const first_turn_state_init = {
		creature_list: [New_Creature({
			get_GM_instance: p.get_GM_instance,
			tile_pos: {x: 1, y: 6},
			TM: p._Tilemap_Manager,
			planned_tile_pos: {x: 0, y: 6},
			type_name: 'hermit',
			team: 1,
			creation_timestamp: 0,
			should_remove: false,
		}), New_Creature({
			get_GM_instance: p.get_GM_instance,
			tile_pos: {x: 2, y: 4},
			TM: p._Tilemap_Manager,
			planned_tile_pos: {x: 2, y: 4},
			type_name: 'peasant',
			team: 1,
			creation_timestamp: 0,
			should_remove: false,
		}), New_Creature({
			get_GM_instance: p.get_GM_instance,
			tile_pos: {x: 4, y: 4},
			TM: p._Tilemap_Manager,
			planned_tile_pos: {x: 4, y: 4},
			type_name: 'skeleton',
			team: 2,
			creation_timestamp: 0,
			should_remove: false,
		}), New_Creature({
			get_GM_instance: p.get_GM_instance,
			tile_pos: {x: 5, y: 8},
			TM: p._Tilemap_Manager,
			planned_tile_pos: {x: 5, y: 8},
			type_name: 'skeleton',
			team: 2,
			creation_timestamp: 0,
			should_remove: false,
		})],
		custom_object_list: [],
	};

	game_manager.game_state = {
		...game_manager.game_state,
		turn_list: [first_turn_state_init],
		current_frame_state: first_turn_state_init,
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

	set_tooltip_update_function: (me: Game_Manager_Data, func: (p: TooltipData) => void) => {
		me.update_tooltip_state = func;
	},

	set_cursor_pos: (me: Game_Manager_Data, coords: Point2D) => {
		me.cursor_pos = coords;
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

	describe_objectives: (objective_type: ObjectiveTypes): string => (
		{
			'extermination': `Kill off all units on the enemy team.`,
			'decapitation': `Kill the leaders of the enemy team.`,
		}[objective_type]
	),

	write_full_objective_text: (me: Game_Manager_Data, objective_type: ObjectiveTypes, _game_state: Game_State): string => (
		`The game will be won by the first team to: ${Game_Manager_ƒ.describe_objectives(objective_type)}\n${
			ƒ.if( Game_Manager_ƒ.validate_objectives(me, _game_state).is_won,
				`Team #${Game_Manager_ƒ.validate_objectives(me, _game_state).team_winner} has won the game!`,
				`No team has won the game, yet.`
			)
		}`
	),

/*----------------------- turn management -----------------------*/

	advance_turn_start: (me: Game_Manager_Data) => {
		console.log(`beginning turn #${me.game_state.current_turn}`)
		me.game_state.current_frame_state = cloneDeep(Game_Manager_ƒ.get_current_turn_state(me))


		var date = new Date();
	
		me.animation_state = {
			is_animating_turn_end: true,
			time_turn_end_anim_started__in_ticks: me._Blit_Manager.time_tracker.current_tick,
		};
	
		me.game_state.objective_text = Game_Manager_ƒ.write_full_objective_text(me, Game_Manager_ƒ.get_game_state(me).objective_type, Game_Manager_ƒ.get_game_state(me));
	},

	advance_turn_finish: (me: Game_Manager_Data) => {
		/*
			All behavior is handled inside creature and custom object processing.  Impressing the current state of this into the array of turns is mostly being done as a snapshot.
		*/
		

		let new_turn_state = cloneDeep(me.game_state.current_frame_state);
		new_turn_state = {
			creature_list: map(new_turn_state.creature_list, (val)=>( Creature_ƒ.copy_for_new_turn(val) )),
		};

		me.game_state.turn_list = concat(
			me.game_state.turn_list,
			[new_turn_state]
		);
		console.log(`finishing turn #${me.game_state.current_turn}`)


	
		me.animation_state.is_animating_turn_end = false;
		me.game_state.objective_text = Game_Manager_ƒ.write_full_objective_text(me, Game_Manager_ƒ.get_game_state(me).objective_type, Game_Manager_ƒ.get_game_state(me));

	
		me.game_state.current_turn += 1;
	},


/*----------------------- animation management -----------------------*/

	get_time_offset: (me: Game_Manager_Data) => {
		return ticks_to_ms(me._Blit_Manager.time_tracker.current_tick - me.animation_state.time_turn_end_anim_started__in_ticks)
	},
	
	get_total_anim_duration: (me: Game_Manager_Data):number => {
		if( size(Game_Manager_ƒ.get_current_turn_state(me).creature_list) > 0){
			return reduce(
				map(
					Game_Manager_ƒ.get_current_turn_state(me).creature_list,
					(val) => ( Creature_ƒ.calculate_total_anim_duration(val) )
				),
				(left, right) => ( ƒ.if( left > right, left, right) )
			) as number;
		} else {
			return 0;
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

	get_current_creatures_move_cost: (me: Game_Manager_Data): string => {
		const selected_creature = Game_Manager_ƒ.get_selected_creature(me);

		if(selected_creature){
			const tile_type = me._Tilemap_Manager.get_tile_name_for_pos(
				me._Tilemap_Manager.convert_pixel_coords_to_tile_coords( me.cursor_pos ), //selected_creature.tile_pos,
				'terrain',
			);

			return `${ Creature_ƒ.get_delegate(selected_creature.type_name).yield_move_cost_for_tile_type( tile_type ) }`
			//return `${ Creature_ƒ.get_delegate(selected_creature.type_name).yield_prettyprint_name() }`
		} else {
			return '';
		}
	},

	do_one_frame_of_rendering_and_processing: (me: Game_Manager_Data) => {
		me.update_game_state_for_ui(me.game_state);
		me.update_tooltip_state( {
			pos: me.cursor_pos,
			tile_name: me._Tilemap_Manager.get_tile_name_for_pos(
				me._Tilemap_Manager.convert_pixel_coords_to_tile_coords( me.cursor_pos ),
				'terrain',
			),
			tile_cost: `${Game_Manager_ƒ.get_current_creatures_move_cost(me)}`
		});
		
		if(me.animation_state.is_animating_turn_end){
			Game_Manager_ƒ.do_live_game_processing(me);
			Game_Manager_ƒ.do_live_game_rendering(me);
		} else {
			Game_Manager_ƒ.do_paused_game_processing(me);
			Game_Manager_ƒ.do_paused_game_rendering(me);
		}
	},

	draw_cursor: (me: Game_Manager_Data) => {
		//const pos = this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(0,4); 

		me._Asset_Manager.draw_image_for_asset_name({
			asset_name:					'cursor',
			_BM:						me._Blit_Manager,
			pos:						me._Tilemap_Manager.convert_tile_coords_to_pixel_coords(
				me._Tilemap_Manager.convert_pixel_coords_to_tile_coords(
					me.cursor_pos
				)
			),
			zorder:						12,
			current_milliseconds:		0,
			opacity:					1.0,
			brightness:					1.0,
			horizontally_flipped:		false,
			vertically_flipped:			false,
		})
	},

	do_live_game_processing: (me: Game_Manager_Data) => {
		/*
			Process all of the existing creatures.
			
			The result of this will give us two lists;  one is a list of any Custom_Objects they're going to spawn, the other is a list of changes we would like to apply to our list of creatures.
		*/

		if(Game_Manager_ƒ.get_time_offset(me) > Game_Manager_ƒ.get_total_anim_duration(me) ){
			Game_Manager_ƒ.advance_turn_finish(me);
		} else {		
			let spawnees: Array<Custom_Object_Data> = [];
			let master_change_list: Array<ChangeInstance> = [];

			map( me.game_state.current_frame_state.creature_list, (val,idx) => {
				const processed_results = Creature_ƒ.process_single_frame(val, me._Tilemap_Manager, Game_Manager_ƒ.get_time_offset(me));

				map(processed_results.spawnees, (val)=>{ spawnees.push(val) });
				map(processed_results.change_list, (val)=>{ master_change_list.push(val) });

			});


			/*
				Add the new custom_objects to our existing list, and then process all custom_objects (existing and new).
			*/
			let all_objects = concat( cloneDeep(me.game_state.custom_object_list), cloneDeep(spawnees));
			let all_objects_processed = map( all_objects, (val,idx) => {
				return (Custom_Object_ƒ.process_single_frame(val, me._Tilemap_Manager, Game_Manager_ƒ.get_time_offset(me)))
			});

			let all_objects_processed_and_culled = filter( all_objects_processed, (val)=>(
				val.should_remove !== true
			) );

			let all_creatures_processed = map( me.game_state.current_frame_state.creature_list, (creature) => (
				Creature_ƒ.apply_changes(
					creature,
					filter( master_change_list, (val)=> (
						val.target_obj_uuid == creature.unique_id
					))
				)
			))

			let all_creatures_processed_and_culled = filter( all_creatures_processed, (val)=>(
				val.should_remove !== true
			) );
			
			


			me.game_state.current_frame_state = {
				creature_list: all_creatures_processed_and_culled,
			}

			me.game_state.custom_object_list = all_objects_processed_and_culled
		}
	},

	do_paused_game_processing: (me: Game_Manager_Data) => {
		/*
			This is considerably simpler; we just run existing custom objects through their processing.
		*/

		let all_objects = cloneDeep(me.game_state.custom_object_list);
		let all_objects_processed = map( all_objects, (val,idx) => {
			return (Custom_Object_ƒ.process_single_frame(val, me._Tilemap_Manager, Game_Manager_ƒ.get_time_offset(me)))
		});

		let all_objects_processed_and_culled = filter( all_objects_processed, (val)=>(
			val.should_remove !== true
		) );


		me.game_state.custom_object_list = all_objects_processed_and_culled
	},


	do_live_game_rendering: (me: Game_Manager_Data) => {
		/*
			This is for when the game is "live" and actually progressing through time.  The player's set up their moves, and hit "go".
		*/

		map( me.game_state.current_frame_state.creature_list, (val,idx) => {
			const direction = Creature_ƒ.yield_direction_for_time_in_post_turn_animation(val, Game_Manager_ƒ.get_time_offset(me));

			me._Asset_Manager.draw_image_for_asset_name({
				asset_name:					Creature_ƒ.yield_walk_asset_for_direction( val, direction ), //i.e. 'peasant-se-walk',
				_BM:						me._Blit_Manager,
				pos:						val.pixel_pos, //yield_position_for_time_in_post_turn_animation( this._Tilemap_Manager, this.get_time_offset() ),
				zorder:						12,
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me),
				opacity:					1.0,
				brightness:					ƒ.if( (Game_Manager_ƒ.get_time_offset(me) - val.last_changed_hitpoints) < 80, 3.0, 1.0),
				horizontally_flipped:		Game_Manager_ƒ.get_flip_state_from_direction(direction),
				vertically_flipped:			false,
			})
		})

		map( me.game_state.custom_object_list, (val,idx) => {
			me._Asset_Manager.draw_image_for_asset_name({
				asset_name:					Custom_Object_ƒ.yield_image(val),
				_BM:						me._Blit_Manager,
				pos:						val.pixel_pos,
				zorder:						13,
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me),
				opacity:					1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})

			me._Asset_Manager.draw_text({
				text:						Custom_Object_ƒ.yield_text(val),
				_BM:						me._Blit_Manager,
				pos:						val.pixel_pos,
				zorder:						13,
				current_milliseconds:		Game_Manager_ƒ.get_time_offset(me),
				opacity:					1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})
		})			
		Game_Manager_ƒ.draw_cursor(me);
	},

	do_paused_game_rendering: (me: Game_Manager_Data) => {
		/*
			This particularly means "paused at end of turn".
		*/
		map( Game_Manager_ƒ.get_current_turn_state(me).creature_list, (val,idx) => {
			me._Asset_Manager.draw_image_for_asset_name({
				asset_name:					Creature_ƒ.yield_stand_asset_for_direction(val, val.facing_direction),
				_BM:						me._Blit_Manager,
				pos:						me._Tilemap_Manager.convert_tile_coords_to_pixel_coords(val.tile_pos),
				zorder:						12,
				current_milliseconds:		0,
				opacity:					1.0,
				brightness:					1.0,
				horizontally_flipped:		Game_Manager_ƒ.get_flip_state_from_direction(val.facing_direction),
				vertically_flipped:			false,
			})

			me._Asset_Manager.draw_hitpoints({
				portion:					val.current_hitpoints / Creature_ƒ.get_delegate(val.type_name).yield_max_hitpoints(),
				_BM:						me._Blit_Manager,
				pos:						me._Tilemap_Manager.convert_tile_coords_to_pixel_coords(val.tile_pos),
				zorder:						12,
				current_milliseconds:		0,
				opacity:					1.0,
			})			
	
			if(me.game_state.selected_object_index == idx){
				me._Asset_Manager.draw_image_for_asset_name ({
					asset_name:					'cursor_green',
					_BM:						me._Blit_Manager,
					pos:						me._Tilemap_Manager.convert_tile_coords_to_pixel_coords(val.tile_pos),
					zorder:						10,
					current_milliseconds:		0,
					opacity:					1.0,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
				})

				me._Tilemap_Manager.clear_tile_map('ui');

				map(val.path_this_turn, (path_val, path_idx) => {
					me._Tilemap_Manager.modify_tile_status(
						path_val,
						ƒ.if( includes(val.path_reachable_this_turn, path_val),
							ƒ.if(path_val == last(val.path_reachable_this_turn),
								'arrowhead-green',
								'arrow-green',
							),
							'red-path-unreachable-dot'
						),
						'ui'
					);
				});
			}


			map( me.game_state.custom_object_list, (val,idx) => {
				me._Asset_Manager.draw_image_for_asset_name({
					asset_name:					Custom_Object_ƒ.yield_image(val),
					_BM:						me._Blit_Manager,
					pos:						val.pixel_pos,
					zorder:						13,
					current_milliseconds:		Game_Manager_ƒ.get_time_offset(me),
					opacity:					1.0,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
				})
	
				me._Asset_Manager.draw_text({
					text:						Custom_Object_ƒ.yield_text(val),
					_BM:						me._Blit_Manager,
					pos:						val.pixel_pos,
					zorder:						13,
					current_milliseconds:		Game_Manager_ƒ.get_time_offset(me),
					opacity:					1.0,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
				})
			})	
		})
		Game_Manager_ƒ.draw_cursor(me);

	},


	handle_click: (me: Game_Manager_Data, pos: Point2D) => {
// 		this.game_state.creature_list = [{
// 			tile_pos: this._Tilemap_Manager.convert_pixel_coords_to_tile_coords( pos )
// 		}]
		Game_Manager_ƒ.select_object_based_on_tile_click(me, pos);
	},

	get_selected_creature: (me: Game_Manager_Data):Creature_Data|undefined => {
		const idx = me.game_state.selected_object_index;
		
		
		const returnVal = ƒ.if(!isNil(idx),
			Game_Manager_ƒ.get_current_turn_state(me).creature_list[idx as number],
			undefined
		)
		
		return returnVal;
	},

	get_previous_turn_state: (me: Game_Manager_Data) => {
		const state = me.game_state.turn_list[ size(me.game_state.turn_list) -2 ];
	
		return state ? state : Individual_Game_Turn_State_Init;
	},
	
	get_current_turn_state: (me: Game_Manager_Data) => {
		const state = last(me.game_state.turn_list);
	
		return state ? state : Individual_Game_Turn_State_Init;
	},
	
	select_object_based_on_tile_click: (me: Game_Manager_Data, pos: Point2D) => {
		/*
			This handles two "modes" simultaneously.  If we click on an object, then we change the current selected object to be the one we clicked on (its position is occupied, and ostensibly can't be moved into - this might need to change with our game rules being what they are, but we'll cross that bridge later).  If we click on the ground, then we're intending to move the current object to that location.
		*/
		const new_pos = me._Tilemap_Manager.convert_pixel_coords_to_tile_coords( pos );
		
		const newly_selected_creature = findIndex( Game_Manager_ƒ.get_current_turn_state(me).creature_list, {
			tile_pos: new_pos
		} );
		
		if(newly_selected_creature === -1){
			//do move command
			if( me.game_state.selected_object_index != undefined ){
				const creature = Game_Manager_ƒ.get_current_turn_state(me).creature_list[ me.game_state.selected_object_index ];
				creature.planned_tile_pos = new_pos;
				
				Creature_ƒ.set_path(
					creature,
					me._Pathfinder.find_path_between_map_tiles( me._Tilemap_Manager, creature.tile_pos, new_pos, creature ).successful_path,
					me._Tilemap_Manager
				);
			}
		} else if(newly_selected_creature === me.game_state.selected_object_index ) {
			me.game_state.selected_object_index = undefined;
		} else {
		
			me.game_state.selected_object_index = newly_selected_creature;
		}
	}
}

