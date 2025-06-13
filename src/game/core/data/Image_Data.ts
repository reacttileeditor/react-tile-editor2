import { concat, flatten, mergeDeepRight, mergeDeepWith, reduce, zipWith } from "ramda";
import { Image_Data, Image_Sequence_Dictionary } from "../engine/Asset_Manager/Asset_Manager";
import { Character_Image_Data } from "./Image_Data/Character_Image_Data";
import { Misc_Image_Data } from "./Image_Data/Misc_Image_Data";
import { UI_Tile_Image_Data } from "./Image_Data/UI_Tile_Image_Data";
import { Tile_Image_Data } from "./Image_Data/Tile_Image_Data";


// export const image_data_list: Array<Image_Data> = flatten([
// 	Character_Image_Data,
// 	Misc_Image_Data,
// 	Tile_Image_Data,
// 	UI_Tile_Image_Data,
// ]);

export type Image_Data_Dictionary = { [k: string]: Image_Data };


export type Image_Data_Names = (keyof typeof image_data_list)

export const image_data_list = reduce((acc: Image_Data_Dictionary, val: Image_Data_Dictionary) => mergeDeepRight( acc, val), {}, 
	[
		Character_Image_Data,
		Misc_Image_Data,
		Tile_Image_Data,
		UI_Tile_Image_Data,
	]
);
	
//const mergeArrays = (arr1: Image_Dictionary, arr2: Image_Dictionary) => concat(arr1, arr2);

///const mergedObj = mergeDeepRight( obj1, obj2);


export const image_sequence_data_list: Image_Sequence_Dictionary = {
	test_repeating_anim: ['animation_test', 'animation_test2', 'water-underlay'],
	wideleaf_scrub1: ['wideleaf_scrub1__anim1', 'wideleaf_scrub1__anim2', 'wideleaf_scrub1__anim3','wideleaf_scrub1__anim2b', 'wideleaf_scrub1__anim3b'],
	wideleaf_scrub2: ['wideleaf_scrub2__anim1', 'wideleaf_scrub2__anim2', 'wideleaf_scrub2__anim3','wideleaf_scrub2__anim2b', 'wideleaf_scrub2__anim3b'],
	water_sparkles: ['water_sparkles1', 'water_sparkles2', 'water_sparkles3', 'water_sparkles4', 'water_sparkles_blank1', 'water_sparkles_blank2'],
	water_ripples_1: ['water_ripples_1a','water_ripples_1b'],
	water_ripples_2: ['water_ripples_2a','water_ripples_2b','water_ripples_2c'],
	water_reeds_1: ['water_reeds_1a','water_reeds_1b','water_reeds_1c'],
}