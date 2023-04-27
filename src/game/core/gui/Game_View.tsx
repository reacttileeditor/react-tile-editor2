import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, findIndex, includes, isEmpty, isNil, isNumber, last, map, reduce, size, uniq } from "lodash";

import { ƒ } from "../engine/Utils";

import { Canvas_View } from "./Canvas_View";
import { Asset_Manager_Data } from "../engine/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager";
import { Pathfinder } from "../engine/Pathfinding";

import { Creature_ƒ, New_Creature, Creature_Data, PathNodeWithDirection, ChangeInstance } from "../../objects_core/Creature";

import "./Primary_View.scss";
import "./Game_Status_Display.scss";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../objects_core/Custom_Object";

interface Game_View_Props {
	_Asset_Manager: Asset_Manager_Data,
	_Blit_Manager: Blit_Manager_Data,
	assets_loaded: boolean,
	initialize_tilemap_manager: Function,
	_Tilemap_Manager: Tilemap_Manager_Data,
	dimensions: Point2D,
}



export type TooltipData = {
	pos: Point2D,
	tile_name: string,
	tile_cost: string,
};




interface Game_Status_Display_Props {
	_Game_Manager_Data: Game_Manager_Data,
	_Asset_Manager: Asset_Manager_Data;
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
					onClick={(evt)=>{Game_Manager_ƒ.advance_turn_start(this.props._Game_Manager_Data)}}
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
		<div className="data-row">{`${props.tile_name}`}</div>
		{
			!isEmpty(props.tile_cost) && !isNil(props.tile_cost)
			&&
			<div className="data-row"> {`${props.tile_cost}`}<img src={Foot_Icon}/></div>
		}
	</div>
}

import Foot_Icon from '../../../assets/feet-icon.png';
import { GameStateInit, Game_Manager_Data, Game_Manager_ƒ, Game_State, New_Game_Manager } from "../engine/Game_Manager";


class Tooltip_Manager extends React.Component<{},TooltipData> {
	
	constructor (props: {}) {
		super( props );

		this.state = { pos: {x:0,y:0}, tile_name: '', tile_cost: '' };
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



export class Game_View extends React.Component <Game_View_Props, {pos: Point2D}> {
	render_loop_interval: number|undefined;
	_Game_Manager_Data: Game_Manager_Data;
	awaiting_render: boolean;
	gsd!: Game_Status_Display;
	tooltip_manager!: Tooltip_Manager;
	

	constructor( props: Game_View_Props ) {
		super( props );

		this._Game_Manager_Data = New_Game_Manager({
			_Blit_Manager: this.props._Blit_Manager,
			_Asset_Manager: this.props._Asset_Manager,
			_TM: this.props._Tilemap_Manager,
			get_GM_instance: ()=>( this._Game_Manager_Data ),
		});
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
			Tilemap_Manager_ƒ.do_one_frame_of_rendering(this.props._Tilemap_Manager);
			Game_Manager_ƒ.do_one_frame_of_rendering_and_processing(this._Game_Manager_Data);
			this.awaiting_render = false;
			this.iterate_render_loop();
		} else {
			this.iterate_render_loop();
		}
	}

	handle_canvas_mouse_move = (mouse_pos: Point2D) => {
		Game_Manager_ƒ.set_cursor_pos(this._Game_Manager_Data, mouse_pos);
	}

	componentDidMount() {
		Game_Manager_ƒ.set_update_function(this._Game_Manager_Data, this.gsd.update_game_state_for_ui );
		Game_Manager_ƒ.set_tooltip_update_function(this._Game_Manager_Data, this.tooltip_manager.update_tooltip_data );
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
				handle_canvas_click={ (mouse_pos: Point2D) => { Game_Manager_ƒ.handle_click(this._Game_Manager_Data, mouse_pos) } }  //TODO  this is broken!
				handle_canvas_keys_down={ ()=>{ /*console.log('game_keydown')*/} }
				handle_canvas_mouse_move={this.handle_canvas_mouse_move}
			/>
			<Tooltip_Manager
				ref={(node) => {this.tooltip_manager = node!;}}
			/>
			<Game_Status_Display
				ref={(node) => {this.gsd = node!;}}
				_Game_Manager_Data={this._Game_Manager_Data}
				_Asset_Manager={this.props._Asset_Manager}
			/>
		</div>;
	}

}