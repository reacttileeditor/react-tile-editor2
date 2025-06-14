import { Creature_Animation_Chart } from "../../../objects_core/Creature/Creature";
import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";
import { Direction } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Image_Data_Names } from "../Image_Data";


export const CT_Human_Footman_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 10,
	yield_creature_image: () => 'human_footman_se_stand',
	yield_prettyprint_name: () => 'Footman',
	yield_damage: (): number => ( 7 ),

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'human_footman_ne_stand',
			'north_west':	'human_footman_ne_stand',
			'east':			'human_footman_ne_stand',
			'south_east':	'human_footman_se_stand',
			'west':			'human_footman_se_stand',
			'south_west':	'human_footman_se_stand',	
		} as Creature_Animation_Chart)[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'human_footman_ne_walk',
			'north_west':	'human_footman_ne_walk',
			'east':			'human_footman_ne_walk',
			'south_east':	'human_footman_se_walk',
			'west':			'human_footman_se_walk',
			'south_west':	'human_footman_se_walk',	
		} as Creature_Animation_Chart)[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'human_footman_ne_attack',
			'north_west':	'human_footman_ne_attack',
			'east':			'human_footman_ne_attack',
			'south_east':	'human_footman_se_attack',
			'west':			'human_footman_se_attack',
			'south_west':	'human_footman_se_attack',	
		} as Creature_Animation_Chart)[direction]
	),

	action_delay_for_animation: (animation_name: string) => ( 32 ),
}