import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";
import _, { Dictionary, cloneDeep, isArray, isEmpty, isEqual, map, range, size } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ, Image_List_Cache } from "../Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, ticks_to_ms } from "../Blit_Manager";
import * as Utils from "../Utils";
import { is_all_true, ƒ } from "../Utils";


import { Tile_Comparator_Sample, Tile_Position_Comparator_Sample } from "../Asset_Manager/Asset_Manager";
import { Point2D, Rectangle, PointCubic } from '../../../interfaces';
import localforage from "localforage";
import { concat, equals, filter, find, includes, keys, propEq, reduce, slice, uniq } from "ramda";
import { Page } from '@rsuite/icons';
import { Vals } from "../../constants/Constants";
import { Creature_Map_Instance, Game_Manager_ƒ } from "../Game_Manager/Game_Manager";
import { Creature_ƒ } from "../../../objects_core/Creature/Creature";
import { zorder } from "../../constants/zorder";

import * as builtin_levels from "../../../levels";
import { Map_Generation_ƒ } from "../Map_Generation";
import { boolean } from "yargs";
import { MTP_Anchor_Data } from "../../data/Multi_Tile_Patterns";
import { Cache_Data, Tilemap_Metadata, Tilemap_Persist_Data, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "./Tilemap_Manager";
import Prando from "prando";



console.log(builtin_levels);

const builtin_levelname_list = map(builtin_levels, (val,idx)=>{
	return idx
});

const builtin_level_array: 	{ [index: string]: Tilemap_Persist_Data } = {};
map(builtin_levels, (val,idx)=>{
	console.log(val)
	builtin_level_array[idx] = val as Tilemap_Persist_Data;
})

console.log(builtin_levelname_list);



export const metadata_init = {
	origin: {
		x: 0,
		y: 0,
	}
};

export const tile_maps_init = {
	terrain: [[]],
	move_map: [[]],
	real_path: [[]],
	prospective_path: [[]],
};



export const Tilemap_Manager_ƒ_Initialization = {

/*----------------------- initialization and asset loading -----------------------*/

	initialize_tiles: (me: Tilemap_Manager_Data, _AM: Asset_Manager_Data): Tilemap_Manager_Data => {
		return Map_Generation_ƒ.initialize_tiles_random(
			me,
			_AM,
		);
	},

	initialize_tileRNGs: () => (
		{
			//Prando allows seeding with a string, so on a lark we're using the tilemap name. 
			terrain: new Prando('terrain'),
			move_map: new Prando('move_map'),
			real_path: new Prando('real_path'),
			prospective_path: new Prando('prospective_path'),
		}
	),

	cleared_cache: () : Cache_Data => ({
		asset_blit_list_cache_by_tilemap: {
			terrain: [[[]]],
			move_map: [[[]]],
			real_path: [[[]]],
			prospective_path: [[[]]],
		}
	}),

/*----------------------- file writing -----------------------*/
	load_level: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
		level_name: string,
	): void => {
		let level_data: Tilemap_Persist_Data = {
			metadata: _.cloneDeep(metadata_init),
			tile_maps: _.cloneDeep(tile_maps_init),
			creature_list: [],
		};

		localforage.getItem<Tilemap_Persist_Data>(level_name).then((value) => {
			if(value != null){
				level_data = value;
			}

			set_Tilemap_Manager( {
				level_name: level_name,
				metadata: _.cloneDeep(level_data.metadata),
				tile_maps: _.cloneDeep(level_data.tile_maps),
				tile_RNGs: Tilemap_Manager_ƒ.initialize_tileRNGs(),
				creature_list: _.cloneDeep(level_data.creature_list),
				...Tilemap_Manager_ƒ.cleared_cache(),
				initialized: true,
			})
		}).catch((value) => {
			throw("couldn't load level")
			set_Tilemap_Manager(me);			
		});
	},

	save_level: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
		level_name: string,
		level_name_list: Array<string>
	): void => {
		if(level_name == 'level_names'){
			throw("if you're reading this, we should put in validation on the input field.")
		} else {
			const save_data: Tilemap_Persist_Data = {
				metadata: me.metadata,
				tile_maps: me.tile_maps,
				creature_list: me.creature_list,
			}

			localforage.setItem(level_name, save_data);
			localforage.setItem("level_names", uniq(concat(level_name_list, [level_name])));
			set_Tilemap_Manager( {
				...me,
				level_name: level_name,
			})
		}
	},

	export_level_to_clipboard: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
	): void => {
		const save_data: Tilemap_Persist_Data = {
			metadata: me.metadata,
			tile_maps: me.tile_maps,
			creature_list: me.creature_list,
		}

		const type = "text/plain";
		const blob = new Blob([ JSON.stringify(save_data) ], { type });
		const data = [new ClipboardItem({ [type]: blob })];
		
		navigator.clipboard.write(data).then(
			() => {
				/* success */
			},
			(err) => {

				throw err;
				alert('Unable to copy level data to clipboard.')
			},
		);
	},

	load_levelname_list: (
		set_level_filename_list: Dispatch<SetStateAction<Array<string>>>,
	): void => {
		localforage.getItem<Array<string>>('level_names').then((value) => {
			if(value != null){
				set_level_filename_list(value);
			}
		
		}).catch((value) => {
			throw("couldn't load level list")
		});
	},

	load_builtin_level_name_list: (
		set_builtin_level_filename_list: Dispatch<SetStateAction<Array<string>>>
	): void => {
		set_builtin_level_filename_list( builtin_levelname_list );
	},

	load_builtin_level: (
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
		level_name: string,
	): void => {
		set_Tilemap_Manager( Tilemap_Manager_ƒ.get_builtin_level(level_name));		
	},	

	get_builtin_level: (level_name: string): Tilemap_Manager_Data => {
		if(
			!includes(level_name, builtin_levelname_list)
		){
			throw(`The level ${level_name} is not in the default level name list.`)
		} else {
			let level_data = builtin_level_array[level_name]

			return {
				level_name: level_name,
				metadata: _.cloneDeep(level_data.metadata),
				tile_maps: _.cloneDeep(level_data.tile_maps),
				tile_RNGs: Tilemap_Manager_ƒ.initialize_tileRNGs(),
				creature_list: _.cloneDeep(level_data.creature_list),
				...Tilemap_Manager_ƒ.cleared_cache(),
				initialized: true,
			}		
		}

	},

	delete_level: (
		me: Tilemap_Manager_Data,
		_AM: Asset_Manager_Data,
		set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
		level_name: string,
		level_name_list: Array<string>
	): void => {
		if(level_name == 'level_names'){
			throw("if you're reading this, we should put in validation on the input field.")
		} else {
			localforage.setItem(level_name, null);
			localforage.setItem("level_names", uniq(filter((val)=>(val != level_name),level_name_list)));
		}
	},

	set_metadata: (me: Tilemap_Manager_Data, new_metadata: Tilemap_Metadata): Tilemap_Manager_Data => {
		/*
			TODO: we really ought to be doing something sophisticated here, but I'd like to pivot to having these map operations be totally non-destructive to your tiles.  I.e. all out-of-bounds tiles are preserved, the map is stored sparsely, etc, etc.   It's a tall ask, and probably something for an alternate git branch.

			So right now we're doing the most violent ape shit of just setting the values, and declaring "fuck it lmao" as to the consequences, in the finest traditions of Undefined Behavior.

			It's not useless; when we "handle the change gracefully", these set-variable parts will carry over unchanged, I'm just skipping an implementation of a far less graceful change to map boundaries.
		*/

		return {
			...me,
			metadata: _.cloneDeep(new_metadata),
		}
	},



}