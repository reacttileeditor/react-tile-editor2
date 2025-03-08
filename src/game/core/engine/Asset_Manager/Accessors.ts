import { Dispatch, SetStateAction } from "react";
import { Asset_Manager_Data, Asset_Manager_ƒ, Assets_Metadata_Single_Image_Item, Assets_Metadata_Spritesheet_Item, Autotile_Restriction_Sample, Graphic_Item_Basic, Graphic_Item_Autotiled, Graphic_Item_Generic, Image_Data, Tile_Comparator_Sample, Asset_Data_Record } from "./Asset_Manager";
import { filter, find, flatten, isString, map, size, sortBy, sortedUniq } from "lodash";
import { is_all_true, ƒ } from "../Utils";
import { concat, uniq, filter as r_filter, keys, includes } from "ramda";
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../Blit_Manager";
import { Point2D } from "../../../interfaces";
import * as Utils from "../Utils";
import { Asset_Blit_Item } from "../Tilemap_Manager/Tilemap_Manager";
import { zorder } from "../../constants/zorder";
import { MTP_Graphic_Item } from "../../data/Multi_Tile_Patterns";
import Prando from "prando";




export const Accessors = {
/*----------------------- Global Dataset Info -----------------------*/
	yield_asset_name_list: (me: Asset_Manager_Data) => {
		return filter(
			me.static_vals.image_data_list,
			(value, index) => {
				return value.not_a_tile !== true;
			}
		).map( (value,index) => {
			return value.name;
		})
	},

	yield_tile_name_list: (me: Asset_Manager_Data) => {
		return sortedUniq(
		map( 
				filter(me.static_vals.tile_types, (val) => (val.omit_from_random_map_generation != true)),
				(value,index)=>(value.name)
			)
		);
	},

	yield_full_zorder_list: (me: Asset_Manager_Data) => {
		/*
			Step through each of the levels of the tile_types list, and spit out just the zorder values.   This leaves us with a nested structure (the same as the original tile data object's structure), and what we really want to do is just boil it down to a straight list, and figure out which ones are unique. 
		*/
		return  sortBy(
				uniq(
				flatten(
				flatten(
					map( me.static_vals.tile_types, (value,index)=>{
						return map( value.graphics, (value,index)=>{
							return value.zorder;
						});
					} )
		))));
	},


/*----------------------- asset data access -----------------------*/
	get_data_for_individual_asset: (
		_AM: Asset_Manager_Data,
		asset_name: string,
	): Asset_Data_Record => {
		let { raw_image_list, image_data_list, assets_meta } = _AM.static_vals;

		const image_data = find(image_data_list, {name: asset_name})

		if(image_data == undefined){
			throw new Error( `Could not find an image in our image_data_list for the asset named ${asset_name}.` )
		}

		return {
			raw_image: raw_image_list[ asset_name ]!,
			image_data: find(image_data_list, {name: asset_name})!,
			metadata: assets_meta[ asset_name ]!
		};		
	},

	get_data_for_asset_name: (
		_AM: Asset_Manager_Data,
		asset_name: string,
	): Array<Asset_Data_Record> => {
		let { raw_image_list, image_data_list, assets_meta, image_sequence_data_list } = _AM.static_vals;

		if( includes(asset_name, keys(image_sequence_data_list)) ){
			let real_asset_name = image_sequence_data_list[asset_name][0];
			const asset_names = image_sequence_data_list[asset_name];

			return map( asset_names, (individual_asset_name)=>(
				Asset_Manager_ƒ.get_data_for_individual_asset(_AM, individual_asset_name)
			));
		} else {
			return [Asset_Manager_ƒ.get_data_for_individual_asset(_AM, asset_name)];
		}
	},

/*----------------------- asset data accessors -----------------------*/
	get_animation_lengths_for_asset: (
		_AM: Asset_Manager_Data,
		asset_name: string,
	): Array<number> =>{
		if(asset_name !== 'omit_image'){
			return Asset_Manager_ƒ.calculate_animation_durations(
				Asset_Manager_ƒ.get_data_for_asset_name(_AM, asset_name)
			)
		} else {
			return [0];
		}
	},


/*----------------------- object info -----------------------*/
	get_image_data_for_object: (me: Asset_Manager_Data, image_name: string):Image_Data|undefined => {
		let { image_data_list } = me.static_vals;

		return find( image_data_list, (value, index) => (value.name == image_name) );
	},


/*----------------------- tile info -----------------------*/
	get_tile_graphics_data: (me: Asset_Manager_Data, tile_name: string): Array<Graphic_Item_Basic|Graphic_Item_Autotiled> => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = me.static_vals;

		if( tile_name != '' ){
			let markup_data_for_tile = find( tile_types, (value, index) => (value.name == tile_name))
			
			if(markup_data_for_tile == undefined){
				console.error(`Nothing found in asset list for tile type ${tile_name}`);
				return [];
			} else {
				return markup_data_for_tile.graphics;
			}
		} else {
			return [];
		}
	},




	yield_asset_list_for_tile_type_with_comparator: (
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		tile_name: string,
		comparator: Tile_Comparator_Sample,
	): Array<Graphic_Item_Basic> => {

		let asset_data_array = Asset_Manager_ƒ.get_tile_graphics_data(_AM, tile_name);


		const only_valid_assets = r_filter((potential_asset)=>{
			return (
				!Asset_Manager_ƒ.isGraphicAutotiled(potential_asset)
				||
				(
					Asset_Manager_ƒ.isGraphicAutotiled(potential_asset)
					&&
					Asset_Manager_ƒ.should_we_draw_this_tile_based_on_its_autotiling_restrictions(comparator, potential_asset.restrictions)
				)
			)
		}, asset_data_array)

		return map(only_valid_assets, (item)=>({
			asset_variants: item.asset_variants,
			zorder: item.zorder,
		}));
	},

	convert_tile_variants_to_single_assets: (
		me: Asset_Manager_Data,
		graphic_item: Graphic_Item_Generic,
		tile_RNG: Prando,
	): Asset_Blit_Item => {
		const tile_rand = Utils.dice_anchored_on_specific_random_seed(graphic_item.asset_variants.length, tile_RNG)

		return {
			id: graphic_item.asset_variants[tile_rand - 1],
			zorder: graphic_item.zorder,
		}
	},

	convert_MTP_variants_to_single_assets: (
		me: Asset_Manager_Data,
		graphic_item: MTP_Graphic_Item,
		tile_RNG: Prando,
	): Asset_Blit_Item => {
		const tile_rand = Utils.dice_anchored_on_specific_random_seed(graphic_item.asset_variants.length, tile_RNG)

		return {
			id: graphic_item.asset_variants[tile_rand - 1],
			zorder: graphic_item.zorder,
		}
	},


}