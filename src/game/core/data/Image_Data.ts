import { flatten } from "ramda";
import { ImageData } from "../engine/Asset_Manager";
import { Character_Image_Data } from "./Image_Data/Character_Image_Data";
import { Misc_Image_Data } from "./Image_Data/Misc_Image_Data";
import { UI_Tile_Image_Data } from "./Image_Data/UI_Tile_Image_Data";
import { Tile_Image_Data } from "./Image_Data/Tile_Image_Data";


export const image_data_list: Array<ImageData> = flatten([
	Character_Image_Data,
	Misc_Image_Data,
	Tile_Image_Data,
	UI_Tile_Image_Data,
]);
	
