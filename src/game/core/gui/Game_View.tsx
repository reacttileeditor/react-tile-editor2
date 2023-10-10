import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, findIndex, includes, isEmpty, isNil, isNumber, last, map, reduce, size, uniq } from "lodash";

import { ƒ } from "../engine/Utils";

import { Canvas_View, MouseButtonState } from "./Canvas_View";
import { Asset_Manager_Data } from "../engine/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager";

import { Creature_ƒ, New_Creature, Creature_Data, PathNodeWithDirection, ChangeInstance } from "../../objects_core/Creature";

import "./Primary_View.scss";
import "./Game_Status_Display.scss";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../objects_core/Custom_Object";

interface Game_View_Props {
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	assets_loaded: boolean,
	initialize_tilemap_manager: Function,
	dimensions: Point2D,
}



export type TooltipData = {
	pos: Point2D,
	tile_name: string,
	tile_cost: string,
};



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
import { Game_Status_Display } from "./Game_Status_Display";


export const Tooltip_Manager = (props: {_Game_Manager_Data: Game_Manager_Data, render_ticktock: boolean}) => {

	const [tooltip_data, set_tooltip_data] = useState<TooltipData>({
		pos: {x:0,y:0},
		tile_name: '',
		tile_cost: '',
	});

	useEffect(() => {
		console.log('tooltip', Game_Manager_ƒ.get_tooltip_data(props._Game_Manager_Data));

		//props._Game_Manager_Data.get_GM_instance()

		//Game_Manager_ƒ.set_tooltip_update_function(_Game_Manager_Data, set_tooltip_data );
	}, [props.render_ticktock]);


	return <div className={`map-tooltip-anchor ${props.render_ticktock}`}>
		<Map_Tooltip
			{...Game_Manager_ƒ.get_tooltip_data(props._Game_Manager_Data)}
		/>
	</div>
}


export const Game_View = (props: Game_View_Props) => {
	const [render_ticktock, set_render_ticktock] = useState<boolean>(false);


	const init_Game_Manager_Data = 
		New_Game_Manager({
			_Blit_Manager: props._Blit_Manager,
			_Asset_Manager: props._Asset_Manager,
			_TM: props._Tilemap_Manager,
			get_GM_instance: ()=>( _Game_Manager_Data ),
		});

	const [_Game_Manager_Data, set_Game_Manager_Data] = useState<Game_Manager_Data>(init_Game_Manager_Data);


	let render_loop_timeout = 0;


	useEffect(() => {
		console.log('game view process')
		render_canvas();
	}, [render_ticktock]);

	useEffect(() => {
		console.log('game view render', _Game_Manager_Data)
		Game_Manager_ƒ.do_one_frame_of_rendering(_Game_Manager_Data);
	}, [_Game_Manager_Data]);

	useEffect(() => {
		return () => { console.log('cleanup'); window.clearInterval(render_loop_timeout) };
	}, []);


/*----------------------- core drawing routines -----------------------*/
	const iterate_render_loop = () => {
		render_loop_timeout = window.setTimeout( () => {set_render_ticktock( !render_ticktock )}, 16.666 );
		

		/*
			Whether this is an appropriate solution gets into some deep and hard questions about React that I'm not prepared to answer; in a lot of other paradigms, we'd seize full control over the event loop.  Here, we are, instead, opting to "sleep" until our setTimeout fires.

			I suspect that because this setTimeout is initiated AFTER all of our rendering code finishes executing, that this solution will not cause the main failure state we're concerned about, which is a 'pileup'; a 'sorceror's apprentice' failure where callbacks are queued up faster than we can process them..
		*/
	}


	const render_canvas = () => {
		Tilemap_Manager_ƒ.do_one_frame_of_rendering(props._Tilemap_Manager());
		set_Game_Manager_Data( Game_Manager_ƒ.do_one_frame_of_processing(_Game_Manager_Data) );
		
		iterate_render_loop();
	}

	const handle_canvas_mouse_move = (pos: Point2D, buttons_pressed: MouseButtonState) => {
		//Game_Manager_ƒ.set_cursor_pos(_Game_Manager_Data, pos);
	}


	return <div className="game_node">
		<Canvas_View
			assets_loaded={props.assets_loaded}
			initialize_tilemap_manager={props.initialize_tilemap_manager}
			_Tilemap_Manager={props._Tilemap_Manager()}
			dimensions={props.dimensions}
			handle_canvas_click={ (mouse_pos: Point2D, buttons_pressed: MouseButtonState) => { Game_Manager_ƒ.handle_click(_Game_Manager_Data, mouse_pos, buttons_pressed) } }  //TODO  this is broken!
			handle_canvas_keys_down={ ()=>{ /*console.log('game_keydown')*/} }
			handle_canvas_mouse_move={handle_canvas_mouse_move}
		/>
		<Tooltip_Manager
			_Game_Manager_Data={_Game_Manager_Data}
			render_ticktock={render_ticktock}
		/>
		<Game_Status_Display
			_Game_Manager_Data={_Game_Manager_Data}
			_Asset_Manager={props._Asset_Manager()}
		/>
	</div>;

}