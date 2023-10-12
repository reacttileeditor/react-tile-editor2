import React from "react";
import ReactDOM from "react-dom";
import _, { Dictionary, cloneDeep, isArray } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ, ImageListCache } from "./Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "./Blit_Manager";
import * as Utils from "./Utils";
import { ƒ } from "./Utils";


import { TileComparatorSample, TilePositionComparatorSample } from "./Asset_Manager";
import { Point2D, Rectangle, PointCubic } from '../../interfaces';

type tileViewState = {
	tile_maps: TileMaps,
	initialized: boolean,
} & CacheData;

type CacheData = {
	cache_of_tile_comparators: _TileMaps<TileComparatorMap>,
	cache_of_image_lists: {
		[index: string]: ImageListCache
	}
}

type TileComparatorMap = Array<Array<TileComparatorSample|undefined>>;

interface _TileMaps<T> {
	terrain: T,
	ui: T,
}

type TileMaps =  _TileMaps<TileMap>;

type TileMapKeys = keyof TileMaps;

type TileMap = Array<Array<string>>;

export type Direction = 
	'north_east' |
	'east' |
	'south_east' |
	'north_west' |
	'west' |
	'south_west';


const tile_comparator_cache_init = {
	terrain: [[]],
	ui: [[]],
};



export type Tilemap_Manager_Data = {
	state: tileViewState;
	_AM: Asset_Manager_Data;
	_BM: Blit_Manager_Data;
}

export const New_Tilemap_Manager = (p: {
	_AM: Asset_Manager_Data,
	_BM: Blit_Manager_Data,
}): Tilemap_Manager_Data => {
	
	return {
		state: {
			tile_maps: {
				terrain: [['']],
				ui: [['']],
			},
			cache_of_tile_comparators: _.cloneDeep(tile_comparator_cache_init),
			cache_of_image_lists: _.cloneDeep({}),
			initialized: false,
		},
		_AM: p._AM,
		_BM: p._BM,
	}
}


export const Tilemap_Manager_ƒ = {

/*----------------------- initialization and asset loading -----------------------*/

	initialize_tiles: (me: Tilemap_Manager_Data): Tilemap_Manager_Data => {
		let { consts, static_vals } = me._AM;

		const fresh_terrain_tilemap: TileMap = _.range(consts.col_height).map( (row_value, row_index) => {
			return _.range(consts.row_length).map( (col_value, col_index) => {
				return Asset_Manager_ƒ.yield_tile_name_list(me._AM)[
					Utils.dice( _.size( Asset_Manager_ƒ.yield_tile_name_list(me._AM) ) ) -1 
				];
			});
		});


		return {
			...cloneDeep(me),
			state: {
				tile_maps: {
					terrain: fresh_terrain_tilemap,
					ui: Tilemap_Manager_ƒ.create_empty_tile_map(me),
				},
				cache_of_tile_comparators: _.cloneDeep(tile_comparator_cache_init),
				cache_of_image_lists: _.cloneDeep({}),
				initialized: true,
			}
		}
	},

	cleared_cache: () : CacheData => ({
		cache_of_tile_comparators: _.cloneDeep(tile_comparator_cache_init),
		cache_of_image_lists: _.cloneDeep({}),
	}),

/*----------------------- state mutation -----------------------*/
	modify_tile_status: (
		me: Tilemap_Manager_Data,
		pos: Point2D,
		selected_tile_type: string,
		tilemap_name: TileMapKeys,
	): Tilemap_Manager_Data => {

		const new_tilemap_data = cloneDeep(me);
		
		if(
			Tilemap_Manager_ƒ.is_within_map_bounds( me, pos )
		){
			if(selected_tile_type && selected_tile_type != ''){
				new_tilemap_data.state.tile_maps[tilemap_name][pos.y][pos.x] = selected_tile_type;

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

	create_empty_tile_map: (me: Tilemap_Manager_Data): TileMap => {
		let { consts, static_vals } = me._AM;

		return _.range(consts.col_height).map( (row_value, row_index) => {
			return _.range(consts.row_length).map( (col_value, col_index) => {
				return ''
			});
		});
	},

	clear_tile_map: (me: Tilemap_Manager_Data, tilemap_name: TileMapKeys ): Tilemap_Manager_Data => {
		let { consts, static_vals } = me._AM;

		const new_tilemap_data = cloneDeep(me);

		new_tilemap_data.state.tile_maps[tilemap_name] = Tilemap_Manager_ƒ.create_empty_tile_map(me);

		return {
			...new_tilemap_data,
			...Tilemap_Manager_ƒ.cleared_cache(),
		}
	},


/*----------------------- draw ops -----------------------*/

	
	draw_tiles: (me: Tilemap_Manager_Data) => {
		let zorder_list = Asset_Manager_ƒ.yield_full_zorder_list(me._AM);

		zorder_list.map( (value,index) => {
			Tilemap_Manager_ƒ.draw_tiles_for_zorder(me, value);
		})
		
	},

	draw_tiles_for_zorder: (me: Tilemap_Manager_Data, zorder: number) => {

		_.map(me.state.tile_maps as unknown as Dictionary<TileMap>, (tile_map, tilemap_name) => {
			tile_map.map( (row_value, row_index) => {
				row_value.map( (tile_name, col_index) => {

					let pos = {x: col_index, y: row_index};
					

					Tilemap_Manager_ƒ.draw_tile_at_coords(
												me,
												pos,
												tile_name,
												zorder,
												tilemap_name as unknown as TileMapKeys
											);
				});
			});

			me._AM.TileRNG.reset();
		});
	},

	
	draw_tile_at_coords: ( me: Tilemap_Manager_Data, pos: Point2D, tile_name: string, zorder: number, tilemap_name: TileMapKeys) => {
		let { consts } = me._AM;

		/*
			This is the special bit of logic which makes the different rows (since we're hex tiles) be offset from each other by "half" a tile.
		*/
		let universal_hex_offset = Utils.modulo(pos.y, 2) == 1 ? Math.floor(consts.tile_width / 2) : 0;
		let real_pos: Point2D = {
			x: (pos.x + 0) * consts.tile_width + universal_hex_offset,
			y: (pos.y + 0) * consts.tile_height
		};


		const cache_hash = `${pos.x}_${pos.y}_${tile_name}_${zorder}}`;
		const cached_value = me.state.cache_of_image_lists[cache_hash];

		const image_list: ImageListCache = ƒ.if( cached_value != undefined,
			cached_value,
			Asset_Manager_ƒ.get_images_for_tile_type_at_zorder_and_pos({
				_AM: me._AM,
				_BM: me._BM,
				zorder: zorder,
				pos: real_pos,
				tile_name: tile_name,
				comparator: Tilemap_Manager_ƒ.get_tile_comparator_sample_for_pos(me, pos, tilemap_name),
			})
		);

		if( !cached_value ){
			me.state.cache_of_image_lists[cache_hash] = image_list;
		}

		Asset_Manager_ƒ.draw_images_at_zorder_and_pos({
			_AM: me._AM,
			_BM: me._BM,
			zorder: zorder,
			pos: real_pos,
			image_list: image_list,
			current_milliseconds: ticks_to_ms(me._BM.time_tracker.current_tick)
		})			
	},

	
	do_one_frame_of_rendering: (me: Tilemap_Manager_Data) => {
		if(me.state.initialized){
			Blit_Manager_ƒ.fill_canvas_with_solid_color(me._BM);
			Tilemap_Manager_ƒ.draw_tiles(me);
			Blit_Manager_ƒ.draw_entire_frame(me._BM);
		} else {
			Tilemap_Manager_ƒ.initialize_tiles(me);
		}
	},
	
	
/*----------------------- info ops -----------------------*/
	is_within_map_bounds: (me: Tilemap_Manager_Data, pos: Point2D ): boolean => (
		pos.x >= 0 &&
		pos.y >= 0 && 
		pos.x < me._AM.consts.row_length &&
		pos.y < me._AM.consts.col_height 
	),



	get_tile_comparator_sample_for_pos: ( me: Tilemap_Manager_Data, pos: Point2D, tilemap_name: TileMapKeys ): TileComparatorSample => {
		const cached_value = me.state.cache_of_tile_comparators[tilemap_name]?.[pos.y]?.[pos.x];

		if( cached_value != undefined ){
			return cached_value;
		} else {
			const tpc = Tilemap_Manager_ƒ.get_tile_position_comparator_for_pos(me, pos);
			
			const val = _.map(tpc, (row_val, row_idx) => {
				return _.map(row_val, (col_val, col_idx) => {
					return Tilemap_Manager_ƒ.get_tile_name_for_pos( me, col_val, tilemap_name )
				})
			});
			
			//some funny-business to cache it:
			if( !isArray(me.state.cache_of_tile_comparators[tilemap_name][pos.y]) ){
				me.state.cache_of_tile_comparators[tilemap_name][pos.y] = [];
				me.state.cache_of_tile_comparators[tilemap_name][pos.y][pos.x] = (val as TileComparatorSample);
			} else {
				me.state.cache_of_tile_comparators[tilemap_name][pos.y][pos.x] = (val as TileComparatorSample);
			}

			return (val as TileComparatorSample); //casting this because Typescript is being extra insistent that the tuple lengths match, but we can't guarantee this without dramatically complicating our code in a particularly bad way.
			//https://github.com/microsoft/TypeScript/issues/11312
		}
	},
	
	get_tile_position_comparator_for_pos: ( me: Tilemap_Manager_Data, pos: Point2D ): TilePositionComparatorSample => {
		/*
			This would simply grab all 8 adjacent tiles (and ourselves, for a total of 9 tiles) as a square sample.  The problem here is that, although our tiles are in fact stored as "square" data in an array, we're actually a hex grid.  Because we're a hex grid, we're actually just looking for 7 tiles, so we'll need to adjust the result.  Depending on whether we're on an even or odd row, we need to lop off the first (or last) member of the first and last rows. 	
		*/
	
		return _.range(pos.y - 1, pos.y + 2).map( (row_value, row_index) => {
			let horizontal_tile_indices =	row_index == 1
											?
											_.range(pos.x - 1, pos.x + 2)
											:
											(	
												Utils.is_even( pos.y )
												?
												_.range(pos.x - 1, pos.x + 1)
												:
												_.range(pos.x - 0, pos.x + 2)
											);
			
			return horizontal_tile_indices.map( (col_value: number, col_index: number) => {
				return {x: col_value, y: row_value};
			});
		}) as TilePositionComparatorSample;
	},
	
	get_tile_name_for_pos: ( me: Tilemap_Manager_Data, pos: Point2D, tilemap_name: TileMapKeys ) => {
		/*
			This enforces "safe access", and will always return a string.  If it's outside the bounds of the tile map, we return an empty string.
		*/
		if(
			pos.y > (_.size(me.state.tile_maps[tilemap_name]) - 1) ||
			pos.y < 0 ||
			pos.x > (_.size(me.state.tile_maps[tilemap_name][pos.y]) - 1) ||
			pos.x < 0
		){
			return '';
		} else {
			return me.state.tile_maps[tilemap_name][pos.y][pos.x];
		}
	},
	


	convert_pixel_coords_to_tile_coords: ( me: Tilemap_Manager_Data, pos: Point2D) => {
		let { consts } = me._AM;
		let position = Blit_Manager_ƒ.yield_world_coords_for_absolute_coords(me._BM, {x: pos.x, y: pos.y});

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
	
	convert_tile_coords_to_pixel_coords: (me: Tilemap_Manager_Data, pos : Point2D) => ({
		x:	pos.x * me._AM.consts.tile_width +
			(( Utils.modulo(pos.y, 2) == 1) ? Math.floor(me._AM.consts.tile_width / 2) : 0),
		y:	pos.y * me._AM.consts.tile_height
	}),




	
/*----------------------- distance calculations -----------------------*/
	/*
		based on https://www.redblobgames.com/grids/hexagons/
		
		Our tile system, in this page's lingo, is "pointy topped" and "odd-r" (shoves odd rows by +1/2 tile to the right).
	*/

	cubic_to_cartesian: ( cubeCoords: PointCubic): Point2D => ({
		x: cubeCoords.q + (cubeCoords.r + (cubeCoords.r & 1)) / 2,
		y: cubeCoords.r,
	}),

	cartesian_to_cubic: ( cartCoords: Point2D ): PointCubic => {
		const q = cartCoords.x - (cartCoords.y + (cartCoords.y & 1)) / 2;
		const r = cartCoords.y;
		
		return {
			q: q,
			r: r,
			s: (-q - r),
		}
	},

	cubic_subtraction: ( a: PointCubic, b: PointCubic ): PointCubic => ({
		q: a.q - b.q,
		r: a.r - b.r,
		s: a.s - b.s,
	}),

	cubic_distance: ( a: PointCubic, b: PointCubic ): Number => {
		const vector = Tilemap_Manager_ƒ.cubic_subtraction(a, b);

		return Math.max( Math.abs(vector.q), Math.abs(vector.r), Math.abs(vector.s));
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