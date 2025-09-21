import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";
import _, { Dictionary, cloneDeep, isArray, isEmpty, isEqual, map, range, size } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ, Graphic_Item_Basic, Image_List_Cache } from "../Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "../Blit_Manager";
import * as Utils from "../Utils";
import { dice_anchored_on_specific_random_seed, is_all_true, ƒ } from "../Utils";


import { Tile_Comparator_Sample, Tile_Position_Comparator_Sample } from "../Asset_Manager/Asset_Manager";
import { Point2D, Rectangle, PointCubic, Tile_Pos_Point } from '../../../interfaces';
import localforage from "localforage";
import { concat, equals, filter, find, includes, keys, propEq, reduce, slice, uniq, zipWith } from "ramda";
import { Page } from '@rsuite/icons';
import { Vals } from "../../constants/Constants";
import { Creature_Map_Instance, Game_Manager_ƒ } from "../Game_Manager/Game_Manager";
import { Creature_ƒ } from "../../../objects_core/Creature/Creature";
import { zorder } from "../../constants/zorder";

import * as builtin_levels from "../../../levels";
import { Map_Generation_ƒ } from "../Map_Generation";
import { boolean } from "yargs";
import { MTP_Anchor_Data } from "../../data/Multi_Tile_Patterns";
import { Asset_Blit_List, Asset_Blit_Tilemap, Tilemap_Single, Tilemap_Keys, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "./Tilemap_Manager";
import Prando from "prando";
import { Image_Data_Names } from "../../data/Image_Data";
import { Palette_Names } from "../../data/Palette_List";



export const Tilemap_Manager_ƒ_Drawing = {

	deterministic_random_time_offset_for_tile: (pos: Point2D): number => {
		/*
			Basically this should always return the same number for a particular tile.  The number should seem wildly random, but be fixed on a per-tile basis.

			This seeds an RNG with the passed-in tile value, and then uses it just once to get a random value.
		*/

		const RNG = new Prando(pos.x * pos.y);

		return dice_anchored_on_specific_random_seed(10000000, RNG);
	},
	
/*----------------------- draw ops -----------------------*/
	draw_tiles: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
	) => {


		_.map(me.tile_maps as unknown as Dictionary<Tilemap_Single>, (tile_map, tilemap_name) => {
			//if(tilemap_name == 'terrain'){
			Tilemap_Manager_ƒ.draw_tiles_for_tilemap(
				me,
				_AM,
				_BM,
				tilemap_name as unknown as Tilemap_Keys,
				set_Tilemap_Manager,
			)
			//}
		});
	},

	draw_tiles_for_tilemap: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		tilemap_name: Tilemap_Keys,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
	) => {

		if( !isEqual( me.asset_blit_list_cache_by_tilemap[tilemap_name], [[[]]]) ){
			Tilemap_Manager_ƒ.draw_all_assets(
				me,
				_AM,
				_BM,
				me.asset_blit_list_cache_by_tilemap[tilemap_name]
			);
		} else {
			const tilemap_of_assets: Asset_Blit_Tilemap = Tilemap_Manager_ƒ.calculate_assets_used_for_individual_tilemap(
				me.tile_maps[tilemap_name],
				tilemap_name as unknown as Tilemap_Keys,
				me,
				_AM,
				_BM,
			)

			me.tile_RNGs[tilemap_name].reset();

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
					tilemap_name,
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

		const arrow_tiles = concat(
			Asset_Manager_ƒ.get_all_assets_associated_with_tile_type('arrowhead_skinny_green', _AM),
			Asset_Manager_ƒ.get_all_assets_associated_with_tile_type('arrow_skinny_green', _AM)
		);

		tilemap_of_assets.map( (row_value, row_index) => {
			return row_value.map( (tile_assets, col_index) => {

				let pos = {x: col_index, y: row_index} as Tile_Pos_Point;

				map(tile_assets, (individual_asset)=>{

					let opacity = 1.0;
					if(includes(individual_asset.id, arrow_tiles)){
						opacity = 0.5;
					}

					Asset_Manager_ƒ.draw_image_for_asset_name({
						_AM:						_AM,
						asset_name:					individual_asset.id,
						_BM:						_BM,
						pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(
							me,
							_AM,
							pos
						),
						zorder:						individual_asset.zorder,
						current_milliseconds:		ticks_to_ms(_BM.time_tracker.current_tick) + Tilemap_Manager_ƒ.deterministic_random_time_offset_for_tile(pos),
						opacity:					opacity,
						rotate:						0,
						scale:						1.0,
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

		//step over all of the various "tile maps", like 'real_path' or 'terrain', and collate all the tiles.
		let asset_maps = _.map(me.tile_maps as unknown as Dictionary<Tilemap_Single>, (tile_map, tilemap_name) => {

			return Tilemap_Manager_ƒ.calculate_assets_used_for_individual_tilemap(
				tile_map,
				tilemap_name as unknown as Tilemap_Keys,
				me,
				_AM,
				_BM,
			)
		});


		return Tilemap_Manager_ƒ.merge_asset_maps(asset_maps);
	},

	merge_asset_maps: ( multiple_asset_maps: Array<Array<Array<Asset_Blit_List>>>): Asset_Blit_Tilemap => (
		map(multiple_asset_maps[0], (row, row_index)=>(
			map(row, (col, col_index)=> (
				concat(
					col,
					multiple_asset_maps[1][row_index][col_index]
				)
			))
		))
	),

	calculate_assets_used_for_individual_tilemap: (
		tile_map: Tilemap_Single,
		tilemap_name: Tilemap_Keys,
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
	): Array<Array<Asset_Blit_List>> => {
		/*
			Take an individual tilemap, like `ui` or `terrain`, and spit out a grid of which assets each tile will be using.

			Naturally, these would need to get merged by some other function to get a final, definitive list for each tile.
		*/

		let mtp_results: {
			reserved_tiles: Array<Point2D>,
			anchor_data: Array<MTP_Anchor_Data>,
		} = {
			reserved_tiles: [],
			anchor_data: [],
		}

		if( tilemap_name == 'terrain'){
			mtp_results = Tilemap_Manager_ƒ.mtp_scan(me, _AM);
		}

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
						tilemap_name as unknown as Tilemap_Keys
					);
				}

				if( includes( pos , mtp_results.reserved_tiles) ){
					const matching_anchors: Array<MTP_Anchor_Data> = filter( propEq(pos, 'location') ) (mtp_results.anchor_data);

					map(matching_anchors, (anchor)=>{

						asset_list.push({
							id: anchor.graphic,
							zorder: anchor.zorder,
						})
					});
				}

				return asset_list;
			});
		});
	},


	get_asset_list_at_coords: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		pos: Point2D,
		tile_name: string,
		tilemap_name: Tilemap_Keys
	): Asset_Blit_List => {

		const asset_list = Asset_Manager_ƒ.yield_asset_list_for_tile_type_with_comparator(
			_AM,
			_BM,
			tile_name,
			Tilemap_Manager_ƒ.get_tile_comparator_sample_for_pos(me, pos, tilemap_name),
		)

		return map(asset_list, (val)=>(
			Asset_Manager_ƒ.convert_tile_variants_to_single_assets(_AM, val, me.tile_RNGs[tilemap_name])
		))

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


		const metadata = _AM.static_vals.post_loading_metadata;
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

					map(mtp_type.patterns, (mtp_variant)=>{
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
											graphic: Asset_Manager_ƒ.convert_MTP_variants_to_single_assets(_AM, graphic_item, me.tile_RNGs['terrain']).id as Image_Data_Names

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
			Blit_Manager_ƒ.fill_canvas_with_solid_color(_BM, "#000000");
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
				asset_name:					Creature_ƒ.get_delegate(val.type_name).yield_stand_asset_for_direction(Creature_ƒ.get_delegate(val.type_name), val.direction),
				_BM:						_BM,
				pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(me, _AM, val.pos),
				zorder:						zorder.rocks,
				current_milliseconds:		ticks_to_ms(_BM.time_tracker.current_tick),
				opacity:					1.0,
				rotate:						0,
				scale:						1.0,
				brightness:					isEqual(cursor_pos, val.pos) ? 1.0 + 0.75 * Math.sin( _BM.time_tracker.current_tick * 0.2) : 1.0,
				horizontally_flipped:		Game_Manager_ƒ.get_flip_state_from_direction(val.direction),
				vertically_flipped:			false,
				palette:					`team${val.team}` as Palette_Names
			})
		})
	},
	


	get_tile_comparator_sample_for_pos: ( me: Tilemap_Manager_Data, pos: Point2D, tilemap_name: Tilemap_Keys ): Tile_Comparator_Sample => {
			const tpc = Tilemap_Manager_ƒ.get_tile_position_comparator_for_pos(me, pos);
			
			const val = _.map(tpc, (row_val, row_idx) => {
				return _.map(row_val, (col_val, col_idx) => {
					return Tilemap_Manager_ƒ.get_tile_name_for_pos( me, col_val, tilemap_name )
				})
			});
			
			return (val as Tile_Comparator_Sample); //casting this because Typescript is being extra insistent that the tuple lengths match, but we can't guarantee this without dramatically complicating our code in a particularly bad way.
			//https://github.com/microsoft/TypeScript/issues/11312
	},
	
	get_tile_position_comparator_for_pos: ( me: Tilemap_Manager_Data, pos: Point2D ): Tile_Position_Comparator_Sample => {
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
		}) as Tile_Position_Comparator_Sample;
	},

}