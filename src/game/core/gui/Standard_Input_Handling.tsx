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
import { is_within_rectangle, ƒ } from "../engine/Utils";




export const Standard_Input_ƒ = {
	handle_canvas_mouse_move: (
		pos: Point2D,
		buttons_pressed: Mouse_Button_State,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		update_mouse_pos: (pos: Point2D) => void,
		set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
		handle_canvas_click: (pos: Point2D, buttons_pressed: Mouse_Button_State) => void,
	) => {
		update_mouse_pos(pos);

		if( buttons_pressed.left == true ){
			handle_canvas_click(pos, buttons_pressed);
		}
	},


	move_viewport_based_on_mouse_position: (
		pos: Point2D,
		_BM: Blit_Manager_Data,
		set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
	) => {
		let move = { x: 0, y: 0};
		let depth = 0;
		const move_trigger_buffer_size = 50;


		//calculate the map bounds, so that if we're sufficiently past them, we can choose not to scroll.
		const map_bounds = Tilemap_Manager_ƒ.get_map_bounds(_TM);
		const map_bounds_in_pixels = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, _AM, { x: map_bounds.w, y: map_bounds.h});

		const map_bound_rectangle = {
			x: 70,
			y: 70,
			w: -(map_bounds_in_pixels.x - Vals.default_canvas_rect.w + 70),
			h: -(map_bounds_in_pixels.y - Vals.default_canvas_rect.h + 70),
		}

		const viewport_pos = _BM.state.intended_viewport_offset;


		// Set up a scaling function to control acceleration globally, and give more acceleration as you closer to the edge of the screen.
		const scale_movement_depth = (val: number):number  => (
			Math.round( (val / move_trigger_buffer_size) * 2.0) 
		);
	
		if( is_within_rectangle(pos, Vals.default_canvas_rect) ) {

			if( pos.x <=  move_trigger_buffer_size ){
				if((viewport_pos.x < map_bound_rectangle.x)){
					move.x += scale_movement_depth(Math.max( 0, move_trigger_buffer_size - pos.x));
				}
			}

			if( pos.y <=  move_trigger_buffer_size ){
				if((viewport_pos.y < map_bound_rectangle.y)){
					move.y += scale_movement_depth(Math.max( 0, move_trigger_buffer_size - pos.y));
				}
			}

			if( pos.x >= Vals.default_canvas_size.x - move_trigger_buffer_size ){
				if((viewport_pos.x > map_bound_rectangle.w)){
					move.x -= scale_movement_depth(Math.max( 0, pos.x - (Vals.default_canvas_size.x - move_trigger_buffer_size) ));
				}
			}

			if( pos.y >= Vals.default_canvas_size.y - move_trigger_buffer_size ){
				if((viewport_pos.y > map_bound_rectangle.h)){
					move.y -= scale_movement_depth(Math.max( 0, pos.y - (Vals.default_canvas_size.y - move_trigger_buffer_size) ));
				}
			}

		}



			

		if( !equals(move, {x: 0, y: 0}) ){
			set_Blit_Manager(
				Blit_Manager_ƒ.add_viewport_velocity(_BM, move.x, move.y)
			)
		}
	},


	handle_canvas_keys_down: (
		keys: Array<string>,
		_BM: Blit_Manager_Data,
		set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
	) => {
		let move = { x: 0, y: 0};

		const magnitude = 8;

		//calculate the map bounds, so that if we're sufficiently past them, we can choose not to scroll.
		const map_bounds = Tilemap_Manager_ƒ.get_map_bounds(_TM);
		const map_bounds_in_pixels = Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(_TM, _AM, { x: map_bounds.w, y: map_bounds.h});

		const map_bound_rectangle = {
			x: 70,
			y: 70,
			w: -(map_bounds_in_pixels.x - Vals.default_canvas_rect.w + 70),
			h: -(map_bounds_in_pixels.y - Vals.default_canvas_rect.h + 70),
		}

		const viewport_pos = _BM.state.intended_viewport_offset;





		if( _.includes(keys, 'ArrowLeft') ){
			if((viewport_pos.x < map_bound_rectangle.x)){
				move.x +=  1 * magnitude;
			}
		}

		if( _.includes(keys, 'ArrowUp') ){
			if((viewport_pos.y < map_bound_rectangle.y)){
				move.y +=  1 * magnitude;
			}
		}

		if( _.includes(keys, 'ArrowRight') ){
			if((viewport_pos.x > map_bound_rectangle.w)){
				move.x -=  1 * magnitude;
			}
		}

		if( _.includes(keys, 'ArrowDown') ){
			if((viewport_pos.y > map_bound_rectangle.h)){
				move.y -= 1 * magnitude;
			}
		}


		set_Blit_Manager(
			Blit_Manager_ƒ.add_viewport_velocity(_BM, move.x, move.y)
		)
	}
}




