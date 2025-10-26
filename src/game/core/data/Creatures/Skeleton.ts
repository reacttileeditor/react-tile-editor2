import { Creature_Animation_Chart } from "../../../objects_core/Creature/Creature";
import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";
import { Direction } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Image_Data_Names } from "../Image_Data";


export const CT_Skeleton_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 8,
	yield_creature_image: () => 'skeleton_warrior_se_stand',
	yield_prettyprint_name: () => 'Skeleton',
	yield_damage: (): number => ( 2 ),

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'skeleton_warrior_ne_stand',
			'north_west':	'skeleton_warrior_ne_stand',
			'east':			'skeleton_warrior_ne_stand',
			'south_east':	'skeleton_warrior_se_stand',
			'west':			'skeleton_warrior_se_stand',
			'south_west':	'skeleton_warrior_se_stand',	
		} as Creature_Animation_Chart)[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'skeleton_warrior_ne_walk',
			'north_west':	'skeleton_warrior_ne_walk',
			'east':			'skeleton_warrior_ne_walk',
			'south_east':	'skeleton_warrior_se_walk',
			'west':			'skeleton_warrior_se_walk',
			'south_west':	'skeleton_warrior_se_walk',	
		} as Creature_Animation_Chart)[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'skeleton_warrior_ne_attack',
			'north_west':	'skeleton_warrior_ne_attack',
			'east':			'skeleton_warrior_ne_attack',
			'south_east':	'skeleton_warrior_se_attack',
			'west':			'skeleton_warrior_se_attack',
			'south_west':	'skeleton_warrior_se_attack',	
		} as Creature_Animation_Chart)[direction]
	),

	action_delay_for_animation: (animation_name: string) => ( 36 ),

}
