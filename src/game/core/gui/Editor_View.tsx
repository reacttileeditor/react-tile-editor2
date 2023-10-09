import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

import { Canvas_View, MouseButtonState } from "./Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../engine/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager";

import "./Primary_View.scss";
import { Point2D, Rectangle } from '../../interfaces';
import { zorder } from "../constants/zorder";


interface Editor_View_Props {
	_Asset_Manager: Asset_Manager_Data,
	_Blit_Manager: Blit_Manager_Data,
	assets_loaded: boolean,
	initialize_tilemap_manager: Function,
	_Tilemap_Manager: Tilemap_Manager_Data,
	dimensions: Point2D,
}






export const Editor_View = (props: Editor_View_Props) => {

	const [render_loop_interval, set_render_loop_interval] = useState<number|null>(null);
	const [selected_tile_type, set_selected_tile_type] = useState<string>('');
	const [cursor_pos, set_cursor_pos] = useState<Point2D>({ x: 0, y: 0 });



	useEffect(() => {
		if(
			props.assets_loaded
			&&
			render_loop_interval == null
			&&
			props._Tilemap_Manager != null
			
		){
			console.log('EDITOR START')
			start_render_loop();
		}
	}, [props.assets_loaded, props._Tilemap_Manager]);

	useEffect(() => {

		return () => {
			if( render_loop_interval ){
				console.log('EDITOR CLEANUP')

				window.clearInterval(render_loop_interval as number);
				set_render_loop_interval(null);
			}
		};
	}, [render_loop_interval]);

	/*----------------------- cursor stuff -----------------------*/
	const draw_cursor = () => {
		//const pos = this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(0,4); 
		console.log(cursor_pos);

		Asset_Manager_ƒ.draw_image_for_asset_name({
			_AM:						props._Asset_Manager,
			asset_name:					'cursor',
			_BM:						props._Blit_Manager,
			pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( props._Tilemap_Manager, cursor_pos ),
			zorder:						zorder.rocks,
			current_milliseconds:		0,
			opacity:					1.0,
			rotate:						0,
			brightness:					1.0,
			horizontally_flipped:		false,
			vertically_flipped:			false,
		})
	}


	/*----------------------- core drawing routines -----------------------*/
	const start_render_loop = () => {
		if( !render_loop_interval ){
			set_render_loop_interval( window.setInterval( render_canvas, 16.666 ) );
		}
	}

	const render_canvas = () => {
		Tilemap_Manager_ƒ.do_one_frame_of_rendering( props._Tilemap_Manager );
		draw_cursor();
	}

	
	/*----------------------- I/O routines -----------------------*/
	const handle_canvas_click = (pos: Point2D, buttons_pressed: MouseButtonState) => {
		Tilemap_Manager_ƒ.modify_tile_status(
			props._Tilemap_Manager,
			Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(props._Tilemap_Manager, pos),
			selected_tile_type,
			'terrain'
		);
	}

	const handle_canvas_mouse_move = (pos: Point2D, buttons_pressed: MouseButtonState) => {
		set_cursor_pos(
			Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(props._Tilemap_Manager, pos)
		);

		if( buttons_pressed.left == true ){
			handle_canvas_click(pos, buttons_pressed);
		}
		
	}

	const handle_canvas_keys_down = (keys: Array<string>) => {
		let move = { x: 0, y: 0};

		if( _.includes(keys, 'ArrowDown') ){
			move.y += 40;
		}

		if( _.includes(keys, 'ArrowUp') ){
			move.y -= 40;
		}

		if( _.includes(keys, 'ArrowLeft') ){
			move.x -= 40;
		}

		if( _.includes(keys, 'ArrowRight') ){
			move.x += 40;
		}

		Blit_Manager_ƒ.adjust_viewport_pos(props._Blit_Manager, move.x, move.y);
	}



	return <div className="editor_node">
		<Canvas_View
			{...props}
			dimensions={props.dimensions}
			handle_canvas_click={handle_canvas_click}
			handle_canvas_keys_down={handle_canvas_keys_down}
			handle_canvas_mouse_move={handle_canvas_mouse_move}
		/>
		<div className="tile_palette">
		{
			props.assets_loaded
			&&
			Asset_Manager_ƒ.yield_tile_name_list(props._Asset_Manager).map( (value, index) => {
				return	<Tile_Palette_Element
							asset_manager={props._Asset_Manager}
							tile_name={value}
							asset_name={''}
							key={value}
							highlight={ selected_tile_type == value }
							handle_click={ () => set_selected_tile_type( value ) }
						/>
			})
		}
		</div>
	</div>;
}