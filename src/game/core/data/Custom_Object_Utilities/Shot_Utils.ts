import { Point2D } from "../../../interfaces";
import { Creature_Data, Creature_ƒ } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data } from "../../../objects_core/Custom_Object/Custom_Object";
import { Vals } from "../../constants/Constants";
import { Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { angle_between, ƒ } from "../../engine/Utils";
import { cloneDeep } from "lodash";



export const CO_Shot_Utils_ƒ = {

	arcing_shot_trajectory: (
		me: Custom_Object_Data<unknown>,
		original_pos: Point2D,
		lifetime_tick: number,
		target: Creature_Data,
		source: Creature_Data,
	): {
		pixel_pos: Point2D,
		rotate: number,
	} => {
		const prior_pos = me.pixel_pos;
		let next_pos = cloneDeep(original_pos);

		let visual_rotate_angle = me.rotate;
		let probable_target_pos: Point2D | undefined = undefined;

		if(target){
			const target_pos = target.pixel_pos;
			const source_pos = source.pixel_pos;

			const angle = angle_between({source: original_pos, dest: target_pos});

			const magnitude = Math.hypot( (original_pos.x - target_pos.x), (original_pos.y - target_pos.y) ) / Vals.shot_flight_duration;


			const arcing_height = -40 * Math.sin( (lifetime_tick / Vals.shot_flight_duration) * Math.PI );






			const addend: Point2D = { x: lifetime_tick * magnitude * Math.cos(angle), y: lifetime_tick * magnitude * Math.sin(angle) + arcing_height }

			next_pos = {x: original_pos.x + addend.x, y: original_pos.y + addend.y}

			/*
				The calculations for the visual angle are a fair bit different, since we don't care about the final position, but rather, the position of the very next "key point"
			*/

			visual_rotate_angle = Math.atan2(  next_pos.y - prior_pos.y , next_pos.x - prior_pos.x )
			visual_rotate_angle = 90 + visual_rotate_angle * 180 / Math.PI ;
			//console.error(visual_rotate_angle)


			const accessors = Creature_ƒ.get_accessors(target);
			const probable_target_pos_tile = Creature_ƒ.guess_anim_pos_at_time_offset(target, accessors._Tilemap_Manager(), target.path_data, Vals.shot_flight_duration);

			probable_target_pos = probable_target_pos_tile
				?
				Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(
					accessors._Tilemap_Manager(),
					accessors._Asset_Manager(),
					probable_target_pos_tile
				)
				:
				next_pos;	
		}

		return {
			pixel_pos: next_pos,
			rotate: visual_rotate_angle
		}
	},
}