import React from "react";
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

interface Editor_View_State {
	selected_tile_type: string,
}

export class Editor_View extends React.Component <Editor_View_Props, Editor_View_State> {
	render_loop_interval: number|undefined;
	state: {
		selected_tile_type: string,
		cursor_pos: Point2D,
	}

	constructor( props: Editor_View_Props ) {
		super( props );

		this.state = {
			selected_tile_type: '',
			cursor_pos: { x: 0, y: 0 },
		};
	}

/*----------------------- cursor stuff -----------------------*/
	set_cursor_pos = (coords: Point2D) => {
		this.state.cursor_pos = coords;
	}

	draw_cursor = () => {
		//const pos = this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(0,4); 

		Asset_Manager_ƒ.draw_image_for_asset_name({
			_AM:						this.props._Asset_Manager,
			asset_name:					'cursor',
			_BM:						this.props._Blit_Manager,
			pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( this.props._Tilemap_Manager, this.state.cursor_pos ),
			zorder:						zorder.rocks,
			current_milliseconds:		0,
			opacity:					1.0,
			brightness:					1.0,
			horizontally_flipped:		false,
			vertically_flipped:			false,
		})
	}


/*----------------------- core drawing routines -----------------------*/
	start_render_loop = () => {
		if( !this.render_loop_interval ){
			this.render_loop_interval = window.setInterval( this.render_canvas, 16.666 );
		}
	}

	render_canvas = () => {
		Tilemap_Manager_ƒ.do_one_frame_of_rendering( this.props._Tilemap_Manager );
		this.draw_cursor();
	}



	componentDidMount() {
		if(this.props.assets_loaded){
			this.start_render_loop();
		}
	}

	componentDidUpdate() {
		if(this.props.assets_loaded){
			this.start_render_loop();
		}
	}
	
	componentWillUnmount(){
		window.clearInterval(this.render_loop_interval);
		this.render_loop_interval = undefined;
	}

/*----------------------- I/O routines -----------------------*/
	handle_canvas_click = (pos: Point2D, buttons_pressed: MouseButtonState) => {
		Tilemap_Manager_ƒ.modify_tile_status(
			this.props._Tilemap_Manager,
			Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(this.props._Tilemap_Manager, pos),
			this.state.selected_tile_type,
			'terrain'
		);
	}

	handle_canvas_mouse_move = (mouse_pos: Point2D) => {
		this.set_cursor_pos(
			Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(this.props._Tilemap_Manager, mouse_pos)
		);
		
	}

	handle_canvas_keys_down = (keys: Array<string>) => {
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

		Blit_Manager_ƒ.adjust_viewport_pos(this.props._Blit_Manager, move.x, move.y);

	}




	render() {
		return <div className="editor_node">
			
			<Canvas_View
				{...this.props}
				dimensions={this.props.dimensions}
				handle_canvas_click={this.handle_canvas_click}
				handle_canvas_keys_down={this.handle_canvas_keys_down}
				handle_canvas_mouse_move={this.handle_canvas_mouse_move}
			/>
			<div className="tile_palette">
			{
				this.props.assets_loaded
				&&
				Asset_Manager_ƒ.yield_tile_name_list(this.props._Asset_Manager).map( (value, index) => {
					return	<Tile_Palette_Element
								asset_manager={this.props._Asset_Manager}
								tile_name={value}
								asset_name={''}
								key={value}
								highlight={this.state.selected_tile_type == value}
								handle_click={ () => this.setState({selected_tile_type: value}) }
							/>
				})
			}
			</div>
		</div>;
	}

}