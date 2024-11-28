import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import _, { isNil, isString, toNumber } from "lodash";

import { Canvas_View, MouseButtonState } from "./Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Tilemap_Metadata, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';

import { equals } from "ramda";
import { Vals } from "../constants/Constants";




export const Standard_Input_ƒ = {
	handle_canvas_mouse_move: (
		pos: Point2D,
		buttons_pressed: MouseButtonState,
		_TM: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		set_cursor_pos: Dispatch<SetStateAction<Point2D>>,
		set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
		handle_canvas_click: (pos: Point2D, buttons_pressed: MouseButtonState) => void,
	) => {
		const new_tile_pos = Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, pos)

		//console.log(`pos ${pos.x},${pos.y} | ${new_tile_pos.x},${new_tile_pos.y}`)

		set_cursor_pos(
			new_tile_pos
		);

		if( buttons_pressed.left == true ){
			handle_canvas_click(pos, buttons_pressed);
		}
		
		let move = { x: 0, y: 0};
		const move_trigger_buffer_size = 20;

		if( pos.y >= Vals.default_canvas_size.y - move_trigger_buffer_size ){
			move.y -= 1;
		}

		if( pos.y <=  move_trigger_buffer_size ){
			move.y += 1;
		}

		if( pos.x >= Vals.default_canvas_size.x - move_trigger_buffer_size ){
			move.x -= 1;
		}

		if( pos.x <=  move_trigger_buffer_size ){
			move.x += 1;
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




