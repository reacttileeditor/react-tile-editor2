import React from "react";
import ReactDOM from "react-dom";
import _, { cloneDeep, reduce, zip, zipWith } from "lodash";

import { ƒ } from "./Utils";
import { Asset_Manager_Data } from "./Asset_Manager";


import { TileComparatorSample } from "./Asset_Manager";

import { Point2D, Rectangle } from '../../interfaces';

interface DrawEntity {
	pos: Point2D,
	z_index: number,
	opacity: number,
	brightness: number,
	rotate: number, // degrees; native canvas is radians, we're using degrees everywhere besides the blitting function.
	horizontally_flipped: boolean,
	vertically_flipped: boolean,
	drawing_data: DrawDataTypes,
}

interface DrawData {
	image_ref: HTMLImageElement,
	src_rect: Rectangle,
	dst_rect: Rectangle,
}

interface DrawDataNoBounds {
	//images that are just direct references don't need rectangular dimensions to draw
	//honestly we probably want to remove this, but for now we'll support it to keep the code train rolling.
	image_ref: HTMLImageElement,
	src_rect: Rectangle,
	dest_point: Point2D
}

interface DrawDataText {
	text: string,
}

interface DrawDataHitpoints {
	portion: number, //normalized (0.0 to 1.0)
}


type DrawDataTypes = DrawData|DrawDataNoBounds|DrawDataText|DrawDataHitpoints;


interface BlitManagerState {
	//we've got two values here - we do a "intended" value for the viewport, but when we change the current camera position, we actually tween towards it gradually.  The current position we're *actually* aimed at gets stored in a different variable, since it either has to be derived from some sort of tweening function, or directly stored (if we did the tweeing function, the time-offset certainly would have to, so dimensionally this at least will always require one dimension of data storage).
	intended_viewport_offset: Point2D,
	actual_viewport_offset: Point2D,
	viewport_tween_progress: number, //normalized 0.0 -> 1.0
}


export const ticks_to_ms = (tick_val: number): number => (
	Math.round( tick_val * (1000 / 60))
)


export const ms_to_ticks = (ms_val: number): number => (
	Math.round( ms_val * (60 / 1000))
)


export interface TimeTrackerData {
	current_tick: number;
	current_second: number,
	current_millisecond: number,
	current_frame_count: number,
	prior_frame_count: number,
}

declare var OffscreenCanvas : any;

/*
	The main thrust of this component is to house a list of commingled objects that are going to be drawn in a given frame.  These objects are layered, and are given draw coords in the world's coordinate space.  They have no knowledge of "what" they are, nor of subsequent frames/animations/etc.   All they know is what image, what location, and what z-index.
	
	By doing this, we're able to commingle totally disparate kinds of objects - whether they're tiles being drawn at fixed "grid" locations, or players/enemies/props being drawn at arbitrary locations, and still have these objects interleave into z-layered order, so that i.e. an enemy can appear to stand *behind* a tree.

	The goal here is to allow shots and creatures to travel on fully freefrom paths, using tile locations as a mere "recommendation" that a path can either smoothly bezier along, or even ignore entirely.   We'd like to avoid the "hard grid-locked" nature of drawing engines like Civ 2 or Wesnoth, who at best could do tile-relative drawing positions.
*/


export type Blit_Manager_Data = {
	ctx: CanvasRenderingContext2D;
	time_tracker: TimeTrackerData;
	state: BlitManagerState;
	_Draw_List: Array<DrawEntity>;
	_OffScreenBuffer: HTMLCanvasElement;
	osb_ctx: CanvasRenderingContext2D;
	_dimensions: Point2D;
	show_info: boolean;
};

export const New_Blit_Manager = ( ctx: CanvasRenderingContext2D, dimensions: Point2D, show_info: boolean ): Blit_Manager_Data => {

	const osb = document.createElement('canvas');
	osb.width = dimensions.x;
	osb.height = dimensions.y;

	return {
		ctx: ctx,
			
		_dimensions: _.cloneDeep(dimensions),
		_OffScreenBuffer: osb,
		
		osb_ctx: (osb.getContext("2d") as CanvasRenderingContext2D),
		show_info: show_info,
		
		_Draw_List: [],
		time_tracker: {
			current_tick: 0,
			current_second: 0,
			current_millisecond: 0,
			current_frame_count: 0,
			prior_frame_count: 0,
		},

		state: {
			viewport_tween_progress: 0,
			intended_viewport_offset: {x: 0, y: 0},
			actual_viewport_offset: {x: 0, y: 0},
		}
	}
}



export const Blit_Manager_ƒ = {

	reset_context: ( me: Blit_Manager_Data, ctx: CanvasRenderingContext2D ) => {
		me.ctx = ctx;
	},

/*----------------------- state manipulation -----------------------*/
	adjust_viewport_pos: ( me: Blit_Manager_Data, x: number, y: number): Blit_Manager_Data => {
		return {
			...cloneDeep(me),
			state: {
				viewport_tween_progress: ƒ.if(me.state.viewport_tween_progress == 1.0,
					0.0,
					me.state.viewport_tween_progress * 0.3
				),
				intended_viewport_offset: {
					x: me.state.intended_viewport_offset.x + x,
					y: me.state.intended_viewport_offset.y + y
				},
				actual_viewport_offset: me.state.actual_viewport_offset,
			}
		}
	},

	yield_world_coords_for_absolute_coords: ( me: Blit_Manager_Data, pos: Point2D) => {
		return {
			x: pos.x - me.state.intended_viewport_offset.x,
			y: pos.y - me.state.intended_viewport_offset.y
		}
	},

/*----------------------- draw ops -----------------------*/
	queue_draw_op: (p: {
		_BM:					Blit_Manager_Data,
		pos:					Point2D,
		z_index:				number,
		opacity:				number,
		rotate: 				number,
		brightness: 			number,
		horizontally_flipped: 	boolean,
		vertically_flipped: 	boolean,
		drawing_data:			DrawDataTypes
	}) => {
		p._BM._Draw_List.push({
			pos:					p.pos,
			z_index:				p.z_index,
			opacity:				p.opacity,
			rotate: 				p.rotate,
			brightness: 			p.brightness,
			horizontally_flipped:	p.horizontally_flipped,
			vertically_flipped:		p.vertically_flipped,
			drawing_data:			p.drawing_data
		});
	},
	
	
	draw_entire_frame: ( me: Blit_Manager_Data ): Blit_Manager_Data => {
		Blit_Manager_ƒ.iterate_viewport_tween(me);
// 		console.log(me.state.actual_viewport_offset);
	
		//sort it all by painter's algorithm
		const sortedBlits =	_.sortBy(
							_.sortBy(
								_.sortBy(
									me._Draw_List,
									(val_x)=>( val_x.pos.x )
								),
								(val_y)=>( val_y.pos.y )
							),
							(val_z)=>( val_z.z_index )
						);

		//then blit it
		_.map( sortedBlits, (value,index) => {
			if( Blit_Manager_ƒ.isDrawDataForText(value.drawing_data) ){
				me.osb_ctx.save();
				me.osb_ctx.imageSmoothingEnabled = false;
				me.osb_ctx.font = '16px pixel, sans-serif';
				me.osb_ctx.textAlign = 'center';
		
				me.osb_ctx.translate(
					value.pos.x + me.state.actual_viewport_offset.x,
					value.pos.y + me.state.actual_viewport_offset.y
				);

				me.osb_ctx.fillStyle = "#ffffff";
				me.osb_ctx.textBaseline = 'middle';
				me.osb_ctx.fillText(value.drawing_data.text, 0, 0);
				me.osb_ctx.restore();

			} else if ( Blit_Manager_ƒ.isDrawDataForHitpoints(value.drawing_data)){
				me.osb_ctx.save();

				me.osb_ctx.translate(
					value.pos.x + me.state.actual_viewport_offset.x,
					value.pos.y + me.state.actual_viewport_offset.y - 50
				);
				me.osb_ctx.globalAlpha = value.opacity;

				me.osb_ctx.fillStyle = '#0009'
				me.osb_ctx.fillRect( -12, 1, 24, 1);
				
				me.osb_ctx.fillStyle = '#000'
				me.osb_ctx.fillRect( -12, -2, 24, 3);

				const fill_color_tween_set: Array<[number, number, number, number]> = [
					[ 59, 247,  65, 255],
					[137, 242,  53, 255],
					[209, 249,  93, 255],
					[242, 255,  29, 255],
					[255, 208, 102, 255],
					[255, 158, 110, 255],
					[255, 117, 107, 255],
					[255,   0,  50, 255],
				];

				//const get_interpolated_color = (number tween_point) -> [decimal]
				//([decimal] <- lib.math.interpolate(color_list, fraction));

				const constrain = (min: number, value: number, max: number): number => (
					ƒ.if(min > max, (min+max)/2, ƒ.if(min > value, min, ƒ.if(max < value, max, value)))
				);

				const tween = (color_list: Array<[number, number, number, number]>, percent_raw: number):  [number, number, number, number] => {
					//combine each element of both lists weighted by percent.

					//@ts-ignore  Who knows why it can't figure out this is the right type.
					return reduce(color_list, (color_one: [number, number, number, number], color_two: [number, number, number, number]) => {
						return zipWith(color_one, color_two, (a,b)=>{
							const percent = constrain(0, percent_raw, 1);

							return a*percent + b*(1.0-percent);
						})
					})
				}

				

				const final_color = tween(fill_color_tween_set, value.drawing_data.portion); //The base case, where we just tween between the two.
				

				me.osb_ctx.fillStyle = `rgba(${final_color[0]}, ${final_color[1]}, ${final_color[2]}, ${final_color[3]})`;//'#32a852';
				me.osb_ctx.fillRect( -12, -2, Math.round(24 * value.drawing_data.portion), 3);

				me.osb_ctx.restore();
			} else if( Blit_Manager_ƒ.isDrawDataWithBounds(value.drawing_data) ){

				me.osb_ctx.save();

				me.osb_ctx.translate(
					value.pos.x + me.state.actual_viewport_offset.x,
					value.pos.y + me.state.actual_viewport_offset.y
				);
				me.osb_ctx.globalAlpha = value.opacity;

				if( value.brightness != 1.0){
					/*
						Warning:  this is obscenely slow.  We may want some alternate solution to this, or *something*; for our initial, extremely limited use of it (flashing enemies to show hits) it should be tolerable.
					*/

					me.osb_ctx.filter = `brightness(${ Math.round(value.brightness * 100)}%)`;
				}

				me.osb_ctx.rotate(value.rotate * Math.PI / 180);

				me.osb_ctx.scale(
					ƒ.if(value.horizontally_flipped, -1, 1),
					ƒ.if(value.vertically_flipped, -1, 1),
				);
				
				me.osb_ctx.drawImage	(
					/* file */			value.drawing_data.image_ref,

									
					/* src xy */		value.drawing_data.src_rect.x,
										value.drawing_data.src_rect.y,
					/* src wh */		value.drawing_data.src_rect.w,
										value.drawing_data.src_rect.h,

									
					/* dst xy */		value.drawing_data.dst_rect.x,
										value.drawing_data.dst_rect.y,
					/* dst wh */		value.drawing_data.dst_rect.w,
										value.drawing_data.dst_rect.h,
									);
				me.osb_ctx.restore();
			} else {

				me.osb_ctx.save();

				me.osb_ctx.translate(
					value.pos.x + me.state.actual_viewport_offset.x + value.drawing_data.dest_point.x,
					value.pos.y + me.state.actual_viewport_offset.y + value.drawing_data.dest_point.y
				);
				me.osb_ctx.globalAlpha = value.opacity;

				me.osb_ctx.rotate(value.rotate * Math.PI / 180);

				me.osb_ctx.scale(
					ƒ.if(value.horizontally_flipped, -1, 1),
					ƒ.if(value.vertically_flipped, -1, 1),
				);

				/*
					The following transforms essentially exist so that flipped images will draw in their intended position, rather than a full image size increment in the opposite cardinal direction.
				*/

				me.osb_ctx.drawImage	(
					/* file */				value.drawing_data.image_ref,
					/* dst upper-left x */	ƒ.if(value.horizontally_flipped,
												-value.drawing_data.src_rect.w,
												0
											),
					/* dst upper-left y */	ƒ.if(value.vertically_flipped,
												-value.drawing_data.src_rect.h,
												0
											),
									);
				me.osb_ctx.restore();
			}
		})



		//follow up with a few bits of utility-drawing:
		if(me.show_info){
			Blit_Manager_ƒ.draw_fps(me);
		}

		//var bitmap = me._OffScreenBuffer.transferToImageBitmap();
		me.ctx.drawImage(me._OffScreenBuffer, 0, 0);

		
		
		return {
			...cloneDeep(me),

			state: Blit_Manager_ƒ.iterate_viewport_tween(me),
			/*
				Manage time tracking.  No matter how long it took, each frame is only considered "1 tick" long, and all animations are based on that metric, alone.
			*/
			time_tracker: {
				...cloneDeep(me.time_tracker),
				current_tick: me.time_tracker.current_tick + 1,
			},
			_Draw_List: [],  //then clear it, because the next frame needs to start from scratch
		}
	},

	isDrawDataWithBounds( data: DrawDataTypes ): data is DrawData {
		return (<DrawData>data).dst_rect !== undefined;
	},

	isDrawDataForText( data: DrawDataTypes): data is DrawDataText {
		return (<DrawDataText>data).text !== undefined;
	},

	isDrawDataForHitpoints( data: DrawDataTypes): data is DrawDataHitpoints {
		return (<DrawDataHitpoints>data).portion !== undefined;
	},


/*----------------------- tweening -----------------------*/
	iterate_viewport_tween: ( me: Blit_Manager_Data ): BlitManagerState => {
		const { viewport_tween_progress, intended_viewport_offset, actual_viewport_offset } = me.state;
	
		if( viewport_tween_progress < 1.0 ){
			return {
				intended_viewport_offset: cloneDeep(intended_viewport_offset),
				viewport_tween_progress: viewport_tween_progress + 0.02,
				actual_viewport_offset: {
					x: Math.floor(actual_viewport_offset.x + viewport_tween_progress * ( intended_viewport_offset.x - actual_viewport_offset.x )),
					y: Math.floor(actual_viewport_offset.y + viewport_tween_progress * ( intended_viewport_offset.y - actual_viewport_offset.y )),
				},
			}
		} else {
			return {
				viewport_tween_progress: 1.0,
				intended_viewport_offset: cloneDeep(intended_viewport_offset),
				actual_viewport_offset: cloneDeep(intended_viewport_offset),
			};
		}
	},



/*----------------------- utility draw ops -----------------------*/
	fill_canvas_with_solid_color: ( me: Blit_Manager_Data ) => {
		me.osb_ctx.save();
	    me.osb_ctx.fillStyle = "#000000";
		me.osb_ctx.fillRect(0,0, me.ctx.canvas.width, me.ctx.canvas.height);
		me.osb_ctx.restore();
	},

	draw_fps: ( me: Blit_Manager_Data ) => {
		var date = new Date();
		
		me.time_tracker.current_frame_count += 1;
		
		if( me.time_tracker.current_second < date.getSeconds() || (me.time_tracker.current_second == 59 && date.getSeconds() == 0) ){
			me.time_tracker.prior_frame_count = me.time_tracker.current_frame_count;
			me.time_tracker.current_frame_count = 0;
			me.time_tracker.current_second = date.getSeconds();
		} else {
			
		}
		
		me.time_tracker.current_millisecond = date.getTime();
		
		Blit_Manager_ƒ.draw_fps_text(me, me.time_tracker.prior_frame_count);
	},

	draw_fps_text: ( me: Blit_Manager_Data, value: number) => {
		me.osb_ctx.save();
		me.osb_ctx.imageSmoothingEnabled = false;
		me.osb_ctx.font = '16px pixel, sans-serif';
		me.osb_ctx.textAlign = 'left';

		// for later reference:  https://stackoverflow.com/questions/4261090/html5-canvas-and-anti-aliasing/4261139
		//me.osb_ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
	    //me.osb_ctx.shadowOffsetY = 2;
	    //me.osb_ctx.shadowBlur = 3;
	    me.osb_ctx.fillStyle = "#ffffff";
		me.osb_ctx.textBaseline = 'middle';
		me.osb_ctx.fillText(`FPS: ${value.toString()}`, (me.osb_ctx.canvas.width - 40), 10);
		me.osb_ctx.restore();
	},


}