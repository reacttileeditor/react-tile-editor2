import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

import { Asset_Manager_Data } from "../engine/Asset_Manager";
import { Tilemap_Manager_Data } from "../engine/Tilemap_Manager/Tilemap_Manager";
import * as Utils from "../engine/Utils";

interface Props {
	assets_loaded: boolean,
	connect_context_to_blit_manager: (ctx: CanvasRenderingContext2D) => void,
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


export const Canvas_View = (props: Props) => {

	const canvasRef = React.useRef<HTMLCanvasElement>(null);

	//const [keys_currently_pressed, set_keys_currently_pressed] = useState<Array<string>>([]);
	const [mousedown_pos, set_mousedown_pos] = useState<Point2D|null>(null);

	const keys_currently_pressed = useRef<Array<string>>([]);
	const set_keys_currently_pressed = (newKeys: Array<string>) => (keys_currently_pressed.current = newKeys);

/*----------------------- initialization and asset loading -----------------------*/
	useEffect(() => {

		const ctx = getContext();
		console.log(ctx);
		if(ctx){
			console.log('CANVAS TILEMANAGER INIT SUCCESS')
			props.connect_context_to_blit_manager(ctx);
		} else {
			console.log('CANVAS TILEMANAGER INIT FAIL')

		}
	}, []);


	useEffect(() => {
		console.log('CANVAS EVENT INIT')

		document.addEventListener('keydown', handle_canvas_keydown as unknown as EventListener );
		document.addEventListener('keyup', handle_canvas_keyup as unknown as EventListener );

		return () => {
			console.log('CANVAS EVENT CLEANUP')

			document.removeEventListener ('mouseup',   mouseupListener as unknown as EventListener,   {capture: true});
			document.removeEventListener ('mousemove', mousemoveListener as unknown as EventListener, {capture: true});
			document.removeEventListener ('keydown', handle_canvas_keydown as unknown as EventListener);
			document.removeEventListener ('keyup', handle_canvas_keyup as unknown as EventListener);
		};
	}, []);

	const getCanvas =  (): HTMLCanvasElement | null => (canvasRef.current);
	const getContext = (): CanvasRenderingContext2D | null => {
		const canvas = getCanvas()
		if(canvas != null){
			return canvas.getContext('2d');
		} else {
			return null;
		}
	};




/*----------------------- event handling -----------------------*/
	/*
		The big-picture view of event-handling in this app is that, to prevent event dropping, we do almost no event-handling in the actual final objects themselves - everything about tracking the mouse when you're doing an operation is handled on the main canvas itself.  The one thing we track in the objects themselves is the act of *starting* an event; of recording which event is being performed.  I.e. if you click on one of the rotate grabbers and start rotating an image, we'll use that to record (in this, the parent object) that a rotation event has started, but all of the actual tracking of the movement of the mouse (ergo, of what angle you're rotating to, and when you let go of the mouse) happens here.

		Events, like in photoshop, are modal; once you start rotating an image, the program is essentially 'locked' into a rotation mode until you let go of the mouse.  Because of this, we handle everything basically as a central 'switchboard', right here.
	*/
	const handle_canvas_keydown = (evt: React.KeyboardEvent<HTMLCanvasElement>)=>{
		set_keys_currently_pressed(_.uniq( _.concat(keys_currently_pressed.current, evt.key) ));


		props.handle_canvas_keys_down( keys_currently_pressed.current );
	}

	const handle_canvas_keyup = (evt: React.KeyboardEvent<HTMLCanvasElement>)=>{
		set_keys_currently_pressed( _.uniq( _.filter(keys_currently_pressed.current, (val)=>(val != evt.key)) ) );


		props.handle_canvas_keys_down( keys_currently_pressed.current );
	}



	const track_canvas_move = ( e: React.MouseEvent<HTMLCanvasElement> ) => {
		var mousePosUnconstrained = get_mouse_pos_for_action(e, false);
		var mousePos = get_mouse_pos_for_action(e, true);

		let buttons_pressed = extract_which_mouse_button(e)
		//this is where we had the giant switch statement of actions to perform.
		//console.log("MousePos:", mousePos);
		//this.props._Tilemap_Manager.handle_mouse_move( mousePos.x, mousePos.y );
		props.handle_canvas_mouse_move( mousePos, buttons_pressed );
	}

	const constrain = ( min_limit: number, value: number, max_limit: number ) => {
		return Math.min( Math.max(min_limit, value), max_limit);
	}

	const handle_canvas_click = ( e: React.MouseEvent<HTMLCanvasElement>, buttons_pressed: MouseButtonState ) => {
		var mousePos = get_mouse_pos_for_action(e, true);
	
		props.handle_canvas_click( mousePos, buttons_pressed );
	}

	const get_mouse_pos_for_action = ( e: React.MouseEvent<HTMLCanvasElement>, should_constrain: boolean ) => {
		const canvas = getCanvas();

		if( canvas ){
			const bgRectSrc = (canvas as HTMLCanvasElement).getBoundingClientRect();
			const bgRect = { x: bgRectSrc.left, y: bgRectSrc.top, w: bgRectSrc.right - bgRectSrc.left, h: bgRectSrc.bottom - bgRectSrc.top };


				/*
					This exists to enable having a canvas that's got different bounds than its native pixel size (generally something like 2x, but this should be general enough to handle wacky alternatives, including situations where it's being vertically stretched or w/e.
				*/
			const scaleCoeff = {
				x: bgRect.w / props.dimensions.x,
				y: bgRect.h / props.dimensions.y
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
					x: constrain(0, mousePos.x, bgRect.w),
					y: constrain(0, mousePos.y, bgRect.h)
				};
			} else {
				return {
					x: mousePos.x,
					y: mousePos.y,
				};
			}
		} else {
			return {x: 0, y: 0};
		}
	}



	const mousedownListener = (e: React.MouseEvent<HTMLCanvasElement>) => {
		let buttons_pressed = extract_which_mouse_button(e)
		handle_canvas_click(e, buttons_pressed);
		captureMouseEvents(e);
	}

	const extract_which_mouse_button = (e: React.MouseEvent<HTMLCanvasElement>): MouseButtonState => {
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

	const mousemoveListener = (e: React.MouseEvent<HTMLCanvasElement>) => {
		track_canvas_move(e);
		e.stopPropagation();
	}

	const mouseupListener = (e: React.MouseEvent<HTMLCanvasElement>) => {
		var restoreGlobalMouseEvents = () => {
			document.body.setAttribute('style', 'pointer-events: auto;');
		}

		restoreGlobalMouseEvents ();
		document.removeEventListener ('mouseup',   mouseupListener as unknown as EventListener,   {capture: true});
		document.removeEventListener ('mousemove', mousemoveListener as unknown as EventListener, {capture: true});
		e.stopPropagation ();

		//annul any in-progress operations here
		//this.props._Tilemap_Manager.annul_current_drag_operation();

		set_mousedown_pos(null);
	}

	const captureMouseEvents = (e: React.MouseEvent<HTMLCanvasElement>) => {
		var preventGlobalMouseEvents = () => {
			document.body.setAttribute('style', 'pointer-events: none;');
		};

		preventGlobalMouseEvents ();
		document.addEventListener ('mouseup',   mouseupListener as unknown as EventListener,   {capture: true});
		document.addEventListener ('mousemove', mousemoveListener as unknown as EventListener, {capture: true});
		e.preventDefault ();
		e.stopPropagation ();
	}


/*----------------------- state manipulation -----------------------*/

/*----------------------- react render -----------------------*/

	return <div className="canvas_holder">
		<canvas
			ref={canvasRef}
			width={props.dimensions.x}
			height={props.dimensions.y}
		
			onMouseDown={ mousedownListener }
			onMouseMove={ mousemoveListener }
			onContextMenu={ (e) => { e.preventDefault(); return false; } }
		/>
		<div className="left_scroll" />
		<div className="right_scroll" />
		<div className="top_scroll" />
		<div className="bottom_scroll" />
	</div>;
}
