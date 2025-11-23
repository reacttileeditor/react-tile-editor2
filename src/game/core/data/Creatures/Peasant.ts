import { Creature_Animation_Chart } from "../../../objects_core/Creature/Creature";
import { Creature_Delegate, Creature_Delegate_Base_ƒ } from "../../../objects_core/Creature/Creature_Delegate";
import { Direction } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Image_Data_Names } from "../Image_Data";

export const CT_Peasant_ƒ: Creature_Delegate = {
//	...Creature_Delegate_Base_ƒ,

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'peasant-ne-walk',
			'north_west':	'peasant-ne-walk',
			'east':			'peasant-ne-walk',
			'south_east':	'peasant-se-walk',
			'west':			'peasant-se-walk',
			'south_west':	'peasant-se-walk',	
		} as Creature_Animation_Chart)[direction]
	),
	
	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction): Image_Data_Names => (
		({
			'north_east':	'peasant-ne',
			'north_west':	'peasant-ne',
			'east':			'peasant-ne',
			'south_east':	'peasant-se',
			'west':			'peasant-se',
			'south_west':	'peasant-se',	
		} as Creature_Animation_Chart)[direction]
	),
	yield_attack_asset_for_direction: Creature_Delegate_Base_ƒ.yield_attack_asset_for_direction,

	yield_moves_per_turn: () => 8,
	yield_damage: (): number => ( 25 ),
	yield_max_hitpoints: (): number => ( 100 ),
	yield_creature_image: () => 'peasant-se',
	yield_prettyprint_name: () => 'Peasant',

	yield_move_cost_for_tile_type: Creature_Delegate_Base_ƒ.yield_move_cost_for_tile_type,
	yield_weapon_range: Creature_Delegate_Base_ƒ.yield_weapon_range,
	action_delay_for_animation: Creature_Delegate_Base_ƒ.action_delay_for_animation,
	yield_shot_type: () => ( 'shot' ),

	yield_pixel_height: () => 45,
}
