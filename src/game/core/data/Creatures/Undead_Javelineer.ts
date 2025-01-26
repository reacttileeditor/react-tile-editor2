import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";
import { Direction } from "../../engine/Tilemap_Manager/Tilemap_Manager";

export const CT_Undead_Javelineer_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 16,
	yield_creature_image: () => 'undead_javelineer_se_stand',
	yield_prettyprint_name: () => 'Hanged Man',
	yield_damage: (): number => ( 3 ),
	yield_weapon_range: () => 4,

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction):string => (
		{
			'north_east':	'undead_javelineer_ne_stand',
			'north_west':	'undead_javelineer_ne_stand',
			'east':			'undead_javelineer_ne_stand',
			'south_east':	'undead_javelineer_se_stand',
			'west':			'undead_javelineer_se_stand',
			'south_west':	'undead_javelineer_se_stand',	
		}[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction):string => (
		{
			'north_east':	'undead_javelineer_ne_stand',
			'north_west':	'undead_javelineer_ne_stand',
			'east':			'undead_javelineer_ne_stand',
			'south_east':	'undead_javelineer_se_stand',
			'west':			'undead_javelineer_se_stand',
			'south_west':	'undead_javelineer_se_stand',	
		}[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction):string => (
		{
			'north_east':	'undead_javelineer_se_attack',
			'north_west':	'undead_javelineer_se_attack',
			'east':			'undead_javelineer_se_attack',
			'south_east':	'undead_javelineer_se_attack',
			'west':			'undead_javelineer_se_attack',
			'south_west':	'undead_javelineer_se_attack',	
		}[direction]
	),

	action_delay_for_animation: (animation_name: string) => ( 42 ),
}