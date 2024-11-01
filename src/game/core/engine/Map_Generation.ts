import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";
import _, { Dictionary, cloneDeep, isArray, isEmpty, isEqual, map, range, size } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ, ImageListCache } from "./Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "./Blit_Manager";
import * as Utils from "./Utils";
import { ƒ } from "./Utils";


import { TileComparatorSample, TilePositionComparatorSample } from "./Asset_Manager";
import { Point2D, Rectangle, PointCubic } from '../../interfaces';
import { concat, filter, includes, keys, slice, uniq } from "ramda";
import { TileMap, Tilemap_Manager_Data, Tilemap_Manager_ƒ, tile_maps_init } from "./Tilemap_Manager";



export const Map_Generation_ƒ = {

/*----------------------- initialization and asset loading -----------------------*/
	initialize_tiles_random: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data): Tilemap_Manager_Data => {
		const map_size = Tilemap_Manager_ƒ.get_map_bounds(me);


		const fresh_terrain_tilemap: TileMap = _.range(map_size.h).map( (row_value, row_index) => {
			return _.range(map_size.w).map( (col_value, col_index) => {
				return Asset_Manager_ƒ.yield_tile_name_list(_AM)[
					Utils.dice( _.size( Asset_Manager_ƒ.yield_tile_name_list(_AM) ) ) -1 
				];
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


	initialize_tiles_blob: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data): Tilemap_Manager_Data => {
		const map_size = Tilemap_Manager_ƒ.get_map_bounds(me);


		const fresh_terrain_tilemap: TileMap = _.range(map_size.h).map( (row_value, row_index) => {
			return _.range(map_size.w).map( (col_value, col_index) => {
				return Asset_Manager_ƒ.yield_tile_name_list(_AM)[
					0 
				];
			});
		});

		const seed_location: Point2D = {x: 6, y:7};

		const get_all_open_tiles_adjacent_to = (
			location: Point2D,
			claimed_tiles: Array<Point2D>,
			open_possibilities: Array<Point2D>,
		): Array<Point2D> => {
			const adjacent_tiles: Array<Point2D> = [
				Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'east'),
				Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'north_east'),
				Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'north_west'),
				Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'south_east'),
				Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'south_west'),
				Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'west')
			];

			const open_adjacent_tiles = filter(
				(val)=>( !includes(val,claimed_tiles) && !includes(val,open_possibilities)),
				adjacent_tiles
			);

			return open_adjacent_tiles;
		}

		let claimed_tiles: Array<Point2D> = [seed_location];
		let open_possibilities: Array<Point2D> = get_all_open_tiles_adjacent_to(seed_location, [seed_location], []);
		const max_blob_size: number = 10;

		const grow_blob = (): void => {
			while( !(size(claimed_tiles) > max_blob_size) ){

				/*
					Perhaps counterintuitively, we update the list of possible new tiles to grow to at the end of a pass, rather than the start, so we can rely on it being "ready" here.
				*/
				const chosen_tile = open_possibilities[
					Utils.dice( _.size( open_possibilities ) ) -1 
				];

				const adjacent_tiles = get_all_open_tiles_adjacent_to(
					chosen_tile,
					open_possibilities,
					claimed_tiles
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
		console.error( 'CLAIMED TILE LIST:', claimed_tiles);

		map(claimed_tiles, (val)=>{
			fresh_terrain_tilemap[val.y][val.x] =  'water';
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