import _, { isEmpty, isString, map, range, size } from "lodash";
import Prando from 'prando';
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../Blit_Manager";
import * as Utils from "../Utils";
import { Point2D, Rectangle } from '../../../interfaces';
import { asset_list } from "../../data/Asset_List";
import { is_all_true, ƒ } from "../Utils";
import { Dispatch, SetStateAction } from "react";
import { Tile_Name } from "../../data/Tile_Types";
import { Multi_Tile_Pattern } from "../../data/Multi_Tile_Patterns";
import { concat, filter, uniq } from "ramda";
import { Initialization } from "./Initialization";
import { Drawing } from "./Drawing";
import { Accessors } from "./Accessors";
import { Image_And_Image_Sequence_Data_Names, Image_Data_Dictionary, Image_Data_Names, Image_Data_Type, Image_Sequence_Dictionary } from "../../data/Image_Data";

export interface Image_Data {
	url: string,
	not_a_tile?: boolean,
	uses_team_color?: boolean, 
	bounds?: Rectangle,
	frames?: number,
	frame_duration?: number,
	ping_pong?: boolean,
	pad?: number,
};

export interface Static_Values {
	image_data_list: Image_Data_Type,
	image_sequence_data_list: Image_Sequence_Dictionary,
	raw_image_list: Image_Dictionary,
	raw_image_team_color_list: Image_List_Dictionary,
	assets_meta: Assets_Metadata_Dictionary,
	tile_types: Array<Tile_Item>,
	multi_tile_types: Array<Multi_Tile_Pattern>,
	post_loading_metadata: {
		max_mtp_width: number,
		max_mtp_height: number,
		max_asset_width: number,
		max_asset_height: number,
		max_asset_dimension: number,
	}
};

interface Image_Dictionary {
	[index: string]: HTMLImageElement
}

interface Image_List_Dictionary {
	[index: string]: Array<HTMLImageElement>
}


interface Assets_Metadata_Dictionary {
	[index: string]: Assets_Metadata_Spritesheet_Item|Assets_Metadata_Single_Image_Item,
}

export interface Assets_Metadata_Spritesheet_Item {
	preprocessed: boolean,
	dim: {
		w: number,
		h: number,
	},
	bounds: Rectangle,
}

export interface Assets_Metadata_Single_Image_Item {
	preprocessed: boolean,
	dim: {
		w: number,
		h: number,
	},
}

export interface Tile_Item {
	name: Tile_Name,
	omit_from_random_map_generation?: boolean,
	graphics: Array<Graphic_Item_Basic|Graphic_Item_Autotiled>,
};


export interface Graphic_Item_Basic {
	asset_variants: Array<Image_And_Image_Sequence_Data_Names>,
	zorder: number,
};

export interface Graphic_Item_Autotiled {
	asset_variants: Array<Image_And_Image_Sequence_Data_Names>,
	zorder: number,
	restrictions: Autotile_Restriction_Sample,
};




export interface Asset_Data_Record {
	raw_image: HTMLImageElement,
	image_data: Image_Data,
	metadata: Assets_Metadata_Spritesheet_Item|Assets_Metadata_Single_Image_Item
}

export type Graphic_Item_Generic = Graphic_Item_Autotiled|Graphic_Item_Basic;



type Tile_Comparator_Row_Outer = [string, string];
type Tile_Comparator_Row_Center = [string, string, string];
export type Tile_Comparator_Sample = [Tile_Comparator_Row_Outer, Tile_Comparator_Row_Center, Tile_Comparator_Row_Outer];


interface Tile_Position_Comparator_Row_Outer extends Array<Point2D> { 0: Point2D; 1: Point2D; }
interface Tile_Position_Comparator_Row_Center extends Array<Point2D> { 0: Point2D; 1: Point2D; 2: Point2D; }
export interface Tile_Position_Comparator_Sample extends Array<Tile_Position_Comparator_Row_Outer|Tile_Position_Comparator_Row_Center> { 0: Tile_Position_Comparator_Row_Outer, 1: Tile_Position_Comparator_Row_Center, 2: Tile_Position_Comparator_Row_Outer };


interface Autotile_Restriction_Row_Outer extends Array<RegExp> { 0: RegExp; 1: RegExp; }
interface Autotile_Restriction_Row_Center extends Array<RegExp> { 0: RegExp; 1: RegExp; 2: RegExp; }
export interface Autotile_Restriction_Sample extends Array<Autotile_Restriction_Row_Outer|Autotile_Restriction_Row_Center> { 0: Autotile_Restriction_Row_Outer, 1: Autotile_Restriction_Row_Center, 2: Autotile_Restriction_Row_Outer };

export type Image_List_Cache = Array<string|null>;














let null_tile_comparator: Tile_Comparator_Sample =	[
														['',''],
														['','',''],
														['','']
													];


export type Asset_Manager_Data = {
	consts: {
		tile_width: number,
		tile_height: number,
	};
	static_vals: Static_Values;
}
													
export const New_Asset_Manager = (): Asset_Manager_Data => {
	return {
		consts: {
			tile_width: 38, //38
			tile_height: 16, //21
		},

		static_vals: asset_list,
	}
}



export const Asset_Manager_ƒ = {
	...Initialization,
	...Accessors,
	...Drawing,

/*----------------------- Type Guards -----------------------*/
	//https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
	isAssetSpritesheet: ( asset: Assets_Metadata_Spritesheet_Item | Assets_Metadata_Single_Image_Item ): asset is Assets_Metadata_Spritesheet_Item => {
		return (<Assets_Metadata_Spritesheet_Item>asset).bounds !== undefined;
	},

	isGraphicAutotiled: ( graphic: Graphic_Item_Basic | Graphic_Item_Autotiled ): graphic is Graphic_Item_Autotiled => {
		return (<Graphic_Item_Autotiled>graphic).restrictions !== undefined;
	},

}