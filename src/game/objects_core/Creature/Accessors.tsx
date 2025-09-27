import _, { cloneDeep, find, isBoolean, map, size } from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "../../core/engine/Utils";

import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { Creature_Delegate} from "./Creature_Delegate";
import { Asset_Manager_Data } from "../../core/engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data } from "../../core/engine/Blit_Manager";
import { Core_Accessors, Creature_Data, Creature_Type_Name, Creature_ƒ } from "./Creature";
import { CT_Hermit_ƒ } from "../../core/data/Creatures/Hermit";
import { CT_Peasant_ƒ } from "../../core/data/Creatures/Peasant";
import { CT_Skeleton_ƒ } from "../../core/data/Creatures/Skeleton";
import { CT_Undead_Javelineer_ƒ } from "../../core/data/Creatures/Undead_Javelineer";
import { CT_Human_Footman_ƒ } from "../../core/data/Creatures/Human_Footman";
import { Image_Data_Names } from "../../core/data/Image_Data";


export const Creature_ƒ_Accessors = {

	get_accessors: (me: Creature_Data): Core_Accessors => ({
		get_GM_instance: me.get_GM_instance,
		_Asset_Manager: me._Asset_Manager,
		_Blit_Manager: me._Blit_Manager,
		_Tilemap_Manager: me._Tilemap_Manager,
	}),




	/*----------------------- getters -----------------------*/

	yield_move_cost_for_tile_type: (me: Creature_Data, tile_type: string): number|null => (
		tile_type == 'blocked'
		?
		null
		:
		Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type)
	),

	yield_moves_per_turn: (me: Creature_Data,): number => (
		Creature_ƒ.get_delegate(me.type_name).yield_moves_per_turn()
	),

	yield_walk_asset_for_direction: (me: Creature_Data, direction: Direction): Image_Data_Names => (
		Creature_ƒ.get_delegate(me.type_name).yield_walk_asset_for_direction(Creature_ƒ.get_delegate(me.type_name), direction)
	),

	yield_stand_asset_for_direction: (me: Creature_Data, direction: Direction): Image_Data_Names => (
		Creature_ƒ.get_delegate(me.type_name).yield_stand_asset_for_direction(Creature_ƒ.get_delegate(me.type_name), direction)
	),

	yield_attack_asset_for_direction: (me: Creature_Data, direction: Direction): Image_Data_Names => (
		Creature_ƒ.get_delegate(me.type_name).yield_attack_asset_for_direction(Creature_ƒ.get_delegate(me.type_name), direction)
	),


	yield_creature_image: (me: Creature_Data): Image_Data_Names => (
		Creature_ƒ.get_delegate(me.type_name).yield_creature_image()
	),



	get_current_tile_pos_from_pixel_pos: (me: Creature_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): Point2D => (
		Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, me.pixel_pos)
	),



	/*----------------------- basetype management -----------------------*/
	list_all_creature_types: (): Array<Creature_Type_Name> => {
		return ['hermit','peasant','skeleton','undead_javelineer','human_footman'];
	},




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





