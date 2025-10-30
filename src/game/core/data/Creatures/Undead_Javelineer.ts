import { Creature_Animation_Chart } from "../../../objects_core/Creature/Creature";
import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";
import { Direction } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Image_Data_Names } from "../Image_Data";

export const CT_Undead_Javelineer_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 16,
	yield_creature_image: () => 'undead_javelineer_se_stand',
	yield_prettyprint_name: () => 'Hanged Man',
	yield_damage: (): number => ( 3 ),
	yield_weapon_range: () => 4,

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'undead_javelineer_ne_stand',
			'north_west':	'undead_javelineer_ne_stand',
			'east':			'undead_javelineer_ne_stand',
			'south_east':	'undead_javelineer_se_stand',
			'west':			'undead_javelineer_se_stand',
			'south_west':	'undead_javelineer_se_stand',	
		} as Creature_Animation_Chart)[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'undead_javelineer_ne_stand',
			'north_west':	'undead_javelineer_ne_stand',
			'east':			'undead_javelineer_ne_stand',
			'south_east':	'undead_javelineer_se_stand',
			'west':			'undead_javelineer_se_stand',
			'south_west':	'undead_javelineer_se_stand',	
		} as Creature_Animation_Chart)[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'undead_javelineer_ne_attack',
			'north_west':	'undead_javelineer_ne_attack',
			'east':			'undead_javelineer_ne_attack',
			'south_east':	'undead_javelineer_se_attack',
			'west':			'undead_javelineer_se_attack',
			'south_west':	'undead_javelineer_se_attack',	
		} as Creature_Animation_Chart)[direction]
	),

	action_delay_for_animation: (animation_name: string) => ( 42 ),
	yield_shot_type: () => ( 'shot_javelin' ),
}