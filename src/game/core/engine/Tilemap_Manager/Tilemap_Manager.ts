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


export type TileViewState = {
	level_name: string,
	metadata: MetaData,
	tile_maps: TileMaps,
	creature_list: Array<Creature_Map_Instance>,
	initialized: boolean,
} & CacheData;

export type CacheData = {
	asset_blit_list_cache: Asset_Blit_Tilemap,
}

export type Asset_Blit_Tilemap = Array<Array<Asset_Blit_List>>;

export type Asset_Blit_List = Array<GraphicItem>;



export type TileMapPersistData = {
	tile_maps: TileMaps,
	metadata: MetaData,
	creature_list: Array<Creature_Map_Instance>,
};

export type SizeMetaData = {
	origin: Point2D,
};

export type MetaData = SizeMetaData;

type TileComparatorMap = Array<Array<TileComparatorSample|undefined>>;

interface _TileMaps<T> {
	terrain: T,
	ui: T,
}

export type TileMaps =  _TileMaps<TileMap>;

export type TileMapKeys = keyof TileMaps;

export type TileMap = Array<Array<string>>;

export type Direction = 
	'north_east' |
	'east' |
	'south_east' |
	'north_west' |
	'west' |
	'south_west';






export type Tilemap_Manager_Data = TileViewState & CacheData;


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