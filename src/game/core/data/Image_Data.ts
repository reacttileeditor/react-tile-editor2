import { concat, flatten, mergeDeepRight, mergeDeepWith, reduce, zipWith } from "ramda";
import { Image_Data } from "../engine/Asset_Manager/Asset_Manager";
import { Character_Image_Data, Character_Image_Data_Type } from "./Image_Data/Character_Image_Data";
import { Misc_Image_Data, Misc_Image_Data_Type } from "./Image_Data/Misc_Image_Data";
import { UI_Tile_Image_Data, UI_Tile_Image_Data_Type } from "./Image_Data/UI_Tile_Image_Data";
import { Tile_Image_Data, Tile_Image_Data_Type } from "./Image_Data/Tile_Image_Data";



export type Image_Data_Dictionary = { [k: string]: Image_Data };


export const image_data_list: Image_Data_Names = reduce((acc: any, val: any) => mergeDeepRight( acc, val), {}, 
	[
		Character_Image_Data,
		Misc_Image_Data,
		Tile_Image_Data,
		UI_Tile_Image_Data,
	]
);

export type Image_Data_Names = (keyof Image_Data_Type);

export type Image_And_Image_Sequence_Data_Names = Image_Data_Names| Image_Sequence_Dictionary_Names;


export type Image_Data_Type = 
 	Character_Image_Data_Type &
	Misc_Image_Data_Type &
	Tile_Image_Data_Type &
	UI_Tile_Image_Data_Type; 


	



//type Image_Sequence_Dictionary_Names = 'test_repeating_anim' | 'wideleaf_scrub1' | 'wideleaf_scrub2' | 'water_sparkles' | 'water_ripples_1' | 'water_ripples_2' | 'water_reeds_1';





export type Image_Sequence_Dictionary_Names = (keyof Image_Sequence_Dictionary)

// export type _Image_Sequence_Dictionary = {
//     [Property in (keyof typeof image_sequence_data_list) as `${string & Property}`]:  Array<Image_Data_Names>
// };

export type Image_Sequence_Dictionary = typeof image_sequence_data_list;

export const image_sequence_data_list = {
	test_repeating_anim: ['animation_test', 'animation_test2', 'water-underlay'] as Array<Image_Data_Names>,
	wideleaf_scrub1: ['wideleaf_scrub1__anim1', 'wideleaf_scrub1__anim2', 'wideleaf_scrub1__anim3','wideleaf_scrub1__anim2b', 'wideleaf_scrub1__anim3b'] as Array<Image_Data_Names>,
	wideleaf_scrub2: ['wideleaf_scrub2__anim1', 'wideleaf_scrub2__anim2', 'wideleaf_scrub2__anim3','wideleaf_scrub2__anim2b', 'wideleaf_scrub2__anim3b'] as Array<Image_Data_Names>,
	water_sparkles: ['water_sparkles1', 'water_sparkles2', 'water_sparkles3', 'water_sparkles4', 'water_sparkles_blank1', 'water_sparkles_blank2'] as Array<Image_Data_Names>,
	water_ripples_1: ['water_ripples_1a','water_ripples_1b'] as Array<Image_Data_Names>,
	water_ripples_2: ['water_ripples_2a','water_ripples_2b','water_ripples_2c'] as Array<Image_Data_Names>,
	water_reeds_1: ['water_reeds_1a','water_reeds_1b','water_reeds_1c'] as Array<Image_Data_Names>,
}

