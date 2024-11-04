import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";
import _, { Dictionary, cloneDeep, isArray, isEmpty, isEqual, map, range, size } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ, ImageListCache } from "./Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "./Blit_Manager";
import * as Utils from "./Utils";
import { modulo, ƒ } from "./Utils";


import { TileComparatorSample, TilePositionComparatorSample } from "./Asset_Manager";
import { Point2D, Rectangle, PointCubic } from '../../interfaces';
import { concat, filter, flatten, includes, keys, slice, uniq } from "ramda";
import { TileMap, Tilemap_Manager_Data, Tilemap_Manager_ƒ, tile_maps_init } from "./Tilemap_Manager";


type TileBlob = {
	seed_location: Point2D,
	tile_type: string,
	tiles: Array<Point2D>,
}

type TileBlobPlan = {
	seed_location: Point2D,
	tile_type: string,
}



export const Map_Generation_ƒ = {
/*----------------------- utility functions -----------------------*/
get_random_tile_name: (_AM: Asset_Manager_Data): string => (
	Asset_Manager_ƒ.yield_tile_name_list(_AM)[
		Utils.dice( _.size( Asset_Manager_ƒ.yield_tile_name_list(_AM) ) ) -1 
	]
),


/*----------------------- initialization and asset loading -----------------------*/
	initialize_tiles_random: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data): Tilemap_Manager_Data => {
		const map_size = Tilemap_Manager_ƒ.get_map_bounds(me);


		const fresh_terrain_tilemap: TileMap = _.range(map_size.h).map( (row_value, row_index) => {
			return _.range(map_size.w).map( (col_value, col_index) => {
				return Map_Generation_ƒ.get_random_tile_name(_AM)
			});
		});

		const thing = Tilemap_Manager_ƒ.get_adjacent_tile_in_direction( {x:2,y:3}, 'south_east');
		console.error(
			'THING', thing
		)


		return {
			level_name: me.level_name,
			metadata: _.cloneDeep(me.metadata),
			tile_maps: {
				terrain: fresh_terrain_tilemap,
				ui: Tilemap_Manager_ƒ.create_empty_tile_map(me, _AM),
			},
			creature_list: _.cloneDeep(me.creature_list),
			cache_of_tile_comparators: _.cloneDeep(tile_maps_init),
			cache_of_image_lists: _.cloneDeep({}),
			initialized: true,
		}
	},


/*----------------------- blob-related code -----------------------*/
	get_all_open_tiles_adjacent_to: (
		_TM: Tilemap_Manager_Data,
		location: Point2D,
		forbidden_tiles: Array<Point2D>,
	): Array<Point2D> => {
		const adjacent_tiles: Array<Point2D> = [
			Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'east'),
			Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'north_east'),
			Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'north_west'),
			Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'south_east'),
			Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'south_west'),
			Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'west')
		];

		const adjacent_tiles_within_map = filter(
			(tile) => (	Tilemap_Manager_ƒ.is_within_map_bounds( _TM, tile )),
			adjacent_tiles
		)

		const open_adjacent_tiles = filter(
			(val)=>( !includes(val,forbidden_tiles)),
			adjacent_tiles_within_map
		);

		return open_adjacent_tiles;
	},

	create_tile_blob_at_location: (
		_TM: Tilemap_Manager_Data,
		seed_location: Point2D,
		reserved_tiles: Array<Point2D>,
		max_blob_size: number,
	): Array<Point2D> => {
		let claimed_tiles: Array<Point2D> = [seed_location];
		let open_possibilities: Array<Point2D> = Map_Generation_ƒ.get_all_open_tiles_adjacent_to(
			_TM,
			seed_location,
			[seed_location],
		);

		const grow_blob = (): void => {
			while( !(size(claimed_tiles) > max_blob_size) ){

				/*
					Perhaps counterintuitively, we update the list of possible new tiles to grow to at the end of a pass, rather than the start, so we can rely on it being "ready" here.
				*/
				const chosen_tile = open_possibilities[
					Utils.dice( _.size( open_possibilities ) ) -1 
				];

				const adjacent_tiles = Map_Generation_ƒ.get_all_open_tiles_adjacent_to(
					_TM,
					chosen_tile,
					concat(open_possibilities, claimed_tiles)
				);

				claimed_tiles.push(chosen_tile);
				/*
					Update the list of possible tiles; we want to remove the one we just picked, and add the new adjacencies.

					We don't have to worry about collisions between our new set of `adjacent_tiles` and either established `open_possibilities` or `claimed_tiles` because we explicitly filter those out in the adjacent_tiles calculation.
				*/
				open_possibilities = concat(
					filter(
						(val)=>( !isEqual(val, chosen_tile) ),
						open_possibilities
					),
					adjacent_tiles
				);

			}
		}

		grow_blob();

		return claimed_tiles;
	},


	expand_tile_blob_by_one: (
		_TM: Tilemap_Manager_Data,
		current_tiles: Array<Point2D>,
		reserved_tiles: Array<Point2D>,  //from other blobs
	): Array<Point2D> => {
		/*
			Adds one single tile to a blob.


			First we build a list of all potential tiles we can pick.  We do this by stepping through all members of the existing blob, and calculating all tiles that are adjacent to them.  This would include a bunch of bad tiles, so we filter that out in two steps; the first being that we forbid any tile that's already been picked by either this blob or any prior blob.

			The second is that this would produce a ton of duplicates, so we run a uniq pass to get rid of all of those.
		*/

		const open_possibilities: Array<Point2D> = uniq(
			flatten(
				map(current_tiles, (tile)=>(
					Map_Generation_ƒ.get_all_open_tiles_adjacent_to(
						_TM,
						tile,
						reserved_tiles,
					)
				))
			),
		);


		/*
			With those picked, we now move on to picking one single "new tile", at random, out of the possible new choices.

			Then we append that to the previous list.


			If it turns out that in the prior step, we found absolutely no spots to expand to, then just return the prior list unchanged.
		*/
		if(size(open_possibilities)){
			const chosen_tile = open_possibilities[
				Utils.dice( _.size( open_possibilities ) ) -1 
			];

			return concat([chosen_tile], current_tiles);
		} else {
			return current_tiles;
		}
	},


	initialize_tiles_blob: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data): Tilemap_Manager_Data => {
		const map_size = Tilemap_Manager_ƒ.get_map_bounds(me);


		const fresh_terrain_tilemap: TileMap = _.range(map_size.h).map( (row_value, row_index) => {
			return _.range(map_size.w).map( (col_value, col_index) => {
				return ''
				// return Asset_Manager_ƒ.yield_tile_name_list(_AM)[
				// 	0 
				// ];
			});
		});

		const max_blob_size: number = 10;
		const map_bounds = Tilemap_Manager_ƒ.get_map_bounds(me);
		const map_tile_count = map_bounds.w * map_bounds.h;
		const map_blob_count = Math.round(map_tile_count / max_blob_size);
		/*
			if our blobs were squares, they'd be this wide/tall.  We'll space them by this much, and offset the first ones by half of this.  This may end up a disastrous mess, but we're winging this.
		*/
		const blob_spacing = Math.round(Math.sqrt(max_blob_size)); 



		/*
			Build a list of offsets.  These are basically gonna be a normalized super-grid of how many rows and columns of blobs we have; if we had one row of 3 columns, it'd be [{x:0,y:0},{x:1,y:0},{x:2,y:0}].  We'll use this to multiply the actual spaced-out blobs on the real tiles.
		*/
		const number_of_blobs_wide = Math.round(map_bounds.w / blob_spacing);

		const tile_blob_rows_and_columns: Array<Point2D> = map(
			range(map_blob_count),
			(blob_number) => ({
					x: modulo(blob_number, number_of_blobs_wide),
					y: Math.floor(blob_number / number_of_blobs_wide)

			})
		)


		const tile_blob_plans: Array<TileBlobPlan> = map(
			tile_blob_rows_and_columns,
			(blob) => ({
				seed_location: {
					x: Math.floor(blob_spacing/2) + blob_spacing * blob.x,
					y: Math.floor(blob_spacing/2) + blob_spacing * blob.y,
				},
				tile_type: Map_Generation_ƒ.get_random_tile_name(_AM),
			})
		)
		
		



		let claimed_tiles: Array<Point2D> = map(tile_blob_plans, (plan)=>(plan.seed_location));
		/*
			Seed the data structure for the tile blobs:
		*/
		
		let tile_blobs: Array<TileBlob> = map(tile_blob_plans, (plan)=>(
			{
				tiles: [plan.seed_location],
				tile_type: plan.tile_type,
				seed_location: plan.seed_location
			}
		));		

		let iter = 0;

		

		while (iter < 15){
			iter += 1;


			tile_blobs = map(tile_blobs, (blob)=>({
				tiles: Map_Generation_ƒ.expand_tile_blob_by_one(
					me,
					blob.tiles,
					flatten(
						map(tile_blobs, (val)=>(val.tiles))
					),
				),
				tile_type: blob.tile_type,
				seed_location: blob.seed_location


			}))
		}



		map(tile_blobs, (blob)=>{
			map(blob.tiles, (tile)=>{
				fresh_terrain_tilemap[tile.y][tile.x] =  blob.tile_type;
			})
		})

		return {
			level_name: me.level_name,
			metadata: _.cloneDeep(me.metadata),
			tile_maps: {
				terrain: fresh_terrain_tilemap,
				ui: Tilemap_Manager_ƒ.create_empty_tile_map(me, _AM),
			},
			creature_list: _.cloneDeep(me.creature_list),
			cache_of_tile_comparators: _.cloneDeep(tile_maps_init),
			cache_of_image_lists: _.cloneDeep({}),
			initialized: true,
		}
	},


}