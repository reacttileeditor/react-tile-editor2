import _, { isEmpty, isString, map, range, size } from "lodash";
import Prando from 'prando';
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../Blit_Manager";
import * as Utils from "../Utils";
import { Point2D, Rectangle } from '../../../interfaces';
import { asset_list } from "../../data/Asset_List";
import { is_all_true, ƒ } from "../Utils";
import { Dispatch, SetStateAction } from "react";
import { TileName } from "../../data/Tile_Types";
import { Multi_Tile_Pattern } from "../../data/Multi_Tile_Patterns";
import { concat, filter, uniq } from "ramda";
import { Initialization } from "./Initialization";
import { Drawing } from "./Drawing";

export interface Image_Data {
	url: string,
	not_a_tile?: boolean, 
	name: string,
	bounds?: Rectangle,
	frames?: number,
	frame_duration?: number,
	ping_pong?: boolean,
	pad?: number,
};

export interface StaticValues {
	image_data_list: Array<Image_Data>,
	raw_image_list: ImageDict,
	assets_meta: AssetsMetaDict,
	tile_types: Array<TileItem>,
	multi_tile_types: Array<Multi_Tile_Pattern>,
	multi_tile_pattern_metadata: {
		max_mtp_width: number,
		max_mtp_height: number,		
	}
};

interface ImageDict {
	[index: string]: HTMLImageElement
}

interface AssetsMetaDict {
	[index: string]: AssetsMetaSpritesheetItem|AssetsMetaSingleImage_Data,
}

interface AssetsMetaSpritesheetItem {
	preprocessed: boolean,
	dim: {
		w: number,
		h: number,
	},
	bounds: Rectangle,
}

interface AssetsMetaSingleImage_Data {
	preprocessed: boolean,
	dim: {
		w: number,
		h: number,
	},
}

export interface TileItem {
	name: TileName,
	omit_from_random_map_generation?: boolean,
	variants: Array<VariantItem>,
};

interface VariantItem {
	graphics: Array<GraphicItem|GraphicItemAutotiled>,
};

export interface GraphicItem {
	id: string,
	zorder: number,
};

interface GraphicItemAutotiled {
	id: string,
	zorder: number,
	restrictions: AutoTileRestrictionSample,
};

type GraphicItemGeneric = GraphicItemAutotiled|GraphicItem;



type TileComparatorRow = [string, string];
type TileComparatorRowCenter = [string, string, string];
export type TileComparatorSample = [TileComparatorRow, TileComparatorRowCenter, TileComparatorRow];


interface TilePositionComparatorRow extends Array<Point2D> { 0: Point2D; 1: Point2D; }
interface TilePositionComparatorRowCenter extends Array<Point2D> { 0: Point2D; 1: Point2D; 2: Point2D; }
export interface TilePositionComparatorSample extends Array<TilePositionComparatorRow|TilePositionComparatorRowCenter> { 0: TilePositionComparatorRow, 1: TilePositionComparatorRowCenter, 2: TilePositionComparatorRow };


interface AutoTileRestrictionRow extends Array<RegExp> { 0: RegExp; 1: RegExp; }
interface AutoTileRestrictionRowCenter extends Array<RegExp> { 0: RegExp; 1: RegExp; 2: RegExp; }
export interface AutoTileRestrictionSample extends Array<AutoTileRestrictionRow|AutoTileRestrictionRowCenter> { 0: AutoTileRestrictionRow, 1: AutoTileRestrictionRowCenter, 2: AutoTileRestrictionRow };

export type ImageListCache = Array<string|null>;














let null_tile_comparator: TileComparatorSample =	[
														['',''],
														['','',''],
														['','']
													];


export type Asset_Manager_Data = {
	consts: {
		tile_width: number,
		tile_height: number,
	};
	static_vals: StaticValues;
	TileRNG: Prando;
}
													
export const New_Asset_Manager = (): Asset_Manager_Data => {
	return {
		consts: {
			tile_width: 38, //38
			tile_height: 16, //21
		},

		static_vals: asset_list,
		
		TileRNG: new Prando(),
	}
}



export const Asset_Manager_ƒ = {
	...Initialization,
	...Drawing,

/*----------------------- initialization and asset loading -----------------------*/
	//https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
	isAssetSpritesheet: ( asset: AssetsMetaSpritesheetItem | AssetsMetaSingleImage_Data ): asset is AssetsMetaSpritesheetItem => {
		return (<AssetsMetaSpritesheetItem>asset).bounds !== undefined;
	},

	isGraphicAutotiled: ( graphic: GraphicItem | GraphicItemAutotiled ): graphic is GraphicItemAutotiled => {
		return (<GraphicItemAutotiled>graphic).restrictions !== undefined;
	},


	yield_asset_name_list: (me: Asset_Manager_Data) => {
		return _.filter(
			me.static_vals.image_data_list,
			(value, index) => {
				return value.not_a_tile !== true;
			}
		).map( (value,index) => {
			return value.name;
		})
	},

	yield_tile_name_list: (me: Asset_Manager_Data) => {
		return _.sortedUniq(
			_.map( 
				_.filter(me.static_vals.tile_types, (val) => (val.omit_from_random_map_generation != true)),
				(value,index)=>(value.name)
			)
		);
	},

	yield_full_zorder_list: (me: Asset_Manager_Data) => {
			/*
				Step through each of the levels of the tile_types list, and spit out just the zorder values.   This leaves us with a nested structure (the same as the original tile data object's structure), and what we really want to do is just boil it down to a straight list, and figure out which ones are unique. 
			*/
		return  _.sortBy(
				_.uniq(
				_.flatten(
				_.flatten(
					_.map( me.static_vals.tile_types, (value,index)=>{
						return _.map( value.variants,  (value,index)=>{
							return _.map( value.graphics, (value,index)=>{
								return value.zorder;
							});
						}) 
					} )
			))));
	},




/*----------------------- object draw ops -----------------------*/
	get_image_data_for_object: (me: Asset_Manager_Data, image_name: string):Image_Data|undefined => {
		let { image_data_list } = me.static_vals;

		return _.find( image_data_list, (value, index) => (value.name == image_name) );
	},


/*----------------------- tile draw ops -----------------------*/

	get_tile_variant_data: (me: Asset_Manager_Data, tile_name: string): Array<VariantItem> => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = me.static_vals;

		let markup_data_for_tile = _.find( tile_types, (value, index) => (value.name == tile_name))
		
		if(markup_data_for_tile == undefined){
			console.error(`Nothing found in asset list for tile type ${tile_name}`);
			return [];
		} else {
			return markup_data_for_tile.variants;
		}
	},
	


	get_all_asset_data_for_tile_type: (
		me: Asset_Manager_Data,
		tile_name: string
	):Array<GraphicItemGeneric> => {
		
		if( tile_name != '' ){
			let tile_variants = Asset_Manager_ƒ.get_tile_variant_data(me, tile_name);

			if( _.size(tile_variants) ){
				let tile_data = tile_variants[Asset_Manager_ƒ._tile_dice( me, tile_variants.length ) -1].graphics
				
				return tile_data;
			} else {
				return [];
			}
		} else {
			return [];
		}
	},

	yield_asset_list_for_tile_type_with_comparator: (
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		tile_name: string,
		comparator: TileComparatorSample,
	): Array<GraphicItem> => {

		let asset_data_array = Asset_Manager_ƒ.get_all_asset_data_for_tile_type(_AM, tile_name);

		var allow_drawing = true;
		
		const asset_blit_items = asset_data_array.map( (value, index) => {
		
			if(  Asset_Manager_ƒ.isGraphicAutotiled(value) ){
				//this is where 
				allow_drawing = Asset_Manager_ƒ.should_we_draw_this_tile_based_on_its_autotiling_restrictions(comparator, value.restrictions);
			} 

			if( value.id && allow_drawing ){
				return {
					id: value.id,
					zorder: value.zorder,
				};
			}
		});

		return filter((val)=>(val !== undefined), asset_blit_items) as Array<GraphicItem>;
	},


	yield_zorder_list_for_tile: (me: Asset_Manager_Data, tile_name: string): Array<number> => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = me.static_vals;
		
		
		let variant_graphic_sets: Array<Array<GraphicItem|GraphicItemAutotiled>> = _.map( Asset_Manager_ƒ.get_tile_variant_data(me, tile_name), (val) => (val.graphics) );
	
		let number_arrays: Array<Array<number>> = _.map( variant_graphic_sets, (val) => {
			return _.map(val, (val2) => (val2.zorder))
		} );
	
		let combined_number_arrays: Array<number> = _.flatten(number_arrays);
	
		let final_array: Array<number> = _.uniq(combined_number_arrays);
	
		return final_array ? final_array : [];
		
	},

	

	

	



	get_raw_image_for_asset_name: (
		_AM: Asset_Manager_Data,
		asset_name: string,
	): HTMLImageElement => {
		let { raw_image_list, image_data_list, assets_meta } = _AM.static_vals;

		return raw_image_list[ asset_name ]!;
	},

	get_image_data_for_asset_name: (
		_AM: Asset_Manager_Data,
		asset_name: string,
	): Image_Data|undefined => {
		let { raw_image_list, image_data_list, assets_meta } = _AM.static_vals;

		return _.find(image_data_list, {name: asset_name});
	},

	get_image_metadata_for_asset_name: (
		_AM: Asset_Manager_Data,
		asset_name: string,
	): AssetsMetaSpritesheetItem|AssetsMetaSingleImage_Data => {
		let { raw_image_list, image_data_list, assets_meta } = _AM.static_vals;

		return assets_meta[ asset_name ]!;
	},



	
/*----------------------- utility functions -----------------------*/
	_tile_dice: (me: Asset_Manager_Data, sides: number) => (
		Utils.dice_anchored_on_specific_random_seed( sides, me.TileRNG )
	),
}