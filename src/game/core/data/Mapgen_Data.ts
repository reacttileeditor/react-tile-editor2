import { zorder } from "../constants/zorder";
import { StaticValues, TileItem } from "../engine/Asset_Manager";
import { TileName } from "./Tile_Types";

/*
		special notes on this horrifying "negative match" regex:
		https://stackoverflow.com/questions/6449131/javascript-regular-expression-to-not-match-a-word
		https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
*/




export interface BlobProfiles {
	[index: string]: {
		[key in TileName]: number
	}
}

export const BlobProfileData = {
	stone: {
		'menhir2': 1
	},
	prairie: {
		'grass': 5,
		"grass-and-scree": 3,
		"dirt": 4,
		"sandy-dirt": 1,
		"scrub-dirt": 3,		
	}
};



