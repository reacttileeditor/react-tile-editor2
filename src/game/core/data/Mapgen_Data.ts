import { keys, map, range } from "lodash";
import { zorder } from "../constants/zorder";
import { StaticValues, TileItem } from "../engine/Asset_Manager";
import { TileName } from "./Tile_Types";

/*
		special notes on this horrifying "negative match" regex:
		https://stackoverflow.com/questions/6449131/javascript-regular-expression-to-not-match-a-word
		https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
*/


export type BlobProfileName = 'stone' | 'prairie' | 'water';

export const Mapgen_Profile_ƒ = {
	yield_blob_profile_name_list: () => {
		return keys(Blob_Profile_Data);
	},

	produce_array_of_tiles_for_profile: (profile_name: BlobProfileName): Array<TileName> => {
		const blob_data = Blob_Profile_Data[profile_name];
		const tile_array: Array<TileName> = [];

		map(
			blob_data,
			(count: number, blob_name: TileName)=>{
				let iter = count as unknown as number;

				while(iter > 0){
					iter--;

					tile_array.push(blob_name)
				}
			}
		);

		return tile_array;
	}
}


export type BlobProfiles = {
	[key in BlobProfileName]: {
		[key in TileName]?: number
	}
}


export const Blob_Profile_Data: BlobProfiles = {
	stone: {
		'menhir2': 1
	},
	water: {
		'water': 5,
		'water-placid': 3,
	}, 
	prairie: {
		'grass': 5,
		"grass-and-scree": 3,
		"dirt": 4,
		"sandy-dirt": 1,
		"scrub-dirt": 3,		
	}
};



