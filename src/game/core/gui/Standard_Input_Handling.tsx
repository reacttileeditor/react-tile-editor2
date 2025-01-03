import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import _, { isNil, isString, toNumber } from "lodash";

import { Canvas_View, Mouse_Button_State } from "./Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Tilemap_Metadata, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';

import { equals } from "ramda";
import { Vals } from "../constants/Constants";
import { ƒ } from "../engine/Utils";




export const Standard_Input_ƒ = {
	handle_canvas_mouse_move: (
		pos: Point2D,
		buttons_pressed: Mouse_Button_State,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		set_screen_pixel_cursor_pos: Dispatch<SetStateAction<Point2D>>,
		set_tile_cursor_pos: Dispatch<SetStateAction<Point2D>>,
		set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
		handle_canvas_click: (pos: Point2D, buttons_pressed: Mouse_Button_State) => void,
	) => {
		const new_tile_pos = Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, pos)

		set_screen_pixel_cursor_pos(
			pos
		);

		set_tile_cursor_pos(
			new_tile_pos
		);

		if( buttons_pressed.left == true ){
			handle_canvas_click(pos, buttons_pressed);
		}
		
		//Standard_Input_ƒ.move_viewport_based_on_mouse_position(pos, _BM, set_Blit_Manager);
	},


	move_viewport_based_on_mouse_position: (
		pos: Point2D,
		_BM: Blit_Manager_Data,
		set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
	) => {
		let move = { x: 0, y: 0};
		let depth = 0;
		const move_trigger_buffer_size = 40;

		const scale_movement_depth = (val: number):number  => (
			Math.round( ƒ.dump((val / move_trigger_buffer_size) * 4.0)) 
		);
	

		if( pos.y >= Vals.default_canvas_size.y - move_trigger_buffer_size ){
			move.y -= scale_movement_depth(Math.max( 0, pos.y - (Vals.default_canvas_size.y - move_trigger_buffer_size) ));
		}

		if( pos.y <=  move_trigger_buffer_size ){
			move.y += scale_movement_depth(Math.max( 0, move_trigger_buffer_size - pos.y));
		}

		if( pos.x >= Vals.default_canvas_size.x - move_trigger_buffer_size ){
			move.x -= scale_movement_depth(Math.max( 0, pos.x - (Vals.default_canvas_size.x - move_trigger_buffer_size) ));
		}

		if( pos.x <=  move_trigger_buffer_size ){

			move.x += scale_movement_depth(Math.max( 0, move_trigger_buffer_size - pos.x));
		}


		if( !equals(move, {x: 0, y: 0}) ){
			set_Blit_Manager(
				Blit_Manager_ƒ.adjust_viewport_pos(_BM, move.x, move.y)
			)
		}
	},


	handle_canvas_keys_down: (
		keys: Array<string>,
		_BM: Blit_Manager_Data,
		set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
	) => {
		let move = { x: 0, y: 0};

		if( _.includes(keys, 'ArrowDown') ){
			move.y -= 40;
		}

		if( _.includes(keys, 'ArrowUp') ){
			move.y += 40;
		}

		if( _.includes(keys, 'ArrowLeft') ){
			move.x += 40;
		}

		if( _.includes(keys, 'ArrowRight') ){
			move.x -= 40;
		}

		set_Blit_Manager(
			Blit_Manager_ƒ.adjust_viewport_pos(_BM, move.x, move.y)
		)
	}
}




