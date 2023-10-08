import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

import { Asset_Manager_Data } from "../engine/Asset_Manager";
import { Tilemap_Manager_Data } from "../engine/Tilemap_Manager";
import * as Utils from "../engine/Utils";

interface Props {
	assets_loaded: boolean,
	initialize_tilemap_manager: Function,
	_Tilemap_Manager: Tilemap_Manager_Data,
	dimensions: Point2D,
	
	handle_canvas_click: (pos: Point2D, buttons_pressed: MouseButtonState) => void,
	handle_canvas_keys_down: (keys: Array<string>) => void,
	handle_canvas_mouse_move: (pos: Point2D, buttons_pressed: MouseButtonState) => void,
}

interface State {
	mousedown_pos?: Point2D,
}

import { Point2D, Rectangle } from '../../interfaces';

export type MouseButtonState = {
	back: boolean,
	forward: boolean,
	left: boolean,
	middle: boolean,
	right: boolean,
}


export class Canvas_View extends React.Component <Props, State> {
	ctx!: CanvasRenderingContext2D;
	render_loop_interval: number|undefined;
	canvas!: HTMLCanvasElement;
	keys_currently_pressed: Array<string>;

/*----------------------- initialization and asset loading -----------------------*/
	constructor( props: Props ) {
		super( props );
		
		this.keys_currently_pressed = [];
		this.state = {
			mousedown_pos: undefined,
		}
	}


	componentDidMount() {
		this.ctx = this.canvas!.getContext("2d")!;
		this.props.initialize_tilemap_manager(this.ctx);
		document.addEventListener('keydown', this.handle_canvas_keydown as unknown as EventListener );
		document.addEventListener('keyup', this.handle_canvas_keyup as unknown as EventListener );
	}

	componentWillUnmount() {
		document.removeEventListener ('mouseup',   this.mouseupListener as unknown as EventListener,   {capture: true});
		document.removeEventListener ('mousemove', this.mousemoveListener as unknown as EventListener, {capture: true});
		document.removeEventListener ('keydown', this.handle_canvas_keydown as unknown as EventListener);
		document.removeEventListener ('keyup', this.handle_canvas_keyup as unknown as EventListener);

	}	

/*----------------------- event handling -----------------------*/
	/*
		The big-picture view of event-handling in this app is that, to prevent event dropping, we do almost no event-handling in the actual final objects themselves - everything about tracking the mouse when you're doing an operation is handled on the main canvas itself.  The one thing we track in the objects themselves is the act of *starting* an event; of recording which event is being performed.  I.e. if you click on one of the rotate grabbers and start rotating an image, we'll use that to record (in this, the parent object) that a rotation event has started, but all of the actual tracking of the movement of the mouse (ergo, of what angle you're rotating to, and when you let go of the mouse) happens here.

		Events, like in photoshop, are modal; once you start rotating an image, the program is essentially 'locked' into a rotation mode until you let go of the mouse.  Because of this, we handle everything basically as a central 'switchboard', right here.
	*/
	handle_canvas_keydown = (evt: React.KeyboardEvent<HTMLCanvasElement>)=>{
		this.keys_currently_pressed = _.uniq( _.concat(this.keys_currently_pressed, evt.key) )


		this.props.handle_canvas_keys_down( this.keys_currently_pressed );
	}

	handle_canvas_keyup = (evt: React.KeyboardEvent<HTMLCanvasElement>)=>{
		this.keys_currently_pressed = _.uniq( _.filter(this.keys_currently_pressed, (val)=>(val != evt.key)) )


		this.props.handle_canvas_keys_down( this.keys_currently_pressed );
	}



	track_canvas_move = ( e: React.MouseEvent<HTMLCanvasElement> ) => {
		var mousePosUnconstrained = this.get_mouse_pos_for_action(e, false);
		var mousePos = this.get_mouse_pos_for_action(e, true);

		let buttons_pressed = this.extract_which_mouse_button(e)
		//this is where we had the giant switch statement of actions to perform.
		//console.log("MousePos:", mousePos);
		//this.props._Tilemap_Manager.handle_mouse_move( mousePos.x, mousePos.y );
		this.props.handle_canvas_mouse_move( mousePos, buttons_pressed );
	}

	constrain = ( min_limit: number, value: number, max_limit: number ) => {
		return Math.min( Math.max(min_limit, value), max_limit);
	}

	handle_canvas_click = ( e: React.MouseEvent<HTMLCanvasElement>, buttons_pressed: MouseButtonState ) => {
		var mousePos = this.get_mouse_pos_for_action(e, true);
	
		this.props.handle_canvas_click( mousePos, buttons_pressed );
	}

	get_mouse_pos_for_action = ( e: React.MouseEvent<HTMLCanvasElement>, should_constrain: boolean ) => {
		const bgRectSrc = this.canvas.getBoundingClientRect();
		const bgRect = { x: bgRectSrc.left, y: bgRectSrc.top, w: bgRectSrc.right - bgRectSrc.left, h: bgRectSrc.bottom - bgRectSrc.top };


			/*
				This exists to enable having a canvas that's got different bounds than its native pixel size (generally something like 2x, but this should be general enough to handle wacky alternatives, including situations where it's being vertically stretched or w/e.
			*/
		const scaleCoeff = {
			x: bgRect.w / this.props.dimensions.x,
			y: bgRect.h / this.props.dimensions.y
		}

		const mousePosRaw = (() => { if(e.nativeEvent !== undefined) {
			return	{
						x: e.nativeEvent.clientX - bgRect.x,
						y: e.nativeEvent.clientY - bgRect.y
					};
		} else {
			return	{
						x: e.clientX - bgRect.x,
						y: e.clientY - bgRect.y
					};
		}})();

		const mousePos =	{
								x: Math.round(mousePosRaw.x / scaleCoeff.x),
								y: Math.round(mousePosRaw.y / scaleCoeff.y)
							};


		if( should_constrain ){
			return {
				x: this.constrain(0, mousePos.x, bgRect.w),
				y: this.constrain(0, mousePos.y, bgRect.h)
			};
		} else {
			return {
				x: mousePos.x,
				y: mousePos.y,
			};
		}
	}



	mousedownListener = (e: React.MouseEvent<HTMLCanvasElement>) => {
		let buttons_pressed = this.extract_which_mouse_button(e)
		this.handle_canvas_click(e, buttons_pressed);
		this.captureMouseEvents(e);
	}

	extract_which_mouse_button = (e: React.MouseEvent<HTMLCanvasElement>): MouseButtonState => {
		var names = [
			'left', 'right', 'middle', 'back', 'forward'
		];

		var buttons =	Utils.convert_bitmask_to_array_of_individual_bit_values(e.buttons)
						.concat([0, 0, 0, 0, 0])
						.slice(0, names.length);

		return _.reduce(
			buttons.map((val, idx) => {
				return {[names[idx]]: Boolean(val === 1) };
			}),
			(a,b) => _.merge(a,b)
		) as MouseButtonState
	}

	mousemoveListener = (e: React.MouseEvent<HTMLCanvasElement>) => {
		this.track_canvas_move(e);
		e.stopPropagation();
	}

	mouseupListener = (e: React.MouseEvent<HTMLCanvasElement>) => {
		var restoreGlobalMouseEvents = () => {
			document.body.setAttribute('style', 'pointer-events: auto;');
		}

		restoreGlobalMouseEvents ();
		document.removeEventListener ('mouseup',   this.mouseupListener as unknown as EventListener,   {capture: true});
		document.removeEventListener ('mousemove', this.mousemoveListener as unknown as EventListener, {capture: true});
		e.stopPropagation ();

		//annul any in-progress operations here
		//this.props._Tilemap_Manager.annul_current_drag_operation();

		this.setState({mousedown_pos: undefined});
	}

	captureMouseEvents = (e: React.MouseEvent<HTMLCanvasElement>) => {
		var preventGlobalMouseEvents = () => {
			document.body.setAttribute('style', 'pointer-events: none;');
		};

		preventGlobalMouseEvents ();
		document.addEventListener ('mouseup',   this.mouseupListener as unknown as EventListener,   {capture: true});
		document.addEventListener ('mousemove', this.mousemoveListener as unknown as EventListener, {capture: true});
		e.preventDefault ();
		e.stopPropagation ();
	}


/*----------------------- state manipulation -----------------------*/

/*----------------------- react render -----------------------*/

	render() {
		return <div className="canvas_holder">
			<canvas
				ref={(node) => {this.canvas = node!;}}
				width={this.props.dimensions.x}
				height={this.props.dimensions.y}
			
				onMouseDown={ this.mousedownListener }
				onMouseMove={ this.mousemoveListener }
				onContextMenu={ (e) => { e.preventDefault(); return false; } }
			/>
		</div>;
	}
}
