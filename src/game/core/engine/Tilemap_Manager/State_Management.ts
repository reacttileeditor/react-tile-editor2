import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";
import _, { Dictionary, cloneDeep, isArray, isEmpty, isEqual, map, range, size } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ, Image_List_Cache } from "../Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "../Blit_Manager";
import * as Utils from "../Utils";
import { is_all_true, ƒ } from "../Utils";


import { Tile_Comparator_Sample, Tile_Position_Comparator_Sample } from "../Asset_Manager/Asset_Manager";
import { Point2D, Rectangle, PointCubic } from '../../../interfaces';
import localforage from "localforage";
import { concat, equals, filter, find, includes, keys, propEq, reduce, slice, uniq } from "ramda";
import { Page } from '@rsuite/icons';
import { Vals } from "../../constants/Constants";
import { Creature_Map_Instance, Game_Manager_ƒ } from "../Game_Manager";
import { Creature_ƒ } from "../../../objects_core/Creature";
import { zorder } from "../../constants/zorder";

import * as builtin_levels from "../../../levels";
import { Map_Generation_ƒ } from "../Map_Generation";
import { boolean } from "yargs";
import { MTP_Anchor_Data } from "../../data/Multi_Tile_Patterns";
import { Asset_Blit_Tilemap, Cache_Data, Direction, Tilemap_Single, Tilemap_Manager_Data, Tilemap_Manager_ƒ, Tilemap_Keys, Tilemap_Persist_Data, Tilemaps } from "./Tilemap_Manager";



export const Tilemap_Manager_ƒ_State_Management = {



/*----------------------- state mutation -----------------------*/
	modify_tile_status: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		pos: Point2D,
		selected_tile_type: string,
		tilemap_name: Tilemap_Keys,
	): Tilemap_Manager_Data => {

		const new_tilemap_data = cloneDeep(me);
		
		if(
			Tilemap_Manager_ƒ.is_within_map_bounds( me, pos )
		){
			if(selected_tile_type && selected_tile_type != ''){
				new_tilemap_data.tile_maps[tilemap_name][pos.y][pos.x] = selected_tile_type;

				return {
					...new_tilemap_data,
					...Tilemap_Manager_ƒ.cleared_cache(),
				}
			}
		}

		return {
			...new_tilemap_data,
		}

	},

	set_tile_asset_cache: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		new_cache: Asset_Blit_Tilemap,
	): Tilemap_Manager_Data => {
		const new_tilemap_data = cloneDeep(me);

		return {
			...new_tilemap_data,
			asset_blit_list_cache: new_cache,
		}
	},

	


	create_empty_tile_map: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data): Tilemap_Single => {
		const map_size = Tilemap_Manager_ƒ.get_map_bounds(me);


		return _.range(map_size.h).map( (row_value, row_index) => {
			return _.range(map_size.w).map( (col_value, col_index) => {
				return ''
			});
		});
	},

	clear_tile_map: (me: Tilemap_Manager_Data, tilemap_name: Tilemap_Keys, _AM: Asset_Manager_Data ): Tilemap_Manager_Data => {
		let { consts, static_vals } = _AM;

		const new_tilemap_data = cloneDeep(me);

		new_tilemap_data.tile_maps[tilemap_name] = Tilemap_Manager_ƒ.create_empty_tile_map(me, _AM);

		return {
			...new_tilemap_data,
			...Tilemap_Manager_ƒ.cleared_cache(),
		}
	},

	expand_tile_map: (
		me: Tilemap_Manager_Data,
		bounds: {
			grow_x: number,
			grow_y: number,
			grow_x2: number,
			grow_y2: number,
		} ): Tilemap_Manager_Data => {

		/*
			We're going to treat all positive grow values as expansion, to make the math simpler.  This means grow_x being, say `2` will indeed expand the map by one tile in the negative direction.
		*/

		//const new_tilemaps: Tilemaps = map(me.tile_maps, (tilemap_val) =>(
		const expand_tilemap = ( tilemap_val: Tilemap_Single ): Tilemap_Single => (
				/*
					Build a new map.  To spare a wall of if conditions, we'll always concat two arrays on each side (top and bottom, here).  If we're shrinking the map in the middle, we'll just made the additive arrays on the side, empty.  Likewise, we'll always slice the array in the middle, but if it turns out we're growing it, the slice will just be an identity operation. 

					This code just below pads out new, empty rows if we need them.
				*/

				concat(
					concat(
						map( range( Math.max(0, bounds.grow_y) ), ()=>( new_row(tilemap_val) ) ),
						slice(
							Math.abs(Math.min( bounds.grow_y, 0)),
							tilemap_val.length + Math.min( bounds.grow_y2, 0),				
							map(tilemap_val, (row_val)=>(
								expand_row(row_val)
							))
						)
					),
					map( range( Math.max(0, bounds.grow_y2) ), ()=>( new_row(tilemap_val) ) ),
				)
		);
		
		const new_row = ( tilemap_val: Tilemap_Single ): Array<string> => (
			map( range( bounds.grow_x + bounds.grow_x2 + size(tilemap_val[0]) ), ()=>(''))
		)

		const expand_row = (row_val: Array<string>): Array<string> => (
			/*
				The following code expands rows if they're too short.
			*/
			concat(
				concat(
					map( range( Math.max(0, bounds.grow_x) ), ()=>('') ),
					slice(
						Math.abs(Math.min( bounds.grow_x, 0)),
						row_val.length + Math.min( bounds.grow_x2, 0),
						row_val
					)
				),
				map( range( Math.max(0, bounds.grow_x2) ), ()=>('') ),
			)
		);


		const new_tilemaps: Tilemaps = {
			terrain: expand_tilemap(me.tile_maps['terrain']),
			ui: expand_tilemap(me.tile_maps['ui']),
		}

		return {
			...me,
			tile_maps: _.cloneDeep(new_tilemaps)
		}
	},
/*----------------------- creature modification -----------------------*/

	add_creature_at_pos: (me: Tilemap_Manager_Data, creature: Creature_Map_Instance): Tilemap_Manager_Data => {
		const creature_list_with_tile_cleared = filter( (val)=> ( !isEqual(val.pos, creature.pos) ), me.creature_list)

		const new_creature_list = concat( creature_list_with_tile_cleared, [creature]);

		return {
			...me,
			creature_list: cloneDeep(new_creature_list)
		};
	},

	remove_creature_at_pos: (me: Tilemap_Manager_Data, pos: Point2D): Tilemap_Manager_Data => {
		const creature_list_with_tile_cleared = filter( (val)=> ( !isEqual(val.pos, pos) ), me.creature_list)


		return {
			...me,
			creature_list: cloneDeep(creature_list_with_tile_cleared)
		};
	},

	

	
/*----------------------- info ops -----------------------*/
	is_within_map_bounds: (me: Tilemap_Manager_Data, pos: Point2D ): boolean => {
		const bounds = Tilemap_Manager_ƒ.get_map_bounds(me);

		return (
			pos.x >= bounds.x &&
			pos.y >= bounds.y && 
			pos.x < bounds.w &&
			pos.y < bounds.h 
		)
	},

	get_map_bounds: (me: Tilemap_Manager_Data): Rectangle => (
		isEmpty(me.tile_maps['terrain'][0])
		?
		{
			x: 0,
			y: 0,
			w: Vals.default_map_dimensions.x,
			h: Vals.default_map_dimensions.y,
		}		
		:
		{
			x: 0,
			y: 0,
			w: me.tile_maps['terrain'][0].length,
			h: me.tile_maps['terrain'].length,
		}
	),

	
	get_tile_name_for_pos: ( me: Tilemap_Manager_Data, pos: Point2D, tilemap_name: Tilemap_Keys ) => {
		/*
			This enforces "safe access", and will always return a string.  If it's outside the bounds of the tile map, we return an empty string.
		*/
		if(
			pos.y > (_.size(me.tile_maps[tilemap_name]) - 1) ||
			pos.y < 0 ||
			pos.x > (_.size(me.tile_maps[tilemap_name][pos.y]) - 1) ||
			pos.x < 0
		){
			return '';
		} else {
			return me.tile_maps[tilemap_name][pos.y][pos.x];
		}
	},
	


	convert_pixel_coords_to_tile_coords: ( me: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, pos: Point2D) => {
		let { consts } = _AM;
		let position = Blit_Manager_ƒ.yield_world_coords_for_absolute_coords(_BM, {x: pos.x, y: pos.y});

		let odd_row_offset = Utils.modulo(
			Math.floor((
				position.y +
				Math.floor(consts.tile_height / 2)
			) / consts.tile_height),
		2) == 1;

		let tile_coords_revised = {
			x:	Math.floor(
					(
						position.x +
						ƒ.if(odd_row_offset,
							Math.floor(-consts.tile_width / 2),
							0,
						) +
						Math.floor(consts.tile_width / 2)
					) / consts.tile_width 
				),
			y: Math.floor(
					(
						position.y +
						Math.floor(consts.tile_height / 2)
					)  / consts.tile_height 
				),
		};
		
		return tile_coords_revised;
	},
	
	convert_tile_coords_to_pixel_coords: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data, pos : Point2D) => ({
		x:	pos.x * _AM.consts.tile_width +
			(( Utils.modulo(pos.y, 2) == 1) ? Math.floor(_AM.consts.tile_width / 2) : 0),
		y:	pos.y * _AM.consts.tile_height
	}),




	
/*----------------------- distance calculations -----------------------*/
	/*
		based on https://www.redblobgames.com/grids/hexagons/
		
		Our tile system, in this page's lingo, is "pointy topped" and "odd-r" (shoves odd rows by +1/2 tile to the right).
	*/

	cubic_to_cartesian: ( cubeCoords: PointCubic): Point2D => ({
		x: cubeCoords.q + (cubeCoords.r - (cubeCoords.r & 1)) / 2,
		y: cubeCoords.r,
	}),

	cartesian_to_cubic: ( cartCoords: Point2D ): PointCubic => {
		const q = cartCoords.x - (cartCoords.y - (cartCoords.y & 1)) / 2;
		const r = cartCoords.y;
		
		return {
			q: q,
			r: r,
			s: (-q - r),
		}
	},

	cubic_addition: ( a: PointCubic, b: PointCubic ): PointCubic => ({
		q: a.q + b.q,
		r: a.r + b.r,
		s: a.s + b.s,
	}),

	cubic_subtraction: ( a: PointCubic, b: PointCubic ): PointCubic => ({
		q: a.q - b.q,
		r: a.r - b.r,
		s: a.s - b.s,
	}),

	cubic_distance: ( a: PointCubic, b: PointCubic ): Number => {
		const vector = Tilemap_Manager_ƒ.cubic_subtraction(a, b);

		return Math.max( Math.abs(vector.q), Math.abs(vector.r), Math.abs(vector.s));
	},

	cubic_direction_as_normalized_vector: (direction: Direction): PointCubic => {
		return {
			'east':			{q: 1, r: 0, s:-1},
			'north_east':	{q: 1, r:-1, s: 0},
			'north_west':	{q: 0, r:-1, s: 1},
			'south_east':	{q: 0, r: 1, s:-1},
			'south_west':	{q:-1, r: 1, s: 0},
			'west':			{q:-1, r: 0, s: 1},
		}[direction] as PointCubic;
	},

	cubic_direction: ( a: PointCubic, b: PointCubic ): Direction => {
		const vector = Tilemap_Manager_ƒ.cubic_subtraction(a, b);

		/*
			All cubic directions can be expressed as a "sign" of the 3 components; this curiously will "round" them to the nearest "whole tile" direction; if we wanted subtler directions, we'd want to not apply Math.sign() here, but we're doing this primarily to yield animation directions, so that's ideal for our use-case. 
		*/
		const vector_to_string = `${Math.sign(vector.q)}${Math.sign(vector.r)}${Math.sign(vector.s)}`;
		debugger;

		return {
			'10-1': 'east',
			'1-10': 'north_east',
			'0-11': 'north_west',
			'01-1': 'south_east',
			'-110': 'south_west',
			'-101': 'west',
		}[vector_to_string] as Direction;
	},

	get_tile_coord_distance_between: ( startPos: Point2D, endPos: Point2D ) => Number (
		Tilemap_Manager_ƒ.cubic_distance( Tilemap_Manager_ƒ.cartesian_to_cubic(startPos), Tilemap_Manager_ƒ.cartesian_to_cubic(endPos) )
	),

	get_adjacent_tile_in_direction: ( startPos: Point2D, direction: Direction ): Point2D =>  {
		return Tilemap_Manager_ƒ.cubic_to_cartesian(
			Tilemap_Manager_ƒ.cubic_addition(
				Tilemap_Manager_ƒ.cartesian_to_cubic(startPos),
				Tilemap_Manager_ƒ.cubic_direction_as_normalized_vector(direction)
			)
		);
	},

/*----------------------- direction handling -----------------------*/
	extract_direction_from_map_vectorCubic: (start_pos: Point2D, end_pos: Point2D):Direction => {
		return Tilemap_Manager_ƒ.cubic_direction(
			Tilemap_Manager_ƒ.cartesian_to_cubic(start_pos),
			Tilemap_Manager_ƒ.cartesian_to_cubic(end_pos)
		);
	},

	extract_direction_from_map_vector: (start_pos: Point2D, end_pos: Point2D):Direction => {
		if( start_pos.y == end_pos.y ){
			if(start_pos.x < end_pos.x){
				return 'east';
			} else {
				return 'west';
			}
		} else if( start_pos.y >= end_pos.y  ){
			if(start_pos.x < end_pos.x){
				return 'north_east';
			} else {
				return 'north_west';
			}
		} else {
			if(start_pos.x < end_pos.x){
				return 'south_east';
			} else {
				return 'south_west';
			}
		}
	}
}