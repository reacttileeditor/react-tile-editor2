import _, { cloneDeep, find, isBoolean, map, size } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Type_Name, Custom_Object_Data, Custom_Object_ƒ, New_Custom_Object } from "../Custom_Object";
import { Base_Object_Data, New_Base_Object } from "../Base_Object";
import { Creature_Delegate, CT_Hermit_ƒ, CT_Human_Footman_ƒ, CT_Peasant_ƒ, CT_Skeleton_ƒ, CT_Undead_Javelineer_ƒ } from "./Creature_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../../core/engine/Game_Manager";
import { Asset_Manager_Data } from "../../core/engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data } from "../../core/engine/Blit_Manager";
import { add, filter, includes, reduce } from "ramda";
import { Creature_Data, Creature_Type_Name, Creature_ƒ } from "./Creature";


export const Creature_ƒ_Accessors = {
	/*----------------------- introspection -----------------------*/
	list_all_creature_types: (): Array<Creature_Type_Name> => {
		return ['hermit','peasant','skeleton','undead_javelineer','human_footman'];
	},


	/*----------------------- getters -----------------------*/

	yield_move_cost_for_tile_type: (me: Creature_Data, tile_type: string): number|null => (
		Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type)
	),

	yield_moves_per_turn: (me: Creature_Data,): number => (
		Creature_ƒ.get_delegate(me.type_name).yield_moves_per_turn()
	),

	yield_walk_asset_for_direction: (me: Creature_Data, direction: Direction):string => (
		Creature_ƒ.get_delegate(me.type_name).yield_walk_asset_for_direction(Creature_ƒ.get_delegate(me.type_name), direction)
	),

	yield_stand_asset_for_direction: (me: Creature_Data, direction: Direction):string => (
		Creature_ƒ.get_delegate(me.type_name).yield_stand_asset_for_direction(Creature_ƒ.get_delegate(me.type_name), direction)
	),

	yield_attack_asset_for_direction: (me: Creature_Data, direction: Direction):string => (
		Creature_ƒ.get_delegate(me.type_name).yield_attack_asset_for_direction(Creature_ƒ.get_delegate(me.type_name), direction)
	),


	yield_creature_image: (me: Creature_Data) => (
		Creature_ƒ.get_delegate(me.type_name).yield_creature_image()
	),



	get_current_tile_pos_from_pixel_pos: (me: Creature_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Point2D => (
		Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, me.pixel_pos)
	),


	/*----------------------- basetype management -----------------------*/


	get_delegate: (type_name: Creature_Type_Name): Creature_Delegate => {
		return {
			hermit: CT_Hermit_ƒ,
			peasant: CT_Peasant_ƒ,
			skeleton: CT_Skeleton_ƒ,
			undead_javelineer: CT_Undead_Javelineer_ƒ,
			human_footman: CT_Human_Footman_ƒ,
		}[type_name];
	},


}





