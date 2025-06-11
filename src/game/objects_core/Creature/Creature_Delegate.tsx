import _, { find } from "lodash";

import { ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { Tile_Name, Tile_Name__Excluding_Virtual_Tiles } from "../../core/data/Tile_Types";
import { Custom_Object_Type_Name } from "../Custom_Object/Custom_Object";




export type Creature_Delegate = {
	yield_walk_asset_for_direction: (kind: Creature_Delegate, direction: Direction) => string,
	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction) => string,
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction) => string,

	yield_move_cost_for_tile_type: (tile_type: string) => number|null,

	yield_prettyprint_name: () => string,


	yield_creature_image: () => string,
/*----------------------- stats -----------------------*/
	yield_moves_per_turn: () => number,
	yield_damage: () => number,
	yield_max_hitpoints: () => number,
	yield_weapon_range: () => number,
	action_delay_for_animation: (animation_name: string) => number,
	yield_shot_type: () => Custom_Object_Type_Name,
}

/*
	We generally do NOT want to do inheritance with Creature Delegats, but we do provide the following mostly for "debugging and content creation" purposes.

	When we're developing a new creature, we can import these as a placeholder for (a lack of) real animations and such.
*/

export type Move_Speed_Dict = {
	[K in Tile_Name__Excluding_Virtual_Tiles]: number|null
}


export const Creature_Delegate_Base_ƒ: Creature_Delegate = {
	yield_walk_asset_for_direction: (kind: Creature_Delegate,direction: Direction):string => ( kind.yield_creature_image() ),
	yield_stand_asset_for_direction: (kind: Creature_Delegate, direction: Direction):string => ( kind.yield_creature_image() ),
	yield_attack_asset_for_direction: (kind: Creature_Delegate, direction: Direction) => ( kind.yield_creature_image() ),

	yield_move_cost_for_tile_type: (tile_type: string): number|null => {
		const real_type = tile_type as Tile_Name__Excluding_Virtual_Tiles;

		const speed_list: Move_Speed_Dict = {
			'grass': 1,
			'grass-and-scree':	2.5,
			'dirt': 1,
			'sandy-dirt': 1.3,
			'scrub-dirt': 2,
			'scrub-dirt-tall':	2.5,
			'bush':	4,
			'sand': 1.6,
			'water': null,
			'water-placid': null,
			'water_reeds':	7,
			'water_shallow': 5,
			'wideleaf_scrub': 2,
			'menhir-big': null,
			'menhir-small': 6,
		};

		const speed = speed_list[real_type];

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
	yield_shot_type: () => ( 'shot' ),
}




