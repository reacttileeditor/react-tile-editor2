
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../../core/engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { Change_Instance, Creature_Type_Name } from "../Creature/Creature";
import { Custom_Object_Delegate, Custom_Object_Delegate_States} from "./Custom_Object_Delegate";
import { Game_Manager_Data, Game_Manager_ƒ } from "../../core/engine/Game_Manager/Game_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../../core/engine/Blit_Manager";
import { Asset_Manager_Data } from "../../core/engine/Asset_Manager/Asset_Manager";
import { Base_Object_Accessors, Base_Object_Data, Base_Object_State, Custom_Object_Data, Custom_Object_ƒ } from "./Custom_Object";
 

export const Custom_Object_ƒ_Accessors = {
	get_accessors: (me: Base_Object_Data): Base_Object_Accessors => ({
		get_GM_instance: me.get_GM_instance,
		_Asset_Manager: me._Asset_Manager,
		_Blit_Manager: me._Blit_Manager,
		_Tilemap_Manager: me._Tilemap_Manager,
	}),


	get_base_object_state: (me: Base_Object_Data): Base_Object_State => ({
		pixel_pos: me.pixel_pos,
		rotate: me.rotate,
		should_remove: me.should_remove,
		is_done_with_turn: me.is_done_with_turn,
		velocity: me.velocity,
		accel: me.accel,		
	}),




	get_current_mid_turn_tile_pos: (me: Base_Object_Data, _TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data) => (
		Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(_TM, _AM, _BM, me.pixel_pos)
	),


	yield_asset: (me: Custom_Object_Data<unknown>) => (
		Custom_Object_ƒ.get_delegate(me.type_name).yield_asset()
	),

	yield_text: (me: Custom_Object_Data<unknown>) => (
		me.text
	),

	yield_zorder: (me: Custom_Object_Data<unknown>) => (
		Custom_Object_ƒ.get_delegate(me.type_name).yield_zorder()
	),

	get_lifetime_tick: (me: Custom_Object_Data<unknown>, tick: number): number => (
		tick - me.creation_timestamp 
	),

	get_lifetime_ms: (me: Custom_Object_Data<unknown>, current_ms: number): number => (
		current_ms - ticks_to_ms(me.creation_timestamp) 
	), 

	should_remove_at_animation_end: (me: Custom_Object_Data<unknown>) => (
		Custom_Object_ƒ.get_delegate(me.type_name).should_remove_at_animation_end(me)
	),
}

