import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";
import _, { Dictionary, cloneDeep, isArray, isEmpty, isEqual, map, range, size } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ, Graphic_Item_Basic, Image_List_Cache } from "../Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "../Blit_Manager";
import * as Utils from "../Utils";
import { is_all_true, ƒ } from "../Utils";


import { Tile_Comparator_Sample, Tile_Position_Comparator_Sample } from "../Asset_Manager/Asset_Manager";
import { Point2D, Rectangle, PointCubic } from '../../../interfaces';
import localforage from "localforage";
import { concat, equals, filter, find, includes, keys, propEq, reduce, slice, uniq } from "ramda";
import { Page } from '@rsuite/icons';
import { Vals } from "../../constants/Constants";
import { Creature_Map_Instance, Game_Manager_ƒ } from "../Game_Manager";
import { Creature_ƒ } from "../../../objects_core/Creature";
import { zorder } from "../../constants/zorder";

import * as builtin_levels from "../../../levels";
import { Map_Generation_ƒ } from "../Map_Generation";
import { boolean } from "yargs";
import { MTP_Anchor_Data } from "../../data/Multi_Tile_Patterns";
import { Tilemap_Manager_ƒ_Drawing } from "./Drawing";
import { Tilemap_Manager_ƒ_State_Management } from "./State_Management";
import { Tilemap_Manager_ƒ_Initialization, metadata_init, tile_maps_init } from "./Initialization";


export type Tile_View_State = {
	level_name: string,
	metadata: Tilemap_Metadata,
	tile_maps: Tilemaps,
	creature_list: Array<Creature_Map_Instance>,
	initialized: boolean,
} & Cache_Data;

export type Cache_Data = {
	asset_blit_list_cache: Asset_Blit_Tilemap,
}

export type Asset_Blit_Tilemap = Array<Array<Asset_Blit_List>>;

export type Asset_Blit_List = Array<Asset_Blit_Item>;

export type Asset_Blit_Item = {
	id: string,
	zorder: number,
}

export type Tilemap_Persist_Data = {
	tile_maps: Tilemaps,
	metadata: Tilemap_Metadata,
	creature_list: Array<Creature_Map_Instance>,
};

export type Tilemap_Size_Metadata = {
	origin: Point2D,
};

export type Tilemap_Metadata = Tilemap_Size_Metadata;

type TileComparatorMap = Array<Array<Tile_Comparator_Sample|undefined>>;

interface _Tilemaps<T> {
	terrain: T,
	ui: T,
}

export type Tilemaps =  _Tilemaps<Tilemap_Single>;

export type Tilemap_Keys = keyof Tilemaps;

export type Tilemap_Single = Array<Array<string>>;

export type Direction = 
	'north_east' |
	'east' |
	'south_east' |
	'north_west' |
	'west' |
	'south_west';






export type Tilemap_Manager_Data = Tile_View_State & Cache_Data;


export const New_Tilemap_Manager = (): Tilemap_Manager_Data => {
	
	return {
		level_name: '',
		metadata: _.cloneDeep(metadata_init),
		tile_maps: _.cloneDeep(tile_maps_init),
		creature_list: [],
		asset_blit_list_cache: [[[]]],
		initialized: false,
	}
}


export const Tilemap_Manager_ƒ = {
	...Tilemap_Manager_ƒ_Drawing,
	...Tilemap_Manager_ƒ_State_Management,
	...Tilemap_Manager_ƒ_Initialization,
}