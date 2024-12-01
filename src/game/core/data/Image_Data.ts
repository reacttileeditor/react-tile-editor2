import { flatten } from "ramda";
import { Image_Data, Image_Sequence_Dictionary } from "../engine/Asset_Manager/Asset_Manager";
import { Character_Image_Data } from "./Image_Data/Character_Image_Data";
import { Misc_Image_Data } from "./Image_Data/Misc_Image_Data";
import { UI_Tile_Image_Data } from "./Image_Data/UI_Tile_Image_Data";
import { Tile_Image_Data } from "./Image_Data/Tile_Image_Data";


export const image_data_list: Array<Image_Data> = flatten([
	Character_Image_Data,
	Misc_Image_Data,
	Tile_Image_Data,
	UI_Tile_Image_Data,
]);
	
export const image_sequence_data_list: Image_Sequence_Dictionary = {
	test_repeating_anim: ['animation_test', 'animation_test2', 'water-underlay'],
	wideleaf_scrub1: ['wideleaf_scrub1__anim1', 'wideleaf_scrub1__anim2', 'wideleaf_scrub1__anim3','wideleaf_scrub1__anim2b', 'wideleaf_scrub1__anim3b'],
	wideleaf_scrub2: ['wideleaf_scrub2__anim1', 'wideleaf_scrub2__anim2', 'wideleaf_scrub2__anim3','wideleaf_scrub2__anim2b', 'wideleaf_scrub2__anim3b'],
	water_sparkles: ['water_sparkles1', 'water_sparkles2', 'water_sparkles3', 'water_sparkles4', 'water_sparkles_blank1', 'water_sparkles_blank2'],
}