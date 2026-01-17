import { Dispatch, SetStateAction } from "react";
import { Asset_Data_Record, Asset_Manager_Data, Asset_Manager_ƒ, Autotile_Restriction_Sample, Image_Data, Tile_Comparator_Sample } from "./Asset_Manager";
import { filter, isString, map, size } from "lodash";
import { get_nth_permutation_of_deck, is_all_true, ƒ } from "../Utils";
import { add, concat, findIndex, reduce, slice, uniq } from "ramda";
import { Blit_Manager_Data, Blit_Manager_ƒ, Transform_Matrix } from "../Blit_Manager";
import { Point2D } from "../../../interfaces";
import * as Utils from "../Utils";
import { Image_And_Image_Sequence_Data_Names, Image_Data_Names } from "../../data/Image_Data";
import { Palette_Names } from "../../data/Palette_List";





export const Drawing = {
/*----------------------- auto-tiling logic -----------------------*/
	should_we_draw_this_tile_based_on_its_autotiling_restrictions: ( tile_data: Tile_Comparator_Sample, autotile_restrictions: Autotile_Restriction_Sample ): boolean => {
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
			which is great, except we want a 5 in the middle, which is where the following awkward chunk of math comes in:
		*/
		(
			Utils.modulo(rem_current_frame, _count) == 0
			?
				_count * Utils.modulo(rem_current_frame/_count, 2)
				:
				0
		) ;
	},

	get_current_frame_cycle: (
		image_data: Image_Data,
		current_milliseconds: number
	): number => {
		/*
			aka "at this ms timestamp, how many times would this animation have played"
		*/

		let frame_count = image_data.frames ? image_data.frames : 1;
		let frame_duration = image_data.frame_duration ? image_data.frame_duration : 20;

		/*
			Don't actually ping-pong if we're just one frame long; it breaks the math.
		*/
		const should_ping_pong = image_data.ping_pong && (frame_count > 1);

		let animation_duration = !should_ping_pong
		?
		(frame_count * frame_duration)
		:
		((frame_count * 2 - 1) * frame_duration);

		return current_milliseconds / animation_duration;
	},

	get_current_frame_number: (
		image_data: Image_Data,
		current_milliseconds: number
	): number => {
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
		const should_ping_pong = image_data.ping_pong && (frame_count > 1);

		if( !should_ping_pong ){
			current_frame_num = Utils.modulo(absolute_frame_num, frame_count);
		} else {
			current_frame_num = Asset_Manager_ƒ.calculate_pingpong_frame_num( absolute_frame_num, frame_count );	
		}

		return current_frame_num;
	},

/*----------------------- tile animation sequence calcs -----------------------*/
	/*
		We have a mechanism to allow tiles to play not merely "one" animation, but rather, to play a sequence of animations.   This is facilitated by a new asset type, which acts as a "compound asset".   A compound assets basically stores an array of regular assets (in specific order), and plays them back in sequence.

		It treats this larger "sequence" of animations exactly like a regular animation would be treated - the sequence is known to be a fixed length, and to loop, so we just target an exact offset inside of the sequence, to know both which frame we're on, and which animation we're in.

		For example:

		0ms																		50ms																100ms
		[		anim 1					anim2					anim 3		   ][		anim 1						anim2					anim 3	   ]
		[<-------------------------->][<----------->][<----------------------->][<-------------------------->][<----------->][<----------------------->]
											>|<
								current global time offset @ 25ms

		In the above, hypothetical case, we'd be halfways into the second animation.  Something similar would be true at 75ms.
	*/

	calculate_animation_durations: (
		asset_data_records: Array<Asset_Data_Record>,
	): Array<number> => {
		const image_data_array = map(asset_data_records, (val)=>(val.image_data))

		const animation_durations: Array<number> = map(image_data_array, (image_data)=>{
			let frame_count = image_data.frames ? image_data.frames : 1;
			let frame_duration = image_data.frame_duration ? image_data.frame_duration : 20;
	
			return (
				frame_count + (Boolean(image_data.ping_pong) ? frame_count - 1 : 0)
			) * frame_duration;
		})

		return animation_durations;
	},

	get_random_starting_offset_and_length_for_sub_animation_of_animation_sequence: (
		_AM: Asset_Manager_Data,
		asset_name: Image_And_Image_Sequence_Data_Names | 'omit_image',
	) : {
		starting_offset: number,
		length: number,
	} => {

		/*
			Before we get started, we have a special 'magic name' used to make various objects (such as floating hp numbers) skip drawing a sprite entirely.
		*/
		if( asset_name !== 'omit_image' ){
			const asset_data_records = Asset_Manager_ƒ.get_data_for_asset_name(_AM, asset_name);

			if( size(asset_data_records) == 1 ){
				/*
					If this is bigger than one, we have an animation sequence and want to do the fancy calcs.  If it's just one, then there's only one choice, and it's 0ms.
				*/
				const animation_length = Asset_Manager_ƒ.get_animation_lengths_for_asset(
					_AM,
					asset_name
				)[0];

				return {
					starting_offset: 0,
					length: animation_length,
				};
			} else {

				const shuffled_asset_data_records = Asset_Manager_ƒ.deterministically_convolute_animation_sequence(asset_data_records, 0);

				/*
					This function is designed to ONLY operate on the very first set of an animation sequence.  Like all the others, this will be shuffled, so we use the above function to do the shuffling to find out what the first one ends up being.

					It doesn't return an infinite sequence, it just returns the "current shuffle" for the timestamp we provide; in this case, the origin point of 0ms.
				*/


				const animation_durations = Asset_Manager_ƒ.calculate_animation_durations(shuffled_asset_data_records);

				/*
					Calculate when each sub-animation ends.  I.e. if input values were [4, 3.5, 6] (durations), this function would give: [4, 7.5, 13.5].

					We can use this to decide which animation we're in by calculating how far into the whole "compound asset sequence" we are.  The first one we're >= is the one we're currently on.
				
				*/
				const sub_animation_end_timestamps = animation_durations.map((num, i, arr) =>
					num + arr.slice(0, i).reduce((a, b) =>
						a + b, 0));

				const random_animation_choice = Utils.dice( size(sub_animation_end_timestamps) ) - 1;

				const sub_animation_start_timestamps = concat([0], sub_animation_end_timestamps.slice(0,-1));


				return {
					starting_offset: sub_animation_start_timestamps[random_animation_choice],
					length: animation_durations[random_animation_choice],
				};
			}
		} else {
			return {
				starting_offset: 0,
				length: 0,
			};
		}
	},


	get_current_frame_number_and_asset_data_for_animation_sequence: (
		asset_data_records: Array<Asset_Data_Record>,
		current_milliseconds: number
	): {
		current_time_offset: number,
		asset_data: Asset_Data_Record,
	} => {

		const image_data_array = map(asset_data_records, (val)=>(val.image_data))

		const animation_durations = Asset_Manager_ƒ.calculate_animation_durations(asset_data_records);

		const total_sequence_duration = reduce(add, 0, animation_durations);

		
		/*
			Calculate when each sub-animation ends.  I.e. if input values were [4, 3.5, 6] (durations), this function would give: [4, 7.5, 13.5].

			We can use this to decide which animation we're in by calculating how far into the whole "compound asset sequence" we are.  The first one we're >= is the one we're currently on.
		
		*/
		const sub_animation_end_timestamps = animation_durations.map((num, i, arr) =>
			num + arr.slice(0, i).reduce((a, b) =>
				a + b, 0));


		/*
			These sequences loop indefinitely, and they're always the same size, so we can just use modulo math to figure out where we are in the sequence.
		*/				
		const current_time_offset_in_sequence = Utils.modulo(current_milliseconds, total_sequence_duration);


		/*
			Figure out which of the animations we're in.
		*/
		const animation_index = findIndex( (val)=>( val >= current_time_offset_in_sequence ), sub_animation_end_timestamps )

		/*
			Using that, extract the image data for that animation (easy).
		*/
		const asset_data = asset_data_records[animation_index];
		const image_data = image_data_array[animation_index];


		/*
			Then calculate our current time offset in that animation (not so easy).
		*/
		const sub_animation_start_timestamps = concat([0], slice(0, -1, sub_animation_end_timestamps));
		const current_time_offset_in_sub_animation = current_time_offset_in_sequence - sub_animation_start_timestamps[animation_index];


		/*
			Then, at last, we can fall back on our regular animation logic to find out the frame number for said sub-animation:
		*/
		const final_frame_number = Asset_Manager_ƒ.get_current_frame_number(image_data, current_time_offset_in_sub_animation);

		return {
			current_time_offset: current_time_offset_in_sub_animation,
			asset_data: asset_data,
		}

	},




	/*
		Based on the above description of animation sequences, however, we can do something devilish:  because every "chunk" of the sequence is known to be the exact same length, i.e. the sum durations of animations 1 + 2 + 3 are always equal no matter what order they're in, then it affords us the opportunity to shuffle them.

		If we know which "nth" set we're in, and we have an absolutely deteministic way of shuffling "cards", we can shuffle each "1, 2, 3" chunk in a deterministically random way, without needing to store the random shuffle.  I.e. if we're at the 2nd sequence, and we know the shuffle for it will always result in "3, 1, 2", then the global time offset, alone, will suffice for us to know which of the 3 animations is currently playing, and how deep into the animation we currently are.

		For example:

		0ms																		50ms																100ms
		[		anim 1					anim2					anim 3		   ][	anim 2					anim1						anim 3	 	   ]
		[<-------------------------->][<----------->][<----------------------->][<----------->][<----------------------->][<-------------------------->]
											>|<
								current global time offset @ 25ms

		You can see in the above example that we can predict what the second shuffle will be, because no matter what, the 3 animations that comprise it always add up to 50ms.
	*/


	deterministically_convolute_animation_sequence: (
		asset_data_records: Array<Asset_Data_Record>,
		current_milliseconds: number,
	): Array<Asset_Data_Record> => {

		const animation_durations = Asset_Manager_ƒ.calculate_animation_durations(asset_data_records);
		const total_sequence_duration = reduce(add, 0, animation_durations);

		const current_sequence_iteration = Math.floor(current_milliseconds / total_sequence_duration);
		

		const stuff = get_nth_permutation_of_deck<Asset_Data_Record>(current_sequence_iteration,asset_data_records);

		return stuff;
	},

/*----------------------- actual draw ops -----------------------*/
	draw_image_for_asset_name: (p: {
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		asset_name: Image_And_Image_Sequence_Data_Names | 'omit_image',
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
		rotate: number,
		scale: number,
		brightness: number,
		horizontally_flipped: boolean,
		vertically_flipped: boolean,
		palette?: Palette_Names,
		transform_matrix?: Transform_Matrix,
	}) => {
		/*
			Before we get started, we have a special 'magic name' used to make various objects (such as floating hp numbers) skip drawing a sprite entirely.
		*/
		if( p.asset_name !== 'omit_image' ){
			const asset_data_records = Asset_Manager_ƒ.get_data_for_asset_name(p._AM, p.asset_name, p.palette);
	
			if( size(asset_data_records) > 1 ){
				let info = Asset_Manager_ƒ.get_current_frame_number_and_asset_data_for_animation_sequence(
					Asset_Manager_ƒ.deterministically_convolute_animation_sequence(asset_data_records, p.current_milliseconds),
					p.current_milliseconds
				)

				Asset_Manager_ƒ.draw_image_for_asset_name__single_image({
					...p,
					asset_name: p.asset_name as Image_Data_Names,
					asset_data: info.asset_data,
					current_milliseconds: info.current_time_offset,
				})				
			}


			if( size(asset_data_records) == 1 ){
				Asset_Manager_ƒ.draw_image_for_asset_name__single_image({
					asset_data: asset_data_records[0],
					...p,
					asset_name: p.asset_name as Image_Data_Names,
				})
			}
		}
	},


	draw_image_for_asset_name__single_image: (p: {
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		asset_name: Image_Data_Names,
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
		rotate: number,
		scale: number,
		brightness: number,
		horizontally_flipped: boolean,
		vertically_flipped: boolean,
		asset_data: Asset_Data_Record,
		transform_matrix?: Transform_Matrix,
	}) => {
		const { raw_image, metadata, image_data } = p.asset_data;

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
				_AM:					p._AM,
				pos:					{ x: p.pos.x, y: p.pos.y },
				z_index:				p.zorder,
				opacity:				p.opacity,
				rotate:					p.rotate,
				scale:					p.scale,
				brightness:				p.brightness,
				horizontally_flipped:	p.horizontally_flipped,
				vertically_flipped:		p.vertically_flipped,
				drawing_data:			{
											image_ref: raw_image,
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
										},
				transform_matrix: p.transform_matrix,
			});
		} else {
			Blit_Manager_ƒ.queue_draw_op({
				_BM:					p._BM,
				_AM:					p._AM,
				pos:					{ x: p.pos.x, y: p.pos.y },
				z_index:				p.zorder,
				opacity:				p.opacity,
				rotate:					p.rotate,
				scale:					p.scale,
				brightness:				p.brightness,
				horizontally_flipped:	p.horizontally_flipped,
				vertically_flipped:		p.vertically_flipped,
				drawing_data:			{
											image_ref: raw_image,
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
										},
				transform_matrix:		p.transform_matrix,
			});
		}
	},

	draw_text: (p: {
		text: string,
		_BM: Blit_Manager_Data,
		_AM: Asset_Manager_Data,
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
		rotate: number,
		scale: number,
		brightness: number,
		horizontally_flipped: boolean,
		vertically_flipped: boolean,
	}) => {
		Blit_Manager_ƒ.queue_draw_op({
			_BM:					p._BM,
			_AM:					p._AM,
			pos:					{ x: p.pos.x, y: p.pos.y },
			z_index:				p.zorder,
			opacity:				p.opacity,
			rotate:					p.rotate,
			scale:					p.scale,
			brightness: 			p.brightness,
			horizontally_flipped:	p.horizontally_flipped,
			vertically_flipped:		p.vertically_flipped,
			drawing_data:			{
										text: p.text,
									},
			transform_matrix:		undefined,
		});
	},

	draw_hitpoints: (p: {
		portion: number,
		buffer: number,
		_BM: Blit_Manager_Data,
		_AM: Asset_Manager_Data,
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
	}) => {
		Blit_Manager_ƒ.queue_draw_op({
			_BM:					p._BM,
			_AM:					p._AM,
			pos:					{ x: p.pos.x, y: p.pos.y },
			z_index:				p.zorder,
			opacity:				p.opacity,
			rotate:					0,
			scale:					1.0,
			brightness: 			1.0,
			horizontally_flipped:	false,
			vertically_flipped:		false,
			drawing_data:			{
										portion: p.portion,
										buffer: p.buffer,
									},
			transform_matrix:		undefined,
		});
	},

}