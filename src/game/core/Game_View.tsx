import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, findIndex, includes, isNil, last, map, reduce, size, uniq } from "lodash";

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

const GameStateInit: Game_State = {
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


class Game_Manager {
	_Blit_Manager: Blit_Manager;
	_Asset_Manager: Asset_Manager;
	_Tilemap_Manager: Tilemap_Manager;
	animation_state: AnimationState;
	game_state: Game_State;
	update_game_state_for_ui: Function;
	update_tooltip_state: Function;
	_Pathfinder: Pathfinder;
	cursor_pos: Point2D;

	/*
		We need to handle individual turns progressing, so we'll need something to track modality.  We'll need a set of flags indicating what our mode is - are we watching a turn be animated, are we watching the enemy do a move?  Are we watching the player do their move?
		
		We also need to track the progression of turns themselves - each turn will be represented by a Game_Turn_State that represents the complete status of the map.  From a UI perspective, we'll need to handle tracking each player's *intended* moves, since a core design point of this game is that "you plan moves and your plans are interrupted by conflicting/contending with enemy action" - these are going to differ from what actually ends up happening (whereas in many game designs there's a 1-to-1 correlation.  I'm not sure if we'll need to actually track these in the history, but we definitely need to track them for the current turn, before it gets resolved.
	
	
		Our immediate goals should be as follows:
			- wire in the conceptual display of units on the map.  These need to be interleaved with and rendered as part of the terrain, since they can be behind plants and such.
			- set up the canvas event handling to treat individual clicks as issuing a move command for a unit (in this current iteration, there will be no "planning", and no "commit to ending a turn" - you will have a single unit, it will immediately issue its move for the turn when you click, and complete the turn.   Those other concepts are a good "next step".
			- stack up this successive turn propagation in the history
	*/

	constructor(
		_Blit_Manager: Blit_Manager,
		_Asset_Manager: Asset_Manager,
		_Tilemap_Manager: Tilemap_Manager,
	) {
		this._Blit_Manager = _Blit_Manager;
		this._Asset_Manager = _Asset_Manager;
		this._Tilemap_Manager = _Tilemap_Manager;
		this.update_game_state_for_ui = ()=>{};
		this.update_tooltip_state = ()=>{};
		this.cursor_pos = {x: 0, y: 0};

		this.animation_state = {
			is_animating_turn_end: false,
			time_turn_end_anim_started__in_ticks: 0
		};

		const first_turn_state_init = {
			creature_list: [New_Creature({
				get_game_state: this.get_game_state,
				tile_pos: {x: 1, y: 6},
				TM: _Tilemap_Manager,
				planned_tile_pos: {x: 0, y: 6},
				type_name: 'hermit',
				team: 1,
				creation_timestamp: 0,
				should_remove: false,
			}), New_Creature({
				get_game_state: this.get_game_state,
				tile_pos: {x: 2, y: 4},
				TM: _Tilemap_Manager,
				planned_tile_pos: {x: 2, y: 4},
				type_name: 'peasant',
				team: 1,
				creation_timestamp: 0,
				should_remove: false,
			}), New_Creature({
				get_game_state: this.get_game_state,
				tile_pos: {x: 4, y: 4},
				TM: _Tilemap_Manager,
				planned_tile_pos: {x: 4, y: 4},
				type_name: 'skeleton',
				team: 2,
				creation_timestamp: 0,
				should_remove: false,
			}), New_Creature({
				get_game_state: this.get_game_state,
				tile_pos: {x: 5, y: 8},
				TM: _Tilemap_Manager,
				planned_tile_pos: {x: 5, y: 8},
				type_name: 'skeleton',
				team: 2,
				creation_timestamp: 0,
				should_remove: false,
			})],
			custom_object_list: [],
		};


		this.game_state = {
			current_turn: 0,
			selected_object_index: undefined,
			objective_type: 'extermination',
			objective_text: '',
			turn_list: [first_turn_state_init],
			current_frame_state: first_turn_state_init,
			custom_object_list: [],
		};
		
		this._Pathfinder = new Pathfinder();
	}

	get_game_state = () => (
		this.game_state
	)

	set_update_function = (func: Function) => {
 		this.update_game_state_for_ui = func;
	}

	set_tooltip_update_function = (func: Function) => {
		this.update_tooltip_state = func;
	}

	set_cursor_pos = (coords: Point2D) => {
		this.cursor_pos = coords;
	}

/*----------------------- objective management -----------------------*/
	validate_objectives = ( _game_state: Game_State ): {
		is_won: boolean,
		team_winner: number, 
	} => {
		//TODO:  since we don't have a concept of a 'leader' unit, we're using elimination as our only placeholder for now.  However, it, at least, can be written out, fully.

		let extract_team_numbers: Array<number> = uniq(map(this.get_current_turn_state().creature_list, (val)=>(
			val.team
		)));


		return {
			is_won: size(extract_team_numbers) == 1,
			team_winner: ƒ.if( size(extract_team_numbers) == 1, extract_team_numbers[0], 0), 
		}
	}

	describe_objectives = (objective_type: ObjectiveTypes): string => (
		{
			'extermination': `Kill off all units on the enemy team.`,
			'decapitation': `Kill the leaders of the enemy team.`,
		}[objective_type]
	)

	write_full_objective_text = (objective_type: ObjectiveTypes, _game_state: Game_State): string => (
		`The game will be won by the first team to: ${this.describe_objectives(objective_type)}\n${
			ƒ.if( this.validate_objectives(_game_state).is_won,
				`Team #${this.validate_objectives(_game_state).team_winner} has won the game!`,
				`No team has won the game, yet.`
			)
		}`
	)

/*----------------------- turn management -----------------------*/

	advance_turn_start = () => {
		console.log(`beginning turn #${this.game_state.current_turn}`)
		this.game_state.current_frame_state = cloneDeep(this.get_current_turn_state())


		var date = new Date();
	
		this.animation_state = {
			is_animating_turn_end: true,
			time_turn_end_anim_started__in_ticks: this._Blit_Manager.time_tracker.current_tick,
		};
	
		this.game_state.objective_text = this.write_full_objective_text(this.get_game_state().objective_type, this.get_game_state());
	}

	advance_turn_finish = () => {
		/*
			All behavior is handled inside creature and custom object processing.  Impressing the current state of this into the array of turns is mostly being done as a snapshot.
		*/
		

		let new_turn_state = cloneDeep(this.game_state.current_frame_state);
		new_turn_state = {
			creature_list: map(new_turn_state.creature_list, (val)=>( Creature_ƒ.copy_for_new_turn(val) )),
		};

		this.game_state.turn_list = concat(
			this.game_state.turn_list,
			[new_turn_state]
		);
		console.log(`finishing turn #${this.game_state.current_turn}`)


	
		this.animation_state.is_animating_turn_end = false;
		this.game_state.objective_text = this.write_full_objective_text(this.get_game_state().objective_type, this.get_game_state());

	
		this.game_state.current_turn += 1;
	}		


/*----------------------- animation management -----------------------*/

	get_time_offset = () => {
		return ticks_to_ms(this._Blit_Manager.time_tracker.current_tick - this.animation_state.time_turn_end_anim_started__in_ticks)
	}
	
	get_total_anim_duration = ():number => {
		if( size(this.get_current_turn_state().creature_list) > 0){
			return reduce(
				map(
					this.get_current_turn_state().creature_list,
					(val) => ( Creature_ƒ.calculate_total_anim_duration(val) )
				),
				(left, right) => ( ƒ.if( left > right, left, right) )
			) as number;
		} else {
			return 0;
		}
	}
	
	get_flip_state_from_direction = ( direction: Direction ): boolean => (
		ƒ.if(	direction == 'north_west' ||
				direction == 'west' ||
				direction == 'south_west',
					true,
					false
		)
	)

	do_one_frame_of_rendering_and_processing = () => {
		this.update_game_state_for_ui(this.game_state);
		this.update_tooltip_state( {
			pos: this.cursor_pos,
			tile_name: this._Tilemap_Manager.get_tile_name_for_pos(
				this._Tilemap_Manager.convert_pixel_coords_to_tile_coords( this.cursor_pos ),
				'terrain',
			)
		});
		
		if(this.animation_state.is_animating_turn_end){
			this.do_live_game_processing();
			this.do_live_game_rendering();
		} else {
			this.do_paused_game_processing();
			this.do_paused_game_rendering();
		}
	}

	draw_cursor = () => {
		//const pos = this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(0,4); 

		this._Asset_Manager.draw_image_for_asset_name({
			asset_name:					'cursor',
			_BM:						this._Blit_Manager,
			pos:						this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(
				this._Tilemap_Manager.convert_pixel_coords_to_tile_coords(
					this.cursor_pos
				)
			),
			zorder:						12,
			current_milliseconds:		0,
			opacity:					1.0,
			brightness:					1.0,
			horizontally_flipped:		false,
			vertically_flipped:			false,
		})
	}

	do_live_game_processing = () => {
		/*
			Process all of the existing creatures.
			
			The result of this will give us two lists;  one is a list of any Custom_Objects they're going to spawn, the other is a list of changes we would like to apply to our list of creatures.
		*/

		if(this.get_time_offset() > this.get_total_anim_duration() ){
			this.advance_turn_finish();
		} else {		
			let spawnees: Array<Custom_Object_Data> = [];
			let master_change_list: Array<ChangeInstance> = [];

			map( this.game_state.current_frame_state.creature_list, (val,idx) => {
				const processed_results = Creature_ƒ.process_single_frame(val, this._Tilemap_Manager, this.get_time_offset());

				map(processed_results.spawnees, (val)=>{ spawnees.push(val) });
				map(processed_results.change_list, (val)=>{ master_change_list.push(val) });

			});


			/*
				Add the new custom_objects to our existing list, and then process all custom_objects (existing and new).
			*/
			let all_objects = concat( cloneDeep(this.game_state.custom_object_list), cloneDeep(spawnees));
			let all_objects_processed = map( all_objects, (val,idx) => {
				return (Custom_Object_ƒ.process_single_frame(val,this._Tilemap_Manager, this.get_time_offset()))
			});

			let all_objects_processed_and_culled = filter( all_objects_processed, (val)=>(
				val.should_remove !== true
			) );

			let all_creatures_processed = map( this.game_state.current_frame_state.creature_list, (creature) => (
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
			
			


			this.game_state.current_frame_state = {
				creature_list: all_creatures_processed_and_culled,
			}

			this.game_state.custom_object_list = all_objects_processed_and_culled
		}
	}

	do_paused_game_processing = () => {
		/*
			This is considerably simpler; we just run existing custom objects through their processing.
		*/

		let all_objects = cloneDeep(this.game_state.custom_object_list);
		let all_objects_processed = map( all_objects, (val,idx) => {
			return (Custom_Object_ƒ.process_single_frame(val,this._Tilemap_Manager, this.get_time_offset()))
		});

		let all_objects_processed_and_culled = filter( all_objects_processed, (val)=>(
			val.should_remove !== true
		) );


		this.game_state.custom_object_list = all_objects_processed_and_culled
	}


	do_live_game_rendering = () => {
		/*
			This is for when the game is "live" and actually progressing through time.  The player's set up their moves, and hit "go".
		*/

		map( this.game_state.current_frame_state.creature_list, (val,idx) => {
			const direction = Creature_ƒ.yield_direction_for_time_in_post_turn_animation(val, this.get_time_offset());

			this._Asset_Manager.draw_image_for_asset_name({
				asset_name:					Creature_ƒ.yield_walk_asset_for_direction( val, direction ), //i.e. 'peasant-se-walk',
				_BM:						this._Blit_Manager,
				pos:						val.pixel_pos, //yield_position_for_time_in_post_turn_animation( this._Tilemap_Manager, this.get_time_offset() ),
				zorder:						12,
				current_milliseconds:		this.get_time_offset(),
				opacity:					1.0,
				brightness:					ƒ.if( (this.get_time_offset() - val.last_changed_hitpoints) < 80, 3.0, 1.0),
				horizontally_flipped:		this.get_flip_state_from_direction(direction),
				vertically_flipped:			false,
			})
		})

		map( this.game_state.custom_object_list, (val,idx) => {
			this._Asset_Manager.draw_image_for_asset_name({
				asset_name:					Custom_Object_ƒ.yield_image(val),
				_BM:						this._Blit_Manager,
				pos:						val.pixel_pos,
				zorder:						13,
				current_milliseconds:		this.get_time_offset(),
				opacity:					1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})

			this._Asset_Manager.draw_text({
				text:						Custom_Object_ƒ.yield_text(val),
				_BM:						this._Blit_Manager,
				pos:						val.pixel_pos,
				zorder:						13,
				current_milliseconds:		this.get_time_offset(),
				opacity:					1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})
		})			
		this.draw_cursor();
	}

	do_paused_game_rendering = () => {
		/*
			This particularly means "paused at end of turn".
		*/
		map( this.get_current_turn_state().creature_list, (val,idx) => {
			this._Asset_Manager.draw_image_for_asset_name({
				asset_name:					Creature_ƒ.yield_stand_asset_for_direction(val, val.facing_direction),
				_BM:						this._Blit_Manager,
				pos:						this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(val.tile_pos),
				zorder:						12,
				current_milliseconds:		0,
				opacity:					1.0,
				brightness:					1.0,
				horizontally_flipped:		this.get_flip_state_from_direction(val.facing_direction),
				vertically_flipped:			false,
			})

			this._Asset_Manager.draw_hitpoints({
				portion:					val.current_hitpoints / Creature_ƒ.get_delegate(val.type_name).yield_max_hitpoints(),
				_BM:						this._Blit_Manager,
				pos:						this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(val.tile_pos),
				zorder:						12,
				current_milliseconds:		0,
				opacity:					1.0,
			})			
	
			if(this.game_state.selected_object_index == idx){
				this._Asset_Manager.draw_image_for_asset_name ({
					asset_name:					'cursor_green',
					_BM:						this._Blit_Manager,
					pos:						this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(val.tile_pos),
					zorder:						10,
					current_milliseconds:		0,
					opacity:					1.0,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
				})

				this._Tilemap_Manager.clear_tile_map('ui');

				map(val.path_this_turn, (path_val, path_idx) => {
					this._Tilemap_Manager.modify_tile_status(
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


			map( this.game_state.custom_object_list, (val,idx) => {
				this._Asset_Manager.draw_image_for_asset_name({
					asset_name:					Custom_Object_ƒ.yield_image(val),
					_BM:						this._Blit_Manager,
					pos:						val.pixel_pos,
					zorder:						13,
					current_milliseconds:		this.get_time_offset(),
					opacity:					1.0,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
				})
	
				this._Asset_Manager.draw_text({
					text:						Custom_Object_ƒ.yield_text(val),
					_BM:						this._Blit_Manager,
					pos:						val.pixel_pos,
					zorder:						13,
					current_milliseconds:		this.get_time_offset(),
					opacity:					1.0,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
				})
			})	

		})
		this.draw_cursor();

	}


	handle_click = (pos: Point2D) => {
// 		this.game_state.creature_list = [{
// 			tile_pos: this._Tilemap_Manager.convert_pixel_coords_to_tile_coords( pos )
// 		}]
		this.select_object_based_on_tile_click(pos);
	}

	get_selected_creature = ():Creature_Data|undefined => {
		const idx = this.game_state.selected_object_index;
		
		
		const returnVal = ƒ.if(!isNil(idx),
			this.get_current_turn_state().creature_list[idx as number],
			undefined
		)
		
		return returnVal;
	}

	get_previous_turn_state = () => {
		const state = this.game_state.turn_list[ size(this.game_state.turn_list) -2 ];
	
		return state ? state : Individual_Game_Turn_State_Init;
	}
	
	get_current_turn_state = () => {
		const state = last(this.game_state.turn_list);
	
		return state ? state : Individual_Game_Turn_State_Init;
	}
	
	select_object_based_on_tile_click = (pos: Point2D) => {
		/*
			This handles two "modes" simultaneously.  If we click on an object, then we change the current selected object to be the one we clicked on (its position is occupied, and ostensibly can't be moved into - this might need to change with our game rules being what they are, but we'll cross that bridge later).  If we click on the ground, then we're intending to move the current object to that location.
		*/
		const new_pos = this._Tilemap_Manager.convert_pixel_coords_to_tile_coords( pos );
		
		const newly_selected_creature = findIndex( this.get_current_turn_state().creature_list, {
			tile_pos: new_pos
		} );
		
		if(newly_selected_creature === -1){
			//do move command
			if( this.game_state.selected_object_index != undefined ){
				const creature = this.get_current_turn_state().creature_list[ this.game_state.selected_object_index ];
				creature.planned_tile_pos = new_pos;
				
				Creature_ƒ.set_path(
					creature,
					this._Pathfinder.find_path_between_map_tiles( this._Tilemap_Manager, creature.tile_pos, new_pos, creature ).successful_path,
					this._Tilemap_Manager
				);
			}
		} else if(newly_selected_creature === this.game_state.selected_object_index ) {
			this.game_state.selected_object_index = undefined;
		} else {
		
			this.game_state.selected_object_index = newly_selected_creature;
		}
	}
}



interface Game_Status_Display_Props {
	_Game_Manager: Game_Manager,
	advance_turn_start: Function,
	_Asset_Manager: Asset_Manager;
}


class Game_Status_Display extends React.Component <Game_Status_Display_Props, {
	game_state: Game_State,
}> {
	constructor( props: Game_Status_Display_Props ) {
		super( props );

		this.state = {
			game_state: cloneDeep(GameStateInit)
		};
	}


	update_game_state_for_ui = (game_state: Game_State) => {
		this.setState({game_state: cloneDeep(game_state)});
	}

	get_selected_creature = (): Creature_Data|undefined => {
		const _gs = this.state.game_state;

		if( _gs.selected_object_index != undefined ){
			return _gs.turn_list[_gs.current_turn].creature_list[_gs.selected_object_index]
		} else {
			return undefined;
		}
	}

	render = () => {
		const _GS = this.state.game_state;
		const selected_creature = this.get_selected_creature();
	
		return (
			<div
				className="game_status_display"
			>
				<button
					onClick={(evt)=>{this.props.advance_turn_start()}}
				>
					Next Turn
				</button>
				<Label_and_Data_Pair
					label={'Turn #:'}
					data={`${_GS.current_turn}`}
				/>
				<Label_and_Data_Pair
					label={'Objectives:'}
					data={``}
				/>
				<Label_and_Data_Pair
					label={''}
					data={`${_GS.objective_text}`}
				/>
				<br />
				<hr />
				<br />
				<>
				{
					(selected_creature !== undefined ?
						<Label_and_Data_Pair
							label={'Selected Unit:'}
							data={`${Creature_ƒ.get_delegate(selected_creature.type_name).yield_prettyprint_name()}`}
						/> :
						<Label_and_Data_Pair
							label={''}
							data={`No Unit Selected.`}
						/>
					)
				}
				</>
				<>
				{
					(selected_creature !== undefined)
					&&
					<>
						<Label_and_Data_Pair
							label={'Team:'}
							data={`${selected_creature.team}`}
						/>

						<Tile_Palette_Element
							asset_manager={this.props._Asset_Manager}
							tile_name={''}
							asset_name={`${Creature_ƒ.get_delegate(selected_creature.type_name).yield_creature_image()}`}
							highlight={false}
							handle_click={ ()=>{} }
						/>
						<Label_and_Data_Pair
							label={'Hitpoints:'}
							data={`${selected_creature.current_hitpoints} / ${Creature_ƒ.get_delegate(selected_creature.type_name).yield_max_hitpoints()}`}
						/>
						<Label_and_Data_Pair
							label={'Moves:'}
							data={`${Creature_ƒ.get_delegate(selected_creature.type_name).yield_moves_per_turn()}`}
						/>
						<Label_and_Data_Pair
							label={'Damage:'}
							data={`${Creature_ƒ.get_delegate(selected_creature.type_name).yield_damage()}`}
						/>
					</>
				}
				</>

			</div>
		)
	}
}

class Label_and_Data_Pair extends React.Component <{label: string, data: string}> {
	render = () => (
		<div className="label_and_data_pair">
			<div className="label">{this.props.label}</div>
			<div className="data">{this.props.data}</div>
		</div>
	)
}

const Map_Tooltip = (props: TooltipData) => {
	return <div
		className="map-tooltip"
		style={{
			left: `${props.pos.x * 2}px`,
			top: `${props.pos.y * 2}px`
		}}
	>
		<div>{`${props.pos.x}, ${props.pos.y}`}</div>
		<div>{`${props.tile_name}`}</div>
	</div>
}

class Tooltip_Manager extends React.Component<{},TooltipData> {
	
	constructor (props: {}) {
		super( props );

		this.state = { pos: {x:0,y:0}, tile_name: '' };
	}

	update_tooltip_data = (p: TooltipData) => {
		this.setState(p);
	}

	render = () => (
		<div className="map-tooltip-anchor">
			<Map_Tooltip
				{...this.state}
			/>
		</div>
	)
}

type TooltipData = { pos: Point2D, tile_name: string };




export class Game_View extends React.Component <Game_View_Props, {pos: Point2D}> {
	render_loop_interval: number|undefined;
	_Game_Manager: Game_Manager;
	awaiting_render: boolean;
	gsd!: Game_Status_Display;
	tooltip_manager!: Tooltip_Manager;
	

	constructor( props: Game_View_Props ) {
		super( props );

		this._Game_Manager = new Game_Manager(
			this.props._Blit_Manager,
			this.props._Asset_Manager,
			this.props._Tilemap_Manager,
		);
		this.awaiting_render = false;
		this.state = { pos: {x:0,y:0}};
	}



/*----------------------- core drawing routines -----------------------*/
	iterate_render_loop = () => {
		this.awaiting_render = true;
		this.render_loop_interval = window.setTimeout( this.render_canvas, 16.666 );

		/*
			Whether this is an appropriate solution gets into some deep and hard questions about React that I'm not prepared to answer; in a lot of other paradigms, we'd seize full control over the event loop.  Here, we are, instead, opting to "sleep" until our setTimeout fires.

			I suspect that because this setTimeout is initiated AFTER all of our rendering code finishes executing, that this solution will not cause the main failure state we're concerned about, which is a 'pileup'; a 'sorceror's apprentice' failure where callbacks are queued up faster than we can process them..
		*/
	}

	set_tooltip_data = (pos: Point2D) => {
		this.setState({ pos: pos});
	}

	render_canvas = () => {
		if(this.awaiting_render){
			this.props._Tilemap_Manager.do_one_frame_of_rendering();
			this._Game_Manager.do_one_frame_of_rendering_and_processing();
			this.awaiting_render = false;
			this.iterate_render_loop();
		} else {
			this.iterate_render_loop();
		}
	}

	handle_canvas_mouse_move = (mouse_pos: Point2D) => {
		this._Game_Manager.set_cursor_pos(mouse_pos);
	}

	componentDidMount() {
		this._Game_Manager.set_update_function( this.gsd.update_game_state_for_ui );
		this._Game_Manager.set_tooltip_update_function( this.tooltip_manager.update_tooltip_data );
		if(this.props.assets_loaded){
			this.iterate_render_loop();
		}
	}

	componentDidUpdate() {
		if(this.props.assets_loaded){
			this.iterate_render_loop();
		}
	}
	
	componentWillUnmount(){
		window.clearInterval(this.render_loop_interval);
		this.render_loop_interval = undefined;
	}

	render() {
		return <div className="game_node">
			<Canvas_View
				{...this.props}
				dimensions={this.props.dimensions}
				handle_canvas_click={ this._Game_Manager.handle_click }
				handle_canvas_keys_down={ ()=>{ /*console.log('game_keydown')*/} }
				handle_canvas_mouse_move={this.handle_canvas_mouse_move}
			/>
			<Tooltip_Manager
				ref={(node) => {this.tooltip_manager = node!;}}
			/>
			<Game_Status_Display
				ref={(node) => {this.gsd = node!;}}
				_Game_Manager={this._Game_Manager}
				_Asset_Manager={this.props._Asset_Manager}
				advance_turn_start={this._Game_Manager.advance_turn_start}
			/>
		</div>;
	}

}