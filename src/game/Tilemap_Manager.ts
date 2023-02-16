import React from "react";
import ReactDOM from "react-dom";
import _, { Dictionary } from "lodash";

import { Asset_Manager } from "./Asset_Manager";
import { Blit_Manager } from "./Blit_Manager";
import * as Utils from "./Utils";
import { ƒ } from "./Utils";


import { TileComparatorSample, TilePositionComparatorSample } from "./Asset_Manager";
import { Point2D, Rectangle, PointCubic } from './interfaces';

interface tileViewState {
	tile_maps: TileMaps,
	initialized: boolean,
}

interface _TileMaps<T> {
	terrain: T,
	ui: T,
}

type TileMaps =  _TileMaps<TileMap>;

type TileMapKeys = keyof TileMaps;

type TileMap = Array<Array<string>>;

export enum Direction {
	north_east,
	east,
	south_east,
	north_west,
	west,
	south_west,
}


export class Tilemap_Manager {
	state: tileViewState;
	_AM: Asset_Manager;
	_BM: Blit_Manager;

/*----------------------- initialization and asset loading -----------------------*/
	constructor(_Asset_Manager: Asset_Manager, _Blit_Manager : Blit_Manager ) {
		
		this.state = {
			tile_maps: {
				terrain: [['']],
				ui: [['']],
			},
			initialized: false,
		};
		
		this._AM = _Asset_Manager;
		this._BM = _Blit_Manager;
	}


	initialize_tiles = () => {
		let { consts, yield_tile_name_list, static_vals } = this._AM;


		this.state.tile_maps.terrain = _.range(consts.col_height).map( (row_value, row_index) => {
			return _.range(consts.row_length).map( (col_value, col_index) => {
				return yield_tile_name_list()[
					Utils.dice( _.size( yield_tile_name_list() ) ) -1 
				];
			});
		});

		this.clear_tile_map('ui');	

		this.state.initialized = true;
	}


/*----------------------- state mutation -----------------------*/
	modify_tile_status = ( pos: Point2D, selected_tile_type: string, tilemap_name: TileMapKeys ): void => {
		let { consts, static_vals } = this._AM;
		
		if(
			this.is_within_map_bounds( pos )
		){
			if(selected_tile_type && selected_tile_type != ''){
				this.state.tile_maps[tilemap_name][pos.y][pos.x] = selected_tile_type;
			}
		}
	}

	clear_tile_map = ( tilemap_name: TileMapKeys ) => {
		let { consts, yield_tile_name_list, static_vals } = this._AM;

		this.state.tile_maps[tilemap_name] = _.range(consts.col_height).map( (row_value, row_index) => {
			return _.range(consts.row_length).map( (col_value, col_index) => {
				return ''
			});
		});			
	}


/*----------------------- draw ops -----------------------*/

	
	draw_tiles = () => {
		let zorder_list = this._AM.yield_full_zorder_list();

		zorder_list.map( (value,index) => {
			this.draw_tiles_for_zorder(value);
		})
		
		this._AM.TileRNG.reset();
	}

	draw_tiles_for_zorder = (zorder: number) => {

		_.map(this.state.tile_maps as unknown as Dictionary<TileMap>, (tile_map, tilemap_name) => {
			tile_map.map( (row_value, row_index) => {
				row_value.map( (col_value, col_index) => {

					let tile_name = this.get_tile_name_for_tile_at_pos_with_data( {x: row_index, y: col_index}, col_value);
					let pos = {x: col_index, y: row_index};
					

					this.draw_tile_at_coords(
												pos,
												tile_name,
												zorder,
												tilemap_name as unknown as TileMapKeys
											);
				});
			});
		});
	}

	
	draw_tile_at_coords = ( pos: Point2D, tile_name: string, zorder: number, tilemap_name: TileMapKeys) => {
		let { consts } = this._AM;

			/*
				This is the special bit of logic which makes the different rows (since we're hex tiles) be offset from each other by "half" a tile.
			*/
			let universal_hex_offset = Utils.modulo(pos.y, 2) == 1 ? Math.floor(consts.tile_width / 2) : 0;

								
			this._AM.draw_image_for_tile_type_at_zorder_and_pos	(
															tile_name,
															this._BM,
															zorder,
						/* x */								(pos.x + 0) * consts.tile_width + universal_hex_offset,
						/* y */								(pos.y + 0) * consts.tile_height,
						/* comparator */					this.get_tile_comparator_sample_for_pos(pos, tilemap_name),
															this._BM.fps_tracker.current_millisecond
														);
	}

	
	do_one_frame_of_rendering = () => {
		if(this.state.initialized){
			this._BM.fill_canvas_with_solid_color();
			this.draw_tiles();
			this._BM.draw_entire_frame();
		} else {
			this.initialize_tiles();
		}
	}
	
	
/*----------------------- info ops -----------------------*/
	is_within_map_bounds = ( pos: Point2D ): boolean => (
		pos.x >= 0 &&
		pos.y >= 0 && 
		pos.x < this._AM.consts.row_length &&
		pos.y < this._AM.consts.col_height 
	)



	get_tile_comparator_sample_for_pos = ( pos: Point2D, tilemap_name: TileMapKeys ): TileComparatorSample => {
		const tpc = this.get_tile_position_comparator_for_pos(pos);
		
		const val = _.map(tpc, (row_val, row_idx) => {
			return _.map(row_val, (col_val, col_idx) => {
				return this.get_tile_name_for_pos( col_val, tilemap_name )
			})
		});
		
		return (val as TileComparatorSample); //casting this because Typescript is being extra insistent that the tuple lengths match, but we can't guarantee this without dramatically complicating our code in a particularly bad way.
		//https://github.com/microsoft/TypeScript/issues/11312
	}
	
	get_tile_position_comparator_for_pos = ( pos: Point2D ): TilePositionComparatorSample => {
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
			
			return horizontal_tile_indices.map( (col_value, col_index) => {
				return {x: col_value, y: row_value};
			});
		}) as TilePositionComparatorSample;
	}
	
	get_tile_name_for_pos = ( pos: Point2D, tilemap_name: TileMapKeys ) => {
		/*
			This enforces "safe access", and will always return a string.  If it's outside the bounds of the tile map, we return an empty string.
		*/
		if(
			pos.y > (_.size(this.state.tile_maps[tilemap_name]) - 1) ||
			pos.y < 0 ||
			pos.x > (_.size(this.state.tile_maps[tilemap_name][pos.y]) - 1) ||
			pos.x < 0
		){
			return '';
		} else {
			return this.state.tile_maps[tilemap_name][pos.y][pos.x];
		}
	}
	
	
	
	get_tile_name_for_tile_at_pos_with_data = ( pos: Point2D, tile_entry: string ) => {
		/*
			Tile_entry is whatever mnemonic or other indicator is stored at that position in the array. 
			Currently we're just doing 1 0 values because we're in the midst of hacking, but we'll decide on a more 'real' markup later.
			
			We may have to transition away from having this passed in, since auto-tiling (if/when it comes) may require us to query adjacent tiles.
		*/
		return tile_entry;
	}
	

	convert_pixel_coords_to_tile_coords = (pos: Point2D) => {
		let { consts } = this._AM;
		let position = this._BM.yield_world_coords_for_absolute_coords({x: pos.x, y: pos.y});

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
	}
	
	convert_tile_coords_to_pixel_coords = (pos : Point2D) => ({
		x:	pos.x * this._AM.consts.tile_width +
			(( Utils.modulo(pos.y, 2) == 1) ? Math.floor(this._AM.consts.tile_width / 2) : 0),
		y:	pos.y * this._AM.consts.tile_height
	})




	
/*----------------------- distance calculations -----------------------*/
	/*
		based on https://www.redblobgames.com/grids/hexagons/
		
		Our tile system, in this page's lingo, is "pointy topped" and "odd-r" (shoves odd rows by +1/2 tile to the right).
	*/

	cubic_to_cartesian = ( cubeCoords: PointCubic): Point2D => ({
		x: cubeCoords.q + (cubeCoords.r - (cubeCoords.r&1)) / 2,
		y: cubeCoords.r,
	})

	cartesian_to_cubic = ( cartCoords: Point2D ): PointCubic => {
		const q = cartCoords.x - (cartCoords.y - (cartCoords.y & 1)) / 2;
		const r = cartCoords.y;
		
		return {
			q: q,
			r: r,
			s: (-q - r),
		}
	}

	cubic_subtraction = ( a: PointCubic, b: PointCubic ): PointCubic => ({
		q: a.q - b.q,
		r: a.r - b.r,
		s: a.s - b.s,
	})

	cubic_distance = ( a: PointCubic, b: PointCubic ): Number => {
		const vector = this.cubic_subtraction(a, b);

		return Math.max( Math.abs(vector.q), Math.abs(vector.r), Math.abs(vector.s));
	}



	get_tile_coord_distance_between = ( startPos: Point2D, endPos: Point2D ) => Number (
		this.cubic_distance( this.cartesian_to_cubic(startPos), this.cartesian_to_cubic(endPos) )
	)

/*----------------------- direction handling -----------------------*/

	extract_direction_from_map_vector = (start_pos: Point2D, end_pos: Point2D):Direction => {
		if( start_pos.y == end_pos.y ){
			if(start_pos.x < end_pos.x){
				return Direction.east;
			} else {
				return Direction.west;
			}
		} else if( start_pos.y >= end_pos.y  ){
			if(start_pos.x < end_pos.x){
				return Direction.north_east;
			} else {
				return Direction.north_west;
			}
		} else {
			if(start_pos.x < end_pos.x){
				return Direction.south_east;
			} else {
				return Direction.south_west;
			}
		}
	}
}