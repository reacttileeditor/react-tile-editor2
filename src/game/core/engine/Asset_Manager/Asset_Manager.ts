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
import { Accessors } from "./Accessors";

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

export interface AssetsMetaSpritesheetItem {
	preprocessed: boolean,
	dim: {
		w: number,
		h: number,
	},
	bounds: Rectangle,
}

export interface AssetsMetaSingleImage_Data {
	preprocessed: boolean,
	dim: {
		w: number,
		h: number,
	},
}

export interface TileItem {
	name: TileName,
	omit_from_random_map_generation?: boolean,
	variants: Array<Variant_Item>,
};

export interface Variant_Item {
	graphics: Array<GraphicItem|GraphicItemAutotiled>,
};

export interface GraphicItem {
	id: string,
	zorder: number,
};

export interface GraphicItemAutotiled {
	id: string,
	zorder: number,
	restrictions: AutoTileRestrictionSample,
};

export type GraphicItemGeneric = GraphicItemAutotiled|GraphicItem;



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
	...Accessors,
	...Drawing,

/*----------------------- Type Guards -----------------------*/
	//https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
	isAssetSpritesheet: ( asset: AssetsMetaSpritesheetItem | AssetsMetaSingleImage_Data ): asset is AssetsMetaSpritesheetItem => {
		return (<AssetsMetaSpritesheetItem>asset).bounds !== undefined;
	},

	isGraphicAutotiled: ( graphic: GraphicItem | GraphicItemAutotiled ): graphic is GraphicItemAutotiled => {
		return (<GraphicItemAutotiled>graphic).restrictions !== undefined;
	},

}