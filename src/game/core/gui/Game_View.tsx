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


/*class Tooltip_Manager extends React.Component<{},TooltipData> {
	
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
}*/

export const Tooltip_Manager = (props: TooltipData) => (
	<div className="map-tooltip-anchor">
		<Map_Tooltip
			{...props}
		/>
	</div>
)


export const Game_View = (props: Game_View_Props) => {
	//tooltip_manager!: Tooltip_Manager;
	
	const [tooltip_pos, set_tooltip_pos] = useState<Point2D>({x:0,y:0});
	const [awaiting_render, set_awaiting_render] = useState<boolean>(false);

	const [tooltip_data, set_tooltip_data] = useState<TooltipData>({
		pos: {x:0,y:0},
		tile_name: '',
		tile_cost: '',
	})

	const _Game_Manager_Data = New_Game_Manager({
		_Blit_Manager: props._Blit_Manager,
		_Asset_Manager: props._Asset_Manager,
		_TM: props._Tilemap_Manager,
		get_GM_instance: ()=>( _Game_Manager_Data ),
	});

	let render_loop_timeout = 0;

	useEffect(() => {
		console.log('initialize game view')
		//Game_Manager_ƒ.set_tooltip_update_function(_Game_Manager_Data, set_tooltip_data );
		render_canvas();
	});

	useEffect(() => {
		return () => { window.clearInterval(render_loop_timeout) };
	});


/*----------------------- core drawing routines -----------------------*/
	const iterate_render_loop = () => {
		set_awaiting_render(true);
		render_loop_timeout = window.setTimeout( render_canvas, 16.666 );

		/*
			Whether this is an appropriate solution gets into some deep and hard questions about React that I'm not prepared to answer; in a lot of other paradigms, we'd seize full control over the event loop.  Here, we are, instead, opting to "sleep" until our setTimeout fires.

			I suspect that because this setTimeout is initiated AFTER all of our rendering code finishes executing, that this solution will not cause the main failure state we're concerned about, which is a 'pileup'; a 'sorceror's apprentice' failure where callbacks are queued up faster than we can process them..
		*/
	}


	const render_canvas = () => {
		console.log('render game')
		if(awaiting_render){
			Tilemap_Manager_ƒ.do_one_frame_of_rendering(props._Tilemap_Manager);
			Game_Manager_ƒ.do_one_frame_of_rendering_and_processing(_Game_Manager_Data);
			set_awaiting_render(false);
			iterate_render_loop();
		} else {
			iterate_render_loop();
		}
	}

	const handle_canvas_mouse_move = (pos: Point2D, buttons_pressed: MouseButtonState) => {
		Game_Manager_ƒ.set_cursor_pos(_Game_Manager_Data, pos);
	}

	// componentDidMount() {
	// 	//Game_Manager_ƒ.set_update_function(this._Game_Manager_Data, this.gsd.update_game_state_for_ui );
	// 	Game_Manager_ƒ.set_tooltip_update_function(this._Game_Manager_Data, this.tooltip_manager.update_tooltip_data );
	// 	if(this.props.assets_loaded){
	// 		this.iterate_render_loop();
	// 	}
	// }

	// componentDidUpdate() {
	// 	if(this.props.assets_loaded){
	// 		this.iterate_render_loop();
	// 	}
	// }
	
	// componentWillUnmount(){
	// 	window.clearInterval(this.render_loop_interval);
	// 	this.render_loop_interval = undefined;
	// }

	return <div className="game_node">
		<Canvas_View
			{...props}
			dimensions={props.dimensions}
			handle_canvas_click={ (mouse_pos: Point2D, buttons_pressed: MouseButtonState) => { Game_Manager_ƒ.handle_click(_Game_Manager_Data, mouse_pos, buttons_pressed) } }  //TODO  this is broken!
			handle_canvas_keys_down={ ()=>{ /*console.log('game_keydown')*/} }
			handle_canvas_mouse_move={handle_canvas_mouse_move}
		/>
		<Tooltip_Manager
			{...tooltip_data} //ref={(node) => {this.tooltip_manager = node!;}}
		/>
		<Game_Status_Display
			_Game_Manager_Data={_Game_Manager_Data}
			_Asset_Manager={props._Asset_Manager}
		/>
	</div>;

}