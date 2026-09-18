import { Creature_Animation_Chart } from "../../../objects_core/Creature/Creature";
import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";
import { Direction } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Image_Data_Names } from "../Image_Data";


export const CT_Human_Archer_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 10,
	yield_creature_image: () => 'human_archer_se_stand',
	yield_prettyprint_name: () => 'Archer',
	yield_damage: (): number => ( 7 ),
	yield_weapon_range: () => 10,


	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'human_archer_ne_stand',
			'north_west':	'human_archer_ne_stand',
			'east':			'human_archer_ne_stand',
			'south_east':	'human_archer_se_stand',
			'west':			'human_archer_se_stand',
			'south_west':	'human_archer_se_stand',	
		} as Creature_Animation_Chart)[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'human_archer_ne_stand',
			'north_west':	'human_archer_ne_stand',
			'east':			'human_archer_ne_stand',
			'south_east':	'human_archer_se_stand',
			'west':			'human_archer_se_stand',
			'south_west':	'human_archer_se_stand',	
		} as Creature_Animation_Chart)[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'human_archer_ne_stand',
			'north_west':	'human_archer_ne_stand',
			'east':			'human_archer_ne_stand',
			'south_east':	'human_archer_se_stand',
			'west':			'human_archer_se_stand',
			'south_west':	'human_archer_se_stand',	
		} as Creature_Animation_Chart)[direction]
	),

	action_delay_for_animation: (animation_name: string) => ( 32 ),
	yield_shot_type: () => ( 'shot_arrow' ),

	yield_pixel_height: () => 47,
}