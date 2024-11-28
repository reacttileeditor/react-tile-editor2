import { zorder } from "../constants/zorder";
import { Static_Values } from "../engine/Asset_Manager/Asset_Manager";
import { image_data_list } from "./Image_Data";
import { multi_tile_types } from "./Multi_Tile_Patterns";
import { tile_types } from "./Tile_Types";


export const asset_list: Static_Values = {
	image_data_list: image_data_list,


	raw_image_list: {},
	assets_meta: {},
	
	tile_types: tile_types,
	multi_tile_types: multi_tile_types,
	multi_tile_pattern_metadata: {
		max_mtp_width: 0,
		max_mtp_height: 0,		
	}
};
	
