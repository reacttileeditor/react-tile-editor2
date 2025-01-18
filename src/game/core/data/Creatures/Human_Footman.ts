import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";
import { Direction } from "../../engine/Tilemap_Manager/Tilemap_Manager";


export const CT_Human_Footman_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 10,
	yield_creature_image: () => 'human_footman_se_stand',
	yield_prettyprint_name: () => 'Footman',
	yield_damage: (): number => ( 7 ),

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction):string => (
		{
			'north_east':	'human_footman_ne_stand',
			'north_west':	'human_footman_ne_stand',
			'east':			'human_footman_ne_stand',
			'south_east':	'human_footman_se_stand',
			'west':			'human_footman_se_stand',
			'south_west':	'human_footman_se_stand',	
		}[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction):string => (
		{
			'north_east':	'human_footman_ne_walk',
			'north_west':	'human_footman_ne_walk',
			'east':			'human_footman_ne_walk',
			'south_east':	'human_footman_se_walk',
			'west':			'human_footman_se_walk',
			'south_west':	'human_footman_se_walk',	
		}[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction):string => (
		{
			'north_east':	'human_footman_ne_attack',
			'north_west':	'human_footman_ne_attack',
			'east':			'human_footman_ne_attack',
			'south_east':	'human_footman_se_attack',
			'west':			'human_footman_se_attack',
			'south_west':	'human_footman_se_attack',	
		}[direction]
	),

	action_delay_for_animation: (animation_name: string) => ( 32 ),
}