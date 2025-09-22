import { Gamespace_Pixel_Point, Point2D } from "../../../interfaces";
import { Creature_Data, Creature_ƒ } from "../../../objects_core/Creature/Creature";
import { Custom_Object_Data } from "../../../objects_core/Custom_Object/Custom_Object";
import { Vals } from "../../constants/Constants";
import { Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { angle_between, ƒ } from "../../engine/Utils";
import { cloneDeep } from "lodash";



export const CO_Shot_Utils_ƒ = {

	calculate_arcing_shot_trajectory: (
		me: Custom_Object_Data<unknown>,
		original_pos: Gamespace_Pixel_Point,
		lifetime_tick: number,
		target: Creature_Data,
		source: Creature_Data,
	): {
		pixel_pos: Gamespace_Pixel_Point,
		rotate: number,
	} => {
		const prior_pos = me.pixel_pos;
		let next_pos = cloneDeep(original_pos);

		let visual_rotate_angle = me.rotate;
		let probable_target_pos: Gamespace_Pixel_Point | undefined = undefined;

		if(target){
			const target_pos = CO_Shot_Utils_ƒ.calculate_probable_target_pos(target);
			const source_pos = source.pixel_pos;


/*----------------------- positional logic -----------------------*/

			/*
				This is NOT the visual angle the sprite is tilted to; this is the geometric angle btween the starting point, and the endpoint.
			*/
			const angle_to_target = angle_between({source: original_pos, dest: target_pos});

			/*
				The distance travelled in a single frame:
			*/
			const magnitude = Math.hypot( (original_pos.x - target_pos.x), (original_pos.y - target_pos.y) ) / Vals.shot_flight_duration;

			/*
				For this fancier "arcing shot", we bend what would normally be a straight line upwards, into a parabolic arc.
				To do this, we just align a sinusoidal "hill" to start at zero and end at zero, with the bulge in the middle.
			*/
			const arcing_height = -40 * Math.sin( (lifetime_tick / Vals.shot_flight_duration) * Math.PI );






			const addend: Point2D = { x: lifetime_tick * magnitude * Math.cos(angle_to_target), y: lifetime_tick * magnitude * Math.sin(angle_to_target) + arcing_height }

			next_pos = {x: original_pos.x + addend.x, y: original_pos.y + addend.y} as Gamespace_Pixel_Point


/*----------------------- graphical logic -----------------------*/
			/*
				The calculations for the visual angle are a fair bit different, since we don't care about the final position, but rather, the position of the very next "key point"
			*/

			visual_rotate_angle = Math.atan2(  next_pos.y - prior_pos.y , next_pos.x - prior_pos.x )
			visual_rotate_angle = 90 + visual_rotate_angle * 180 / Math.PI ;

		}

		return {
			pixel_pos: next_pos,
			rotate: visual_rotate_angle
		}
	},

	calculate_serpentine_shot_trajectory: (
		me: Custom_Object_Data<unknown>,
		original_pos: Gamespace_Pixel_Point,
		lifetime_tick: number,
		target: Creature_Data,
		source: Creature_Data,
	): {
		pixel_pos: Gamespace_Pixel_Point,
		rotate: number,
	} => {
		const prior_pos = me.pixel_pos;
		let next_pos = cloneDeep(original_pos);

		let visual_rotate_angle = me.rotate;
		let probable_target_pos: Gamespace_Pixel_Point | undefined = undefined;

		if(target){
			const target_pos = CO_Shot_Utils_ƒ.calculate_probable_target_pos(target);
			const source_pos = source.pixel_pos;


/*----------------------- positional logic -----------------------*/

			/*
				This is NOT the visual angle the sprite is tilted to; this is the geometric angle btween the starting point, and the endpoint.
			*/
			const angle_to_target = angle_between({source: original_pos, dest: target_pos});

			/*
				The distance travelled in a single frame:
			*/
			const magnitude = Math.hypot( (original_pos.x - target_pos.x), (original_pos.y - target_pos.y) ) / Vals.shot_flight_duration;

			/*
				For this fancier "arcing shot", we bend what would normally be a straight line upwards, into a parabolic arc.
				To do this, we just align a sinusoidal "hill" to start at zero and end at zero, with the bulge in the middle.
			*/
			const arcing_height = -10 * Math.sin( (lifetime_tick / Vals.shot_flight_duration) * Math.PI * 6 );






			const addend: Point2D = { x: lifetime_tick * magnitude * Math.cos(angle_to_target), y: lifetime_tick * magnitude * Math.sin(angle_to_target) + arcing_height }

			next_pos = {x: original_pos.x + addend.x, y: original_pos.y + addend.y} as Gamespace_Pixel_Point


/*----------------------- graphical logic -----------------------*/
			/*
				The calculations for the visual angle are a fair bit different, since we don't care about the final position, but rather, the position of the very next "key point"
			*/

			visual_rotate_angle = Math.atan2(  next_pos.y - prior_pos.y , next_pos.x - prior_pos.x )
			visual_rotate_angle = 90 + visual_rotate_angle * 180 / Math.PI ;

		}

		return {
			pixel_pos: next_pos,
			rotate: visual_rotate_angle
		}
	},



	calculate_probable_target_pos: (
		target: Creature_Data,
	): Gamespace_Pixel_Point => {

		const accessors = Creature_ƒ.get_accessors(target);
		const probable_target_pos_tile = Creature_ƒ.guess_anim_pos_at_time_offset(target, accessors._Tilemap_Manager(), target.path_data, Vals.shot_flight_duration);

		const probable_target_pos = probable_target_pos_tile
			?
			Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords(
				accessors._Tilemap_Manager(),
				accessors._Asset_Manager(),
				probable_target_pos_tile
			)
			:
			target.pixel_pos;

		return probable_target_pos;
	}

}

