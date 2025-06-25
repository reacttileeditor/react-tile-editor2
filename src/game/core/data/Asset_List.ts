import { zorder } from "../constants/zorder";
import { Static_Values } from "../engine/Asset_Manager/Asset_Manager";
import { image_data_list, image_sequence_data_list } from "./Image_Data";
import { multi_tile_types } from "./Multi_Tile_Patterns";
import { tile_types } from "./Tile_Types";


export const asset_list: Static_Values = {
	image_data_list: image_data_list,
	image_sequence_data_list: image_sequence_data_list,


	raw_image_list: {},
	raw_image_palette_swap_list: {},
	assets_meta: {},
	
	tile_types: tile_types,
	multi_tile_types: multi_tile_types,
	post_loading_metadata: {
		max_mtp_width: 0,
		max_mtp_height: 0,
		max_asset_height: 0,
		max_asset_width: 0,
		max_asset_dimension: 0,
	}
};
	
