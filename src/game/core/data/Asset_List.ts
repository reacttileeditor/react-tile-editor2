import { zorder } from "../constants/zorder";
import { StaticValues } from "../engine/Asset_Manager";
import { image_data_list } from "./Image_Data";
import { tile_types } from "./Tile_Types";

/*
		special notes on this horrifying "negative match" regex:
		https://stackoverflow.com/questions/6449131/javascript-regular-expression-to-not-match-a-word
		https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
*/

export const asset_list: StaticValues = {
	image_data_list: image_data_list,


	raw_image_list: {},
	assets_meta: {},
	
	tile_types: tile_types
};
	
