import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";
import _, { Dictionary, cloneDeep, isArray, map, range, size } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ, ImageListCache } from "./Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "./Blit_Manager";
import * as Utils from "./Utils";
import { ƒ } from "./Utils";


import { TileComparatorSample, TilePositionComparatorSample } from "./Asset_Manager";
import { Point2D, Rectangle, PointCubic } from '../../interfaces';
import localforage from "localforage";
import { concat, filter, slice, uniq } from "ramda";
import { Page } from '@rsuite/icons';

type TileViewState = {
	level_name: string,
	metadata: MetaData,
	tile_maps: TileMaps,
	initialized: boolean,
} & CacheData;

type CacheData = {
	cache_of_tile_comparators: _TileMaps<TileComparatorMap>,
	cache_of_image_lists: {
		[index: string]: ImageListCache
	}
}

type PersistData = {
	tile_maps: TileMaps,
	metadata: MetaData,
};

export type SizeMetaData = {
	row_length: number,
	col_height: number,
	origin: Point2D,
};

export type MetaData = SizeMetaData;

const metadata_init = {
	row_length: 14,
	col_height: 20,
	origin: {
		x: 0,
		y: 0,
	}
};

type TileComparatorMap = Array<Array<TileComparatorSample|undefined>>;

interface _TileMaps<T> {
	terrain: T,
	ui: T,
}

type TileMaps =  _TileMaps<TileMap>;

type TileMapKeys = keyof TileMaps;

export type TileMap = Array<Array<string>>;

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



export type Tilemap_Manager_Data = TileViewState & CacheData;


export const New_Tilemap_Manager = (): Tilemap_Manager_Data => {
	
	return {
		level_name: '',
		metadata: _.cloneDeep(metadata_init),
		tile_maps: {
			terrain: [['']],
			ui: [['']],
		},
		cache_of_tile_comparators: _.cloneDeep(tile_comparator_cache_init),
		cache_of_image_lists: _.cloneDeep({}),
		initialized: false,
	}
}


export const Tilemap_Manager_ƒ = {

/*----------------------- initialization and asset loading -----------------------*/

	initialize_tiles: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data): Tilemap_Manager_Data => {

		const fresh_terrain_tilemap: TileMap = _.range(me.metadata.col_height).map( (row_value, row_index) => {
			return _.range(me.metadata.row_length).map( (col_value, col_index) => {
				return Asset_Manager_ƒ.yield_tile_name_list(_AM)[
					Utils.dice( _.size( Asset_Manager_ƒ.yield_tile_name_list(_AM) ) ) -1 
				];
			});
		});


		return {
			level_name: me.level_name,
			metadata: _.cloneDeep(me.metadata),
			tile_maps: {
				terrain: fresh_terrain_tilemap,
				ui: Tilemap_Manager_ƒ.create_empty_tile_map(me, _AM),
			},
			cache_of_tile_comparators: _.cloneDeep(tile_comparator_cache_init),
			cache_of_image_lists: _.cloneDeep({}),
			initialized: true,
		}
	},

	cleared_cache: () : CacheData => ({
		cache_of_tile_comparators: _.cloneDeep(tile_comparator_cache_init),
		cache_of_image_lists: _.cloneDeep({}),
	}),

/*----------------------- file writing -----------------------*/
	load_level: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
		level_name: string,
	): void => {
		let level_data: PersistData = {
			metadata: _.cloneDeep(metadata_init),
			tile_maps: {
				terrain: [['']],
				ui: [['']],
			},
		};

		localforage.getItem<PersistData>(level_name).then((value) => {
			if(value != null){
				level_data = value;
			}

			set_Tilemap_Manager( {
				level_name: level_name,
				metadata: _.cloneDeep(level_data.metadata),
				tile_maps: _.cloneDeep(level_data.tile_maps),
				cache_of_tile_comparators: _.cloneDeep(tile_comparator_cache_init),
				cache_of_image_lists: _.cloneDeep({}),
				initialized: true,
			})
		}).catch((value) => {
			throw("couldn't load level")
			set_Tilemap_Manager(me);			
		});
	},

	save_level: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
		level_name: string,
		level_name_list: Array<string>
	): void => {
		if(level_name == 'level_names'){
			throw("if you're reading this, we should put in validation on the input field.")
		} else {
			const save_data: PersistData = {
				metadata: me.metadata,
				tile_maps: me.tile_maps,
			}

			localforage.setItem(level_name, save_data);
			localforage.setItem("level_names", uniq(concat(level_name_list, [level_name])));
			set_Tilemap_Manager( {
				...me,
				level_name: level_name,
			})
		}
	},

	load_levelname_list: (
		set_level_filename_list: Dispatch<SetStateAction<Array<string>>>,
	): void => {
		localforage.getItem<Array<string>>('level_names').then((value) => {
			if(value != null){
				set_level_filename_list(value);
			}
		
		}).catch((value) => {
			throw("couldn't load level list")
		});
	},

	delete_level: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
		level_name: string,
		level_name_list: Array<string>
	): void => {
		if(level_name == 'level_names'){
			throw("if you're reading this, we should put in validation on the input field.")
		} else {
			localforage.setItem(level_name, null);
			localforage.setItem("level_names", uniq(filter((val)=>(val != level_name),level_name_list)));
		}
	},

	set_metadata: (me: Tilemap_Manager_Data, new_metadata: MetaData): Tilemap_Manager_Data => {
		/*
			TODO: we really ought to be doing something sophisticated here, but I'd like to pivot to having these map operations be totally non-destructive to your tiles.  I.e. all out-of-bounds tiles are preserved, the map is stored sparsely, etc, etc.   It's a tall ask, and probably something for an alternate git branch.

			So right now we're doing the most violent ape shit of just setting the values, and declaring "fuck it lmao" as to the consequences, in the finest traditions of Undefined Behavior.

			It's not useless; when we "handle the change gracefully", these set-variable parts will carry over unchanged, I'm just skipping an implementation of a far less graceful change to map boundaries.
		*/

		return {
			...me,
			metadata: _.cloneDeep(new_metadata),
		}
	},


/*----------------------- state mutation -----------------------*/
	modify_tile_status: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		pos: Point2D,
		selected_tile_type: string,
		tilemap_name: TileMapKeys,
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

	create_empty_tile_map: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data): TileMap => {
		return _.range(me.metadata.col_height).map( (row_value, row_index) => {
			return _.range(me.metadata.row_length).map( (col_value, col_index) => {
				return ''
			});
		});
	},

	clear_tile_map: (me: Tilemap_Manager_Data, tilemap_name: TileMapKeys, _AM: Asset_Manager_Data ): Tilemap_Manager_Data => {
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

		//const new_tilemaps: TileMaps = map(me.tile_maps, (tilemap_val) =>(
		const expand_tilemap = ( tilemap_val: TileMap ): TileMap => (
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
		
		const new_row = ( tilemap_val: TileMap ): Array<string> => (
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


		const new_tilemaps: TileMaps = {
			terrain: expand_tilemap(me.tile_maps['terrain']),
			ui: expand_tilemap(me.tile_maps['ui']),
		}

		return {
			...me,
			tile_maps: _.cloneDeep(new_tilemaps)
		}
	},

/*----------------------- draw ops -----------------------*/

	
	draw_tiles: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data) => {
		let zorder_list = Asset_Manager_ƒ.yield_full_zorder_list(_AM);

		zorder_list.map( (value,index) => {
			Tilemap_Manager_ƒ.draw_tiles_for_zorder(me, _AM, _BM, value);
		})
		
	},

	draw_tiles_for_zorder: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, zorder: number) => {

		_.map(me.tile_maps as unknown as Dictionary<TileMap>, (tile_map, tilemap_name) => {
			tile_map.map( (row_value, row_index) => {
				row_value.map( (tile_name, col_index) => {

					let pos = {x: col_index, y: row_index};
					

					Tilemap_Manager_ƒ.draw_tile_at_coords(
						me,
						_AM,
						_BM,
						pos,
						tile_name,
						zorder,
						tilemap_name as unknown as TileMapKeys
					);
				});
			});

			_AM.TileRNG.reset();
		});
	},

	
	draw_tile_at_coords: ( me: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, pos: Point2D, tile_name: string, zorder: number, tilemap_name: TileMapKeys) => {
		let { consts } = _AM;

		/*
			This is the special bit of logic which makes the different rows (since we're hex tiles) be offset from each other by "half" a tile.
		*/
		let universal_hex_offset = Utils.modulo(pos.y, 2) == 1 ? Math.floor(consts.tile_width / 2) : 0;
		let real_pos: Point2D = {
			x: (pos.x + 0) * consts.tile_width + universal_hex_offset,
			y: (pos.y + 0) * consts.tile_height
		};


		const cache_hash = `${pos.x}_${pos.y}_${tile_name}_${zorder}}`;
		const cached_value = me.cache_of_image_lists[cache_hash];

		const image_list: ImageListCache = ƒ.if( cached_value != undefined,
			cached_value,
			Asset_Manager_ƒ.get_images_for_tile_type_at_zorder_and_pos({
				_AM: _AM,
				_BM: _BM,
				zorder: zorder,
				pos: real_pos,
				tile_name: tile_name,
				comparator: Tilemap_Manager_ƒ.get_tile_comparator_sample_for_pos(me, pos, tilemap_name),
			})
		);

		if( !cached_value ){
			me.cache_of_image_lists[cache_hash] = image_list;
		}

		Asset_Manager_ƒ.draw_images_at_zorder_and_pos({
			_AM: _AM,
			_BM: _BM,
			zorder: zorder,
			pos: real_pos,
			image_list: image_list,
			current_milliseconds: ticks_to_ms(_BM.time_tracker.current_tick)
		})			
	},

	
	do_one_frame_of_rendering: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, set_Blit_Manager: (newVal: Blit_Manager_Data) => void) => {
		if(me.initialized){
			Blit_Manager_ƒ.fill_canvas_with_solid_color(_BM);
			Tilemap_Manager_ƒ.draw_tiles(me, _AM, _BM);

			set_Blit_Manager(
				Blit_Manager_ƒ.draw_entire_frame(_BM)
			)
		} else {
			Tilemap_Manager_ƒ.initialize_tiles(me, _AM);
		}
	},
	
	
/*----------------------- info ops -----------------------*/
	is_within_map_bounds: (me: Tilemap_Manager_Data, pos: Point2D ): boolean => (
		pos.x >= 0 &&
		pos.y >= 0 && 
		pos.x < me.tile_maps['terrain'][0].length &&
		pos.y < me.tile_maps['terrain'].length 
	),


	get_tile_comparator_sample_for_pos: ( me: Tilemap_Manager_Data, pos: Point2D, tilemap_name: TileMapKeys ): TileComparatorSample => {
		const cached_value = me.cache_of_tile_comparators[tilemap_name]?.[pos.y]?.[pos.x];

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
			if( !isArray(me.cache_of_tile_comparators[tilemap_name][pos.y]) ){
				me.cache_of_tile_comparators[tilemap_name][pos.y] = [];
				me.cache_of_tile_comparators[tilemap_name][pos.y][pos.x] = (val as TileComparatorSample);
			} else {
				me.cache_of_tile_comparators[tilemap_name][pos.y][pos.x] = (val as TileComparatorSample);
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