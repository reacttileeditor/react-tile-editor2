import { Creature_Animation_Chart } from "../../../objects_core/Creature/Creature";
import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";
import { Direction } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Image_Data_Names } from "../Image_Data";



export const CT_Hermit_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () =>  10,
	yield_creature_image: () => 'human_hermit_se_stand',
	yield_prettyprint_name: () => 'Hermit',
	yield_weapon_range: () => 14,

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			north_east:	'human_hermit_ne_stand',
			north_west:	'human_hermit_ne_stand',
			east:		'human_hermit_ne_stand',
			south_east:	'human_hermit_se_stand',
			west:		'human_hermit_se_stand',
			south_west:	'human_hermit_se_stand',	
		} as Creature_Animation_Chart)[direction]
	),


	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'human_hermit_ne_walk',
			'north_west':	'human_hermit_ne_walk',
			'east':			'human_hermit_ne_walk',
			'south_east':	'human_hermit_se_walk',
			'west':			'human_hermit_se_walk',
			'south_west':	'human_hermit_se_walk',	
		} as Creature_Animation_Chart)[direction]
	),

	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'human_hermit_se_attack',
			'north_west':	'human_hermit_se_attack',
			'east':			'human_hermit_se_attack',
			'south_east':	'human_hermit_se_attack',
			'west':			'human_hermit_se_attack',
			'south_west':	'human_hermit_se_attack',	
		} as Creature_Animation_Chart)[direction]
	),


	action_delay_for_animation: (animation_name: string) => ( 30 ),
	yield_shot_type: () => ( 'shot_magic_missile' ),

	yield_shot_offset: () => ({x: 10, y: -30}),

}
