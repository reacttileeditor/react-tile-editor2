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
import { Image_And_Image_Sequence_Data_Names, Image_Data_Names } from "../../data/Image_Data";
import { Palette_Names } from "../../data/Palette_List";




export const Accessors = {
/*----------------------- Global Dataset Info -----------------------*/
	yield_asset_name_list: (me: Asset_Manager_Data) => {
		return keys(filter(
			me.static_vals.image_data_list,
			(value, index) => {
				return value.not_a_tile !== true;
			}
		));
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
		asset_name: Image_Data_Names,
		palette?: Palette_Names,
	): Asset_Data_Record => {
		let { raw_image_list, image_data_list, assets_meta } = _AM.static_vals;

		const image_data = image_data_list[asset_name];

		if(image_data == undefined){
			throw new Error( `Could not find an image in our image_data_list for the asset named ${asset_name}.` )
		}

		const raw_image: HTMLImageElement = Asset_Manager_ƒ.maybe_get_palette_swap_of_asset(
			_AM,
			asset_name,
			image_data,
			palette,
		);

		return {
			raw_image: raw_image!,
			image_data: image_data_list[ asset_name ]!,
			metadata: assets_meta[ asset_name ]!
		};		
	},




	get_data_for_asset_name: (
		_AM: Asset_Manager_Data,
		asset_name: Image_And_Image_Sequence_Data_Names,
		palette?: Palette_Names,
	): Array<Asset_Data_Record> => {
		let { image_sequence_data_list } = _AM.static_vals;

		if( includes(asset_name, keys(image_sequence_data_list)) ){
			//narrow the type casting through a shitty cast to indicate that, yes, it's ONLY a sequence, rather than a key that could be either.

			let real_asset_name = image_sequence_data_list[(asset_name as keyof typeof image_sequence_data_list)][0];
			const asset_names = image_sequence_data_list[asset_name as keyof typeof image_sequence_data_list];

			return map( asset_names, (individual_asset_name)=>(
				Asset_Manager_ƒ.get_data_for_individual_asset(_AM, individual_asset_name, palette)
			));
		} else {
			//etc, we've determined it's got to be an image data record.
			return [Asset_Manager_ƒ.get_data_for_individual_asset(_AM, asset_name as Image_Data_Names, palette)];
		}
	},

	maybe_get_palette_swap_of_asset: (
		_AM: Asset_Manager_Data,
		asset_name: Image_Data_Names,
		image_data: Image_Data,
		palette?: Palette_Names,
	): HTMLImageElement => {
		let { raw_image_list, image_data_list, assets_meta, raw_image_palette_swap_list } = _AM.static_vals;
	

		if(image_data.uses_palette_swap && palette){
			return raw_image_palette_swap_list[ asset_name ][ palette ];
		} else {
			return raw_image_list[ asset_name ]!;
		}
	},

/*----------------------- asset data accessors -----------------------*/
	get_animation_lengths_for_asset: (
		_AM: Asset_Manager_Data,
		asset_name: Image_Data_Names | 'omit_image',
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
	get_image_data_for_object: (me: Asset_Manager_Data, image_name: Image_Data_Names): Image_Data => {
		let { image_data_list } = me.static_vals;

		return image_data_list[image_name];
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