import { Dispatch, SetStateAction } from "react";
import { Asset_Manager_Data, Asset_Manager_ƒ, AutoTileRestrictionSample, Image_Data, TileComparatorSample } from "./Asset_Manager";
import { filter, isString, map, size } from "lodash";
import { is_all_true, ƒ } from "../Utils";
import { concat, uniq } from "ramda";
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../Blit_Manager";
import { Point2D } from "../../../interfaces";
import * as Utils from "../Utils";





export const Drawing = {
		
/*----------------------- RNG functions -----------------------*/
	_tile_dice: (me: Asset_Manager_Data, sides: number) => (
		Utils.dice_anchored_on_specific_random_seed( sides, me.TileRNG )
	),

/*----------------------- auto-tiling logic -----------------------*/
	should_we_draw_this_tile_based_on_its_autotiling_restrictions: ( tile_data: TileComparatorSample, autotile_restrictions: AutoTileRestrictionSample ): boolean => {
		/*
			This goes through all the adjacent tile data, compares it to the assets that are available for the current tile, and returns a subset of these assets - the ones that are valid to draw for this particular arrangement. 
		
			`tile_data` is the actual arrangement of tiles on the map.
			
			Th
		*/
		
		return	autotile_restrictions[0][0].test( tile_data[0][0] ) &&
				autotile_restrictions[0][1].test( tile_data[0][1] ) &&
				autotile_restrictions[1][0].test( tile_data[1][0] ) &&	
				autotile_restrictions[1][1].test( tile_data[1][1] ) &&	
				autotile_restrictions[1][2].test( tile_data[1][2] ) &&	
				autotile_restrictions[2][0].test( tile_data[2][0] ) &&	
				autotile_restrictions[2][1].test( tile_data[2][1] )	
		;
	},

/*----------------------- frame choice calculations -----------------------*/
	calculate_pingpong_frame_num: (absolute_frame_num: number, count: number) => {
		/*
			This is a bit ugly, so here's the lowdown:
			
			We're basically looking to take say, 6 frames, and actually turn them into a 12-frame-long animation.
			
			We want input values like:
			0	1	2	3	4	5	6	7	8	9	10
			to become
			0	1	2	3	4	5	4	3	2	1	0

			The very first thing we do is use "frame count minus 1", since we want 0->5, not 1->6
		*/
			let _count = count - 1;
		/*
			The first thing we do is remainder our current frames into a number from 0 -> 10.
		*/

		var rem_current_frame = Utils.modulo(absolute_frame_num, (_count * 2));
		/*
			The next thing we do is a funky bit of math that successfully turns:
			0	1	2	3	4	5	6	7	8	9	10
			into
			0	1	2	3	4	0	4	3	2	1	0
		*/

		return Utils.modulo(_count - Math.abs(_count-rem_current_frame), _count)
		+
		/*
			which is great, except we want a 6 in the middle, which is where the following awkward chunk of math comes in:
		*/
		(
			Utils.modulo(rem_current_frame, _count) == 0
			?
				_count * Utils.modulo(rem_current_frame/_count, 2)
				:
				0
		) ;
	},

	get_current_frame_cycle: (image_data: Image_Data, current_milliseconds: number): number => {
		/*
			aka "at this ms timestamp, how many times would this animation have played"
		*/

		let frame_count = image_data.frames ? image_data.frames : 1;
		let frame_duration = image_data.frame_duration ? image_data.frame_duration : 20;

		/*
			warning:  There might be some fuckery here if the pingponging doesn't mirror/double the middle frame.  That'd be the -1 component in the math, if that's the culprit.
		*/
		let animation_duration = !image_data.ping_pong
		?
		(frame_count * frame_duration)
		:
		((frame_count * 2 - 1) * frame_duration);

		return current_milliseconds / animation_duration;
	},

	get_current_frame_number: (image_data: Image_Data, current_milliseconds: number): number => {
		let frame_count = image_data.frames ? image_data.frames : 1;
		let frame_duration = image_data.frame_duration ? image_data.frame_duration : 20;
		/*
			And this is where we get into the business of calculating the current frame.
			We start by doing a pretty simple absolute division operation; check our current millisec timer, and see what that would be in frames.
			This is the number we feed into our various formulas.
		*/
		let absolute_frame_num = Math.floor(current_milliseconds / frame_duration);
		let current_frame_num;
		
		/*
			For relatively simple setups, like a straightforward 1,2,3 frame ordering, it's a piece of cake:
		*/
		if( !image_data.ping_pong ){
			current_frame_num = Utils.modulo(absolute_frame_num, frame_count);
		} else {
			current_frame_num = Asset_Manager_ƒ.calculate_pingpong_frame_num( absolute_frame_num, frame_count );	
		}

		return current_frame_num;
	},





/*----------------------- actual draw ops -----------------------*/

	draw_image_for_asset_name: (p: {
		_AM: Asset_Manager_Data,
		asset_name: string,
		_BM: Blit_Manager_Data,
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
		rotate: number,
		brightness: number,
		horizontally_flipped: boolean,
		vertically_flipped: boolean,
	}) => {
		/*
			Before we get started, we have a special 'magic name' used to make various objects (such as floating hp numbers) skip drawing a sprite entirely.
		*/
		if( p.asset_name !== 'omit_image' ){
			const image = Asset_Manager_ƒ.get_raw_image_for_asset_name(p._AM, p.asset_name);
			const metadata = Asset_Manager_ƒ.get_image_metadata_for_asset_name(p._AM, p.asset_name);
			const image_data = Asset_Manager_ƒ.get_image_data_for_asset_name(p._AM, p.asset_name);

			
			if(image_data == undefined){
				console.error(`Could not find an image in our image_data_list for the asset named ${p.asset_name}.`); 
			} else {
				let dim = metadata ? metadata.dim : { w: 20, h: 20 };  //safe-access

				let frame_padding = image_data.pad ? image_data.pad : 0;

				const current_frame_num = Asset_Manager_ƒ.get_current_frame_number(image_data, p.current_milliseconds);

				/*
					This assumes the canvas is pre-translated so our draw position is at the final point, so we don't have to do any calculation for that, here.
				
					This is the place where we do all 'spritesheet' handling, and also where we do all animation handling.
				*/
			
				if( !Asset_Manager_ƒ.isAssetSpritesheet(metadata) ){
					Blit_Manager_ƒ.queue_draw_op({
						_BM:					p._BM,
						pos:					{ x: p.pos.x, y: p.pos.y },
						z_index:				p.zorder,
						opacity:				p.opacity,
						rotate:					p.rotate,
						brightness:				p.brightness,
						horizontally_flipped:	p.horizontally_flipped,
						vertically_flipped:		p.vertically_flipped,
						drawing_data:			{
													image_ref: image,
													src_rect: {
														x:	0,
														y:	0,
														w:	metadata.dim.w,
														h:	metadata.dim.h,
													},
													dest_point: {
														x:			-Math.floor(dim.w/2),
														y:			-Math.floor(dim.h/2),
													}
												}
					});
				} else {
					Blit_Manager_ƒ.queue_draw_op({
						_BM:					p._BM,
						pos:					{ x: p.pos.x, y: p.pos.y },
						z_index:				p.zorder,
						opacity:				p.opacity,
						rotate:					p.rotate,
						brightness:				p.brightness,
						horizontally_flipped:	p.horizontally_flipped,
						vertically_flipped:		p.vertically_flipped,
						drawing_data:			{
													image_ref: image,
													src_rect: {
														x:	metadata.bounds.x + (current_frame_num * metadata.bounds.w) + ((current_frame_num) * frame_padding),
														y:	metadata.bounds.y,
														w:	metadata.bounds.w,
														h:	metadata.bounds.h,
													},
													dst_rect: {
														x:	-Math.floor(metadata.bounds.w/2),
														y:	-Math.floor(metadata.bounds.h/2),
														w:	metadata.bounds.w,
														h:	metadata.bounds.h,
													},
												}
					});
				}
			}
		}
	},

	draw_text: (p: {
		text: string,
		_BM: Blit_Manager_Data,
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
		rotate: number,
		brightness: number,
		horizontally_flipped: boolean,
		vertically_flipped: boolean,
	}) => {
		Blit_Manager_ƒ.queue_draw_op({
			_BM:					p._BM,
			pos:					{ x: p.pos.x, y: p.pos.y },
			z_index:				p.zorder,
			opacity:				p.opacity,
			rotate:					p.rotate,
			brightness: 			p.brightness,
			horizontally_flipped:	p.horizontally_flipped,
			vertically_flipped:		p.vertically_flipped,
			drawing_data:			{
										text: p.text,
									}
		});
	},

	draw_hitpoints: (p: {
		portion: number,
		_BM: Blit_Manager_Data,
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
	}) => {
		Blit_Manager_ƒ.queue_draw_op({
			_BM:					p._BM,
			pos:					{ x: p.pos.x, y: p.pos.y },
			z_index:				p.zorder,
			opacity:				p.opacity,
			rotate:					0,
			brightness: 			1.0,
			horizontally_flipped:	false,
			vertically_flipped:		false,
			drawing_data:			{
										portion: p.portion,
									}
		});
	},

}