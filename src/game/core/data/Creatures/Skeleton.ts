import { Creature_Animation_Chart } from "../../../objects_core/Creature/Creature";
import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";
import { Direction } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Image_Data_Names } from "../Image_Data";


export const CT_Skeleton_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 8,
	yield_creature_image: () => 'skeleton_warrior_stand_se',
	yield_prettyprint_name: () => 'Skeleton',
	yield_damage: (): number => ( 2 ),

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'skeleton-ne',
			'north_west':	'skeleton-ne',
			'east':			'skeleton-ne',
			'south_east':	'skeleton_warrior_stand_se',
			'west':			'skeleton_warrior_stand_se',
			'south_west':	'skeleton_warrior_stand_se',	
		} as Creature_Animation_Chart)[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'skeleton-ne-walk',
			'north_west':	'skeleton-ne-walk',
			'east':			'skeleton-ne-walk',
			'south_east':	'skeleton-se-walk',
			'west':			'skeleton-se-walk',
			'south_west':	'skeleton-se-walk',	
		} as Creature_Animation_Chart)[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'skeleton-se-attack',
			'north_west':	'skeleton-se-attack',
			'east':			'skeleton-se-attack',
			'south_east':	'skeleton-se-attack',
			'west':			'skeleton-se-attack',
			'south_west':	'skeleton-se-attack',	
		} as Creature_Animation_Chart)[direction]
	),

	action_delay_for_animation: (animation_name: string) => ( 36 ),

}
