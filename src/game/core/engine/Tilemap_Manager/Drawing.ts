import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";
import _, { Dictionary, cloneDeep, isArray, isEmpty, isEqual, map, range, size } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ, GraphicItem, ImageListCache } from "../Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "../Blit_Manager";
import * as Utils from "../Utils";
import { is_all_true, ƒ } from "../Utils";


import { TileComparatorSample, TilePositionComparatorSample } from "../Asset_Manager";
import { Point2D, Rectangle, PointCubic } from '../../../interfaces';
import localforage from "localforage";
import { concat, equals, filter, find, includes, keys, propEq, reduce, slice, uniq, zipWith } from "ramda";
import { Page } from '@rsuite/icons';
import { Vals } from "../../constants/Constants";
import { Creature_Map_Instance, Game_Manager_ƒ } from "../Game_Manager";
import { Creature_ƒ } from "../../../objects_core/Creature";
import { zorder } from "../../constants/zorder";

import * as builtin_levels from "../../../levels";
import { Map_Generation_ƒ } from "../Map_Generation";
import { boolean } from "yargs";
import { MTP_Anchor_Data } from "../../data/Multi_Tile_Patterns";
import { Asset_Blit_List, Asset_Blit_Tilemap, TileMap, TileMapKeys, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "./Tilemap_Manager";



export const Tilemap_Manager_ƒ_Drawing = {


	
/*----------------------- draw ops -----------------------*/
	draw_tiles: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
	) => {

		if( !isEqual( me.asset_blit_list_cache, [[[]]]) ){
			Tilemap_Manager_ƒ.draw_all_assets(
				me,
				_AM,
				_BM,
				me.asset_blit_list_cache
			);
		} else {
			const tilemap_of_assets: Asset_Blit_Tilemap = Tilemap_Manager_ƒ.calculate_tile_asset_map(me, _AM, _BM);

			Tilemap_Manager_ƒ.draw_all_assets(
				me,
				_AM,
				_BM,
				tilemap_of_assets
			);

			set_Tilemap_Manager(
				Tilemap_Manager_ƒ.set_tile_asset_cache(
					me,
					_AM,
					tilemap_of_assets,
				)
			)
		}

	},

	draw_all_assets: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		tilemap_of_assets: Asset_Blit_Tilemap
	) => {
		tilemap_of_assets.map( (row_value, row_index) => {
			return row_value.map( (tile_assets, col_index) => {

				let pos = {x: col_index, y: row_index};

				map(tile_assets, (individual_asset)=>{
					Asset_Manager_ƒ.draw_image_for_asset_name({
						_AM:						_AM,
						//@ts-ignore
						asset_name:					individual_asset.id,
						_BM:						_BM,
						pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(
							me,
							_AM,
							pos
						),
						zorder:						individual_asset.zorder,
						current_milliseconds:		ticks_to_ms(_BM.time_tracker.current_tick),
						opacity:					1.0,
						rotate:						0,
						brightness:					1.0,
						horizontally_flipped:		false,
						vertically_flipped:			false,
					})
				})
			});
		});
	},

	calculate_tile_asset_map: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,

	): Asset_Blit_Tilemap => {

		const mtp_results = Tilemap_Manager_ƒ.mtp_scan(me, _AM);

		//step over all of the various "tile maps", like 'ui' or 'terrain', and collate all the tiles.
		let asset_maps = _.map(me.tile_maps as unknown as Dictionary<TileMap>, (tile_map, tilemap_name) => {

			return tile_map.map( (row_value, row_index) => {
				return row_value.map( (tile_name, col_index) => {

					let pos = {x: col_index, y: row_index};

					let asset_list: Asset_Blit_List = [];
					if( !includes( pos , mtp_results.reserved_tiles) ){
						asset_list = Tilemap_Manager_ƒ.get_asset_list_at_coords(
							me,
							_AM,
							_BM,
							pos,
							tile_name,
							tilemap_name as unknown as TileMapKeys
						);
					}

					if( includes( pos , mtp_results.reserved_tiles) ){
						//@ts-ignore
						const matching_anchor: MTP_Anchor_Data = find( propEq(pos, 'location') ) (mtp_results.anchor_data);

						if(matching_anchor){

							asset_list.push({
								id: matching_anchor.graphic,
								zorder: matching_anchor.zorder,
							})
						}
					}

					return asset_list;
				});
			});

		});

		_AM.TileRNG.reset();


		var merged_asset_maps = map(asset_maps[0], (row, row_index)=>(
			map(row, (col, col_index)=> (
				concat(
					col,
					asset_maps[1][row_index][col_index]
				)
			))
		  ));
		  

		//TODO -- merge the tilemaps!  don't throw one of them away.
		return merged_asset_maps;
	},


	get_asset_list_at_coords: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		pos: Point2D,
		tile_name: string,
		tilemap_name: TileMapKeys
	): Asset_Blit_List => {

		const asset_list: Asset_Blit_List = Asset_Manager_ƒ.yield_asset_list_for_tile_type_with_comparator(
			_AM,
			_BM,
			tile_name,
			Tilemap_Manager_ƒ.get_tile_comparator_sample_for_pos(me, pos, tilemap_name),
		)


		return asset_list;
	
	},

	

	mtp_scan: ( me: Tilemap_Manager_Data, _AM: Asset_Manager_Data ): {
		reserved_tiles: Array<Point2D>
		anchor_data: Array<MTP_Anchor_Data>,
	} => {
		const reserved_tiles: Array<Point2D> = [];
		const anchor_data: Array<MTP_Anchor_Data> = [];


		/*
			MTP rows are assumed to have odd rows "half a tile" further left.

			Map rows are the opposite.
		*/
		const mtp_to_map_fudge = (input: Point2D): Point2D => (
			Utils.is_even(input.y)
			?
			{x: input.x, y: input.y}
			:
			{x: input.x - 1, y: input.y} //map_tile_col_index == 9 && map_tile_row_index == 9
		);


		const metadata = _AM.static_vals.multi_tile_pattern_metadata;
		const bounds = Tilemap_Manager_ƒ.get_map_bounds(me);


		let map_tile_row_index = 0 - metadata.max_mtp_height;

		while( map_tile_row_index < bounds.h +  metadata.max_mtp_height){
			let map_tile_row = me.tile_maps.terrain[map_tile_row_index];
//		map(me.tile_maps.terrain, (map_tile_row, map_tile_row_index)=>{
			//Step over all of the map tiles; at each map tile, we run the full battery of MTP possibilities and see if any match.

			let map_tile_col_index = 0 - metadata.max_mtp_width;

			while( map_tile_col_index < bounds.w +  metadata.max_mtp_width){

			//map(map_tile_row, (map_tile, map_tile_col_index)=>{
				//let map_tile = map_tile_row[map_tile_col_index];


				let bump = (input1: number, input2: number) => (Utils.is_odd( input1 ) && Utils.is_odd( input2 )) ? 1 : 0;

				map(_AM.static_vals.multi_tile_types, (mtp_type)=>{
					//Step over each kind of MTP

					map(mtp_type.variants, (mtp_variant)=>{
						//then step over each alternate graphic

						/*
							Set up a 'short-circuit' variable to terminate our calculations early.  These are expensive, and there are several determinations we can make in the MTP matching process where we can be sure that this current scan is disqualified.

							The first one is simply: "Was this tile already taken by an earlier MTP?"
						*/
						let abort_match: boolean = false;
						


							/*
								And now, at last, we're actually down to the tiles, themselves.
								Step over each of the members of the MTP, and run their regex against a corresponding tile in the real tileset.

								If every member of the MTP comes up with a true match, push the tile in question to the array of reserved tiles.
							*/
							const mtp_test = (						
								map(mtp_variant.restrictions, (row, mtp_row_index)=>(

									(
										map(row, (mtp_col, mtp_col_index)=>{
											if( !abort_match ){
												let test_pos = {
													x: map_tile_col_index + mtp_col_index + bump( map_tile_row_index, mtp_row_index),
													y: map_tile_row_index + ({x: mtp_col_index, y: mtp_row_index}).y,
												};

												let tile_name = Tilemap_Manager_ƒ.get_tile_name_for_pos(me,
													test_pos,
													'terrain'
												);

												let test = mtp_col.test(
													tile_name
												);

												//console.log(`mtp @ ${mtp_col_index}, ${mtp_row_index}, map @ ${map_tile_col_index}, ${map_tile_row_index}, ${tile_name}, ${mtp_col}, ${test} bump: ${bump(map_tile_row_index, mtp_row_index)}, in reserve: ${includes(test_pos, reserved_tiles) }`)

												let already_taken = includes(test_pos, reserved_tiles) && (mtp_variant.claims[mtp_row_index]?.[mtp_col_index]);

												if(already_taken){
													abort_match = true
												}

												return test && !already_taken;
											} else {
												return false;
											}
										})
									)
								))
							)

							const did_mtp_match = is_all_true( map(mtp_test, (val)=>(
								is_all_true(val)
							)))

							//console.warn(`NEW TILE:${map_tile_col_index}, ${map_tile_row_index} = ${did_mtp_match}`)

							if( did_mtp_match ){

								map(mtp_variant.claims, (claims_row, claims_row_index)=>(

									(
										map(claims_row, (claims_col, claims_col_index)=>{
											if(claims_col == true){
												const new_tile = {
													x: map_tile_col_index + ({x: claims_col_index, y: claims_row_index}).x + bump( map_tile_row_index, claims_row_index), 
													y: map_tile_row_index + ({x: claims_col_index, y: claims_row_index}).y
												};

												if( abort_match || includes(new_tile, reserved_tiles) ){
													abort_match = true;
												} else {
													reserved_tiles.push(new_tile)
												}

											}
										})
									)
								))

								if( abort_match == false ){
									map(mtp_variant.graphics, (graphic_item)=>{
										anchor_data.push({
											location: {
												x: map_tile_col_index +  ({x: graphic_item.anchor.x, y: graphic_item.anchor.y}).x + bump( map_tile_row_index, graphic_item.anchor.y), 
												y: map_tile_row_index + ({x: graphic_item.anchor.x, y: graphic_item.anchor.y}).y
											},
											zorder: graphic_item.zorder,
											graphic: graphic_item.id,
										})
									})
								}
							}


						//}
					})
				})

				map_tile_col_index++;
			};

			map_tile_row_index++;
		};
		
		return {
			reserved_tiles: reserved_tiles,
			anchor_data: anchor_data,
		};
	},
	

	
	do_one_frame_of_rendering: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
		draw_map_data_units: boolean,
		cursor_pos: Point2D,
	) => {
		if(me.initialized){
			Blit_Manager_ƒ.fill_canvas_with_solid_color(_BM);
			Tilemap_Manager_ƒ.draw_tiles(me, _AM, _BM, set_Tilemap_Manager);

			if(draw_map_data_units){
				Tilemap_Manager_ƒ.draw_units(me, _AM, _BM, cursor_pos);
			}

			set_Blit_Manager(
				Blit_Manager_ƒ.draw_entire_frame(_BM)
			)
		} else {
			Tilemap_Manager_ƒ.initialize_tiles(me, _AM);
		}
	},


	draw_units: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data, cursor_pos: Point2D) => {
		map( me.creature_list, (val,idx) => {
			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						_AM,
				asset_name:					Creature_ƒ.get_delegate(val.type_name).yield_creature_image(),
				_BM:						_BM,
				pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me, _AM, val.pos),
				zorder:						zorder.rocks,
				current_milliseconds:		0,
				opacity:					1.0,
				rotate:						0,
				brightness:					isEqual(cursor_pos, val.pos) ? 1.0 + 0.75 * Math.sin( _BM.time_tracker.current_tick * 0.2) : 1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})
		})
	},
	


	get_tile_comparator_sample_for_pos: ( me: Tilemap_Manager_Data, pos: Point2D, tilemap_name: TileMapKeys ): TileComparatorSample => {
			const tpc = Tilemap_Manager_ƒ.get_tile_position_comparator_for_pos(me, pos);
			
			const val = _.map(tpc, (row_val, row_idx) => {
				return _.map(row_val, (col_val, col_idx) => {
					return Tilemap_Manager_ƒ.get_tile_name_for_pos( me, col_val, tilemap_name )
				})
			});
			
			return (val as TileComparatorSample); //casting this because Typescript is being extra insistent that the tuple lengths match, but we can't guarantee this without dramatically complicating our code in a particularly bad way.
			//https://github.com/microsoft/TypeScript/issues/11312
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

}