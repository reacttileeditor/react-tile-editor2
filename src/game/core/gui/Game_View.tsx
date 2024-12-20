import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, findIndex, includes, isEmpty, isNil, isNumber, last, map, reduce, size, uniq } from "lodash";

import { ƒ } from "../engine/Utils";

import { Canvas_View, Mouse_Button_State } from "./Canvas_View";
import { Asset_Manager_Data } from "../engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager/Tilemap_Manager";

import { Creature_ƒ, New_Creature, Creature_Data, Path_Node_With_Direction, Change_Instance, Path_Data } from "../../objects_core/Creature";

import "./Primary_View.scss";
import "./Game_Status_Display.scss";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../objects_core/Custom_Object";

interface Game_View_Props {
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
	get_Game_Manager_Data: () => Game_Manager_Data,
	set_Game_Manager_Data: (newVal: Game_Manager_Data) => void;
	assets_loaded: boolean,
	context_connected:  boolean,
	game_manager_loaded: boolean,
	connect_context_to_blit_manager: (ctx: CanvasRenderingContext2D) => void,
	dimensions: Point2D,
	is_edit_mode: boolean,	
	set_is_edit_mode: Dispatch<SetStateAction<boolean>>,
}



export type Tooltip_Data = {
	pos: Point2D,
	selected_unit: Creature_Data | undefined,
	hovered_unit: Creature_Data | undefined,
	path_data: Path_Data | undefined, 
	tile_pos: Point2D,
	unit_pos?: Point2D,
	tile_name: string,
	tile_cost: string,
};



const Map_Tooltip = (props: Tooltip_Data) => {
	let distance = !isNil(props.unit_pos) ? Tilemap_Manager_ƒ.get_tile_coord_distance_between(props.tile_pos, props.unit_pos) : 0;

	const get_left_click_text = (): string => {
		if(props.selected_unit !== undefined){
			if(props.hovered_unit ){
				if( equals(props.tile_pos, props.unit_pos) ){
					return 'Deselect'
				} else {
					//tile_pos implicitly is the currently selected unit, so this is a different one.
					return 'Select Unit'
				}
			} else {
				return 'Move';
			}
		} else {
			if( props.hovered_unit !== undefined ){ //unit viable for selection
				return 'Select Unit'
			} else {
				return 'n/a'
			}
		}
	}
	const get_right_click_text = (): string => {
		if(props.selected_unit !== undefined){
			if( equals(props.tile_pos, props.unit_pos) ){
				return 'Deselect';
			} else {
				if( size(props.path_data?.path_this_turn) ){
					return 'Cancel Move'
				} else {
					return 'n/a'
				}
			}
		} else {
			if( false ){ //unit viable for selection
				return 'Select'
			} else {
				return 'n/a'
			}
		}
	}
	return <div
		className="map-tooltip"
		style={{
			left: `${props.pos.x * 2}px`,
			top: `${props.pos.y * 2}px`
		}}
	>
		<div className={`data-row ${get_left_click_text() == 'n/a' ? 'disabled' : '' }`}><img src={Left_Click_Icon}/> {`${get_left_click_text()}`}</div>
		<div className={`data-row ${get_right_click_text() == 'n/a' ? 'disabled' : '' }`}><img src={Right_Click_Icon}/> {`${get_right_click_text()}`}</div>
		<hr />
		<div className="data-row">{`${props.tile_pos.x}, ${props.tile_pos.y}`}</div>
		<div className="data-row">{`${props.tile_name}`}</div>
		{
			!isEmpty(props.tile_cost) && !isNil(props.tile_cost)
			&&
			<div className="data-row"> {`${props.tile_cost}`}<img src={Foot_Icon}/></div>
		}
		{
			!isNil(props.unit_pos)
			&&
			<div className="data-row"> {`${distance}`}<img src={Distance_Icon}/></div>
		}

	</div>
}

import Foot_Icon from '../../assets/feet-icon.png';
import Distance_Icon from '../../assets/distance-icon.png';
import Left_Click_Icon from '../../assets/left-click-icon.png';
import Right_Click_Icon from '../../assets/right-click-icon.png';
import { GameStateInit, Game_Manager_Data, Game_Manager_ƒ, Game_State, Game_and_Tilemap_Manager_Data, New_Game_Manager } from "../engine/Game_Manager";
import { Game_Status_Display } from "./Game_Status_Display";
import { Announcement_Modal } from "./Announcement_Modal";
import { Button } from "rsuite";
import { Standard_Input_ƒ } from "./Standard_Input_Handling";
import { equals } from "ramda";


export const Tooltip_Manager = (props: {
	get_Game_Manager_Data: () => Game_Manager_Data,
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	render_ticktock: boolean,
	announcement_modal_hidden: boolean,
}) => {

	return <div className={`map-tooltip-anchor`} style={{display: `${props.announcement_modal_hidden ? 'block' : 'none'}`}}>
		{
			props.get_Game_Manager_Data() != undefined
			&&
			<Map_Tooltip
				{...Game_Manager_ƒ.get_tooltip_data(props.get_Game_Manager_Data(), props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager())}
			/>
		}
	</div>
}


export const Game_View = (props: Game_View_Props) => {

	const [render_ticktock, set_render_ticktock] = useState<boolean>(false);
	const [announcement_modal_hidden, set_announcement_modal_hidden] = useState<boolean>(false);
	let render_loop_timeout = 0;


	useEffect(() => {
		console.log('game view process')

		if( props.game_manager_loaded ) {
			Tilemap_Manager_ƒ.do_one_frame_of_rendering(
				props._Tilemap_Manager(),
				props._Asset_Manager(),
				props._Blit_Manager(),
				props.set_Blit_Manager,
				props.set_Tilemap_Manager,
				false,
				props.get_Game_Manager_Data().cursor_pos
			);

			let new_state: Game_Manager_Data = Game_Manager_ƒ.do_one_frame_of_processing(props.get_Game_Manager_Data(), props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager());

			props.set_Game_Manager_Data( new_state );

			Game_Manager_ƒ.do_one_frame_of_rendering( new_state,  props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager());
		}

		/*
			Whether this is an appropriate solution gets into some deep and hard questions about React that I'm not prepared to answer; in a lot of other paradigms, we'd seize full control over the event loop.  Here, we are, instead, opting to "sleep" until our setTimeout fires.

			I suspect that because this setTimeout is initiated AFTER all of our rendering code finishes executing, that this solution will not cause the main failure state we're concerned about, which is a 'pileup'; a 'sorceror's apprentice' failure where callbacks are queued up faster than we can process them..
		*/
		render_loop_timeout = window.setTimeout( () => {set_render_ticktock( !render_ticktock )}, 16.666 );
	}, [render_ticktock, props.context_connected]);


	useEffect(() => {
		return () => {
			console.log('game view cleanup');
			window.clearInterval(render_loop_timeout)
		};
	}, []);


	/*----------------------- IO routines -----------------------*/
	const handle_canvas_mouse_move = (pos: Point2D, buttons_pressed: Mouse_Button_State) => {
		if( props.get_Game_Manager_Data() != null ){
			props.set_Game_Manager_Data( Game_Manager_ƒ.set_cursor_pos(props.get_Game_Manager_Data(), pos, buttons_pressed));
		}
	}

	const handle_canvas_mouse_click = (pos: Point2D, buttons_pressed: Mouse_Button_State) => {
		console.log('canvas click game')

		if( !announcement_modal_hidden ){
			set_announcement_modal_hidden(true);
		} else {
			const new_game_data = Game_Manager_ƒ.handle_click(props.get_Game_Manager_Data,  props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager(), pos, buttons_pressed);

			props.set_Game_Manager_Data( new_game_data.gm );
			props.set_Tilemap_Manager( new_game_data.tm );
		}
	}

	const game_handle_canvas_keys_down = (keys: Array<string>) => {
		Standard_Input_ƒ.handle_canvas_keys_down(
			keys,
			props._Blit_Manager(),
			props.set_Blit_Manager,
		);
	}	

	return <div className="game_screen">
		<div className="toolbar">
			<Button
				onClick={ () => { props.set_is_edit_mode( !props.is_edit_mode ); } }
			>
				{'Toggle to Editor'}
			</Button>
		</div>
		<div className="game_node">
			<Canvas_View
				assets_loaded={props.assets_loaded}
				connect_context_to_blit_manager={props.connect_context_to_blit_manager}
				_Tilemap_Manager={props._Tilemap_Manager()}
				dimensions={props.dimensions}
				handle_canvas_click={handle_canvas_mouse_click}
				handle_canvas_keys_down={game_handle_canvas_keys_down}
				handle_canvas_mouse_move={handle_canvas_mouse_move}
			/>
			<Tooltip_Manager
				announcement_modal_hidden={announcement_modal_hidden}
				get_Game_Manager_Data={props.get_Game_Manager_Data}
				_Asset_Manager={props._Asset_Manager}
				_Blit_Manager={props._Blit_Manager}
				_Tilemap_Manager={props._Tilemap_Manager}
				render_ticktock={render_ticktock}
			/>
			<Announcement_Modal
				announcement_modal_hidden={announcement_modal_hidden}
				set_announcement_modal_hidden={set_announcement_modal_hidden}
				get_Game_Manager_Data={props.get_Game_Manager_Data}
			/>
			<Game_Status_Display
				set_announcement_modal_hidden={set_announcement_modal_hidden}
				get_Game_Manager_Data={props.get_Game_Manager_Data}
				set_Game_Manager_Data={props.set_Game_Manager_Data}
				_Asset_Manager={props._Asset_Manager}
				_Blit_Manager={props._Blit_Manager}
				_Tilemap_Manager={props._Tilemap_Manager}
				set_Tilemap_Manager={props.set_Tilemap_Manager}
				render_ticktock={render_ticktock}
			/>
		</div>
	</div>;

}