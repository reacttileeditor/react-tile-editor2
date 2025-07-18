import { keys, map, range, size } from "lodash";
import { zorder } from "../constants/zorder";
import { Asset_Manager_Data, Asset_Manager_ƒ, Static_Values, Tile_Item } from "../engine/Asset_Manager/Asset_Manager";
import { Tile_Name } from "./Tile_Types";
import * as Utils from "../engine/Utils";

/*
		special notes on this horrifying "negative match" regex:
		https://stackoverflow.com/questions/6449131/javascript-regular-expression-to-not-match-a-word
		https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
*/


export type Blob_Profile_Name = 'stone' | 'prairie' | 'water' | 'lawn' | 'highlands' | 'crags' | 'sandpatch';

export const Mapgen_Profile_ƒ = {
	yield_blob_profile_name_list: (): Array<Blob_Profile_Name> => {
		return keys(Blob_Profile_Data) as Array<Blob_Profile_Name>;
	},

	get_random_profile_name: (): Blob_Profile_Name => {
		const profile_names: Array<Blob_Profile_Name> = Mapgen_Profile_ƒ.yield_blob_profile_name_list();

		return profile_names[
			Utils.dice( size( profile_names ) ) -1 
		];
	},

	produce_array_of_tiles_for_profile: (profile_name: Blob_Profile_Name): Array<Tile_Name> => {
		const blob_data = Blob_Profile_Data[profile_name];
		const tile_array: Array<Tile_Name> = [];

		map(
			blob_data,
			(count: number, blob_name: Tile_Name)=>{
				let iter = count as unknown as number;

				while(iter > 0){
					iter--;

					tile_array.push(blob_name)
				}
			}
		);

		return tile_array;
	},

	get_random_tile_name_from_profile: (profile_name: Blob_Profile_Name): Tile_Name => {
		const random_tile_possibilities: Array<Tile_Name> = Mapgen_Profile_ƒ.produce_array_of_tiles_for_profile(profile_name);

		return random_tile_possibilities[
			Utils.dice( size( random_tile_possibilities ) ) -1 
		]
	},
}


export type Blob_Profiles = {
	[key in Blob_Profile_Name]: {
		[key in Tile_Name]?: number
	}
}


export const Blob_Profile_Data: Blob_Profiles = {
	stone: {
		'menhir-big': 1,
	},
	water: {
		'water': 2,
		'water-placid': 5,
	}, 
	lawn: {
		'grass': 11,
		"dirt": 2,
		'wideleaf_scrub': 1,
		"scrub-dirt": 2,
	},
	prairie: {
		'grass': 3,
		"grass-and-scree": 3,
		'wideleaf_scrub': 4,
		"dirt": 4,
		"sandy-dirt": 1,
		"scrub-dirt": 5,
		"bush": 1,
	},
	crags: {
		'menhir-big': 7,
		'wideleaf_scrub': 1,
		"grass-and-scree": 3,
		"dirt": 1,
		"scrub-dirt": 2,
	},
	sandpatch: {
		'sand': 3,
		"grass-and-scree": 3,
		'wideleaf_scrub': 2,
		"dirt": 4,
		"sandy-dirt": 5,
		"scrub-dirt": 2,
		"bush": 1,
	},
	highlands: {
		'grass': 2,
		'wideleaf_scrub': 2,
		"grass-and-scree": 5,
		"dirt": 4,
		"bush": 2,
		"sandy-dirt": 1,
		"scrub-dirt": 5,
		"scrub-dirt-tall": 3,
		"menhir-small": 3,
	}
};



