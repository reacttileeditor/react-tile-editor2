import _, { find } from "lodash";

import { ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';




export type Creature_Delegate = {
	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction:Direction) => string,
	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction:Direction) => string,
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction:Direction) => string,

	yield_move_cost_for_tile_type: (tile_type: string) => number|null,

	yield_prettyprint_name: () => string,


	yield_creature_image: () => string,
/*----------------------- stats -----------------------*/
	yield_moves_per_turn: () => number,
	yield_damage: () => number,
	yield_max_hitpoints: () => number,
	yield_weapon_range: () => number,
	action_delay_for_animation: (animation_name: string) => number,
}


const Creature_Delegate_Base_ƒ: Creature_Delegate = {
	yield_walk_asset_for_direction: (kind: Creature_Delegate,direction:Direction):string => ( kind.yield_creature_image() ),
	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => ( kind.yield_creature_image() ),
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction:Direction) => ( kind.yield_creature_image() ),

	yield_move_cost_for_tile_type: (tile_type: string): number|null => {
		const speed = {
			'menhir1':			null,
			'menhir2':			null,
			'water':			10,
			'water-placid':		10,
			'dirt':				1,
			'sandy-dirt':		1.3,
			'sand':				1.3,
			'scrub-dirt':		2,
			'grass-and-scree':	2.5,
			'scrub-dirt-tall':	2.5,
		}[tile_type];

		return ƒ.if(speed === undefined,
			1,
			speed
		)
	},

	yield_prettyprint_name: () => ( 'Generic Unit' ),


	yield_creature_image: () => ( '' ),
/*----------------------- stats -----------------------*/
	yield_moves_per_turn: (): number => ( 1 ),
	yield_damage: (): number => ( 5 ),
	yield_max_hitpoints: (): number => ( 100 ),
	yield_weapon_range: () => ( 1 ),
	action_delay_for_animation: (animation_name: string) => ( 0 ),
}



export const CT_Hermit_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () =>  5,
	yield_creature_image: () => 'hermit',
	yield_prettyprint_name: () => 'Hermit',
	yield_weapon_range: () => 3,
}

export const CT_Peasant_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
		{
			'north_east':	'peasant-ne-walk',
			'north_west':	'peasant-ne-walk',
			'east':			'peasant-ne-walk',
			'south_east':	'peasant-se-walk',
			'west':			'peasant-se-walk',
			'south_west':	'peasant-se-walk',	
		}[direction]
	),
	
	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
		{
			'north_east':	'peasant-ne',
			'north_west':	'peasant-ne',
			'east':			'peasant-ne',
			'south_east':	'peasant-se',
			'west':			'peasant-se',
			'south_west':	'peasant-se',	
		}[direction]
	),
	

	yield_damage: (): number => ( 25 ),
	yield_moves_per_turn: () => 8,
	yield_creature_image: () => 'peasant-se',
	yield_prettyprint_name: () => 'Peasant',
}

export const CT_Skeleton_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 8,
	yield_creature_image: () => 'skeleton-se',
	yield_prettyprint_name: () => 'Skeleton',
	yield_damage: (): number => ( 2 ),

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
		{
			'north_east':	'skeleton-ne',
			'north_west':	'skeleton-ne',
			'east':			'skeleton-ne',
			'south_east':	'skeleton_warrior_stand_se',
			'west':			'skeleton_warrior_stand_se',
			'south_west':	'skeleton_warrior_stand_se',	
		}[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
		{
			'north_east':	'skeleton-ne-walk',
			'north_west':	'skeleton-ne-walk',
			'east':			'skeleton-ne-walk',
			'south_east':	'skeleton-se-walk',
			'west':			'skeleton-se-walk',
			'south_west':	'skeleton-se-walk',	
		}[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
		{
			'north_east':	'skeleton-se-attack',
			'north_west':	'skeleton-se-attack',
			'east':			'skeleton-se-attack',
			'south_east':	'skeleton-se-attack',
			'west':			'skeleton-se-attack',
			'south_west':	'skeleton-se-attack',	
		}[direction]
	),

	action_delay_for_animation: (animation_name: string) => ( 36 ),

}

export const CT_Undead_Javelineer_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 16,
	yield_creature_image: () => 'undead-javelineer-se',
	yield_prettyprint_name: () => 'Hanged Man',
	yield_damage: (): number => ( 3 ),
	yield_weapon_range: () => 4,

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
		{
			'north_east':	'undead_javelineer_ne_stand',
			'north_west':	'undead_javelineer_ne_stand',
			'east':			'undead_javelineer_ne_stand',
			'south_east':	'undead_javelineer_se_stand',
			'west':			'undead_javelineer_se_stand',
			'south_west':	'undead_javelineer_se_stand',	
		}[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
		{
			'north_east':	'undead_javelineer_ne_stand',
			'north_west':	'undead_javelineer_ne_stand',
			'east':			'undead_javelineer_ne_stand',
			'south_east':	'undead_javelineer_se_stand',
			'west':			'undead_javelineer_se_stand',
			'south_west':	'undead_javelineer_se_stand',	
		}[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
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


export const CT_Human_Footman_ƒ: Creature_Delegate = {
	...Creature_Delegate_Base_ƒ,

	yield_moves_per_turn: () => 10,
	yield_creature_image: () => 'human_footman_se_stand',
	yield_prettyprint_name: () => 'Footman',
	yield_damage: (): number => ( 7 ),

	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
		{
			'north_east':	'human_footman_ne_stand',
			'north_west':	'human_footman_ne_stand',
			'east':			'human_footman_ne_stand',
			'south_east':	'human_footman_se_stand',
			'west':			'human_footman_se_stand',
			'south_west':	'human_footman_se_stand',	
		}[direction]
	),

	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
		{
			'north_east':	'human_footman_ne_walk',
			'north_west':	'human_footman_ne_walk',
			'east':			'human_footman_ne_walk',
			'south_east':	'human_footman_se_walk',
			'west':			'human_footman_se_walk',
			'south_west':	'human_footman_se_walk',	
		}[direction]
	),
	
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction:Direction):string => (
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