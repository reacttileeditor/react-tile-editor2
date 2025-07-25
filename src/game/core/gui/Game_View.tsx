import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { useInterval, ƒ } from "../engine/Utils";

import { Canvas_View, Mouse_Button_State } from "./Canvas_View";
import { Asset_Manager_Data } from "../engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "../engine/Blit_Manager";
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager/Tilemap_Manager";



import { Point2D, Rectangle } from '../../interfaces';
import { Game_and_Tilemap_Manager_Data, Game_Manager_Data, Game_Manager_ƒ } from "../engine/Game_Manager/Game_Manager";
import { Standard_Input_ƒ } from "./Standard_Input_Handling";
import { Button, IconButton } from "rsuite";
import { Game_Tooltip_Manager } from "./Game_Components/Game_Tooltip_Manager";
import { Game_Status_Display, New_Turn_Controls } from "./Game_Components/Game_Status_Display";
import { Announcement_Modal } from "./Game_Components/Announcement_Modal";
import ZoominIcon from '@rsuite/icons/Zoomin';
import { Icon } from "@rsuite/icons";


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



export const Game_View = (props: Game_View_Props) => {

	const [render_ticktock, set_render_ticktock] = useState<boolean>(false);
	const [announcement_modal_hidden, set_announcement_modal_hidden] = useState<boolean>(false);

	const [render_loop_interval, set_render_loop_interval] = useState<number|null>(null);
	const [render_tick, set_render_tick] = useState<number>(0);






	useEffect(() => {
		if(render_tick > 0){
		render_canvas();
		}
	}, [render_tick]);

	useInterval(() => {
		if(
			props.assets_loaded
			&&
			render_loop_interval == null
			&&
			props.context_connected
			
		){
			//console.log('GAME RENDER TICK')

			set_render_tick(render_tick + 1);
			set_render_ticktock( !render_ticktock )
		}
	}, 16.666 );	
		

	useEffect(() => {

		return () => {
			if( render_loop_interval ){
				console.log('GAME CLEANUP')

				window.clearInterval(render_loop_interval as number);
				set_render_loop_interval(null);
			}
		};
	}, [render_loop_interval]);


	/*----------------------- core drawing routines -----------------------*/

	const render_canvas = () => {
		if(
			props.game_manager_loaded
			&&
			render_loop_interval == null
			&&
			props._Tilemap_Manager != null
			
		) {



			let new_state: Game_and_Tilemap_Manager_Data = Game_Manager_ƒ.do_one_frame_of_processing(props.get_Game_Manager_Data(), props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager());

			props.set_Game_Manager_Data( new_state.gm );
			props.set_Tilemap_Manager(new_state.tm);

			Tilemap_Manager_ƒ.do_one_frame_of_rendering(
				new_state.tm,
				props._Asset_Manager(),
				props._Blit_Manager(),
				props.set_Blit_Manager,
				props.set_Tilemap_Manager,
				false,
				new_state.gm.cursor_pos
			);

			Standard_Input_ƒ.move_viewport_based_on_mouse_position(
				new_state.gm.cursor_pos,
				props._Blit_Manager(),
				props.set_Blit_Manager,
				new_state.tm,
				props._Asset_Manager(),
			);			
			Game_Manager_ƒ.do_one_frame_of_rendering( new_state.gm,  new_state.tm, props._Asset_Manager(), props._Blit_Manager());			

		}
	}




	/*----------------------- IO routines -----------------------*/
	const update_mouse_pos = (pos: Point2D) => {
		if( props.get_Game_Manager_Data() != null ){
			props.set_Game_Manager_Data( Game_Manager_ƒ.set_cursor_pos(props.get_Game_Manager_Data(), props._Blit_Manager(), pos));
		}
	}

	const handle_canvas_mouse_move = (pos: Point2D, buttons_pressed: Mouse_Button_State) => {
		Standard_Input_ƒ.handle_canvas_mouse_move(
			pos,
			buttons_pressed,
			props._Tilemap_Manager(),
			props._Asset_Manager(),
			props._Blit_Manager(),
			update_mouse_pos,
			props.set_Blit_Manager,
			handle_canvas_mouse_click
		)
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
			props._Tilemap_Manager(),
			props._Asset_Manager(),
		);
	}	

	const fullscreenRef = useRef<HTMLDivElement>(null);

	const toggleFullscreen = () => {
        if (fullscreenRef.current) {
			if(!document.fullscreenElement ){
				fullscreenRef.current.requestFullscreen();
			} else {
				document.exitFullscreen();
			}
		}
	}

	return <div className="game_screen">
		<div className="toolbar">
			<Button
				onClick={ () => { props.set_is_edit_mode( !props.is_edit_mode ); } }
			>
				{'Toggle to Editor'}
			</Button>
		</div>
		<div className="game_node" ref={fullscreenRef}>
			<IconButton
				icon={<Icon as={ZoominIcon as React.ElementType} />}
				onClick={()=>{
					toggleFullscreen();
				}}
			/>			
			<div className="game_screen">
				<Canvas_View
					assets_loaded={props.assets_loaded}
					connect_context_to_blit_manager={props.connect_context_to_blit_manager}
					_Tilemap_Manager={props._Tilemap_Manager()}
					dimensions={props.dimensions}
					handle_canvas_click={handle_canvas_mouse_click}
					handle_canvas_keys_down={game_handle_canvas_keys_down}
					handle_canvas_mouse_move={handle_canvas_mouse_move}
				/>
				<Game_Tooltip_Manager
					announcement_modal_hidden={announcement_modal_hidden}
					get_Game_Manager_Data={props.get_Game_Manager_Data}
					_Asset_Manager={props._Asset_Manager}
					_Blit_Manager={props._Blit_Manager}
					_Tilemap_Manager={props._Tilemap_Manager}
					render_ticktock={render_ticktock}
				/>
				<New_Turn_Controls
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