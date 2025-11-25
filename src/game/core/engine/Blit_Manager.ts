import React from "react";
import ReactDOM from "react-dom";
import _, { cloneDeep, reduce, zip, zipWith } from "lodash";

import { is_within_rectangle, ƒ } from "./Utils";
import { Asset_Manager_Data } from "./Asset_Manager/Asset_Manager";


import { Tile_Comparator_Sample } from "./Asset_Manager/Asset_Manager";

import { Gamespace_Pixel_Point, Point2D, Rectangle, Screenspace_Pixel_Point } from '../../interfaces';

interface Draw_Entity {
	pos: Point2D,
	z_index: number,
	opacity: number,
	brightness: number,
	rotate: number, // degrees; native canvas is radians, we're using degrees everywhere besides the blitting function.
	scale: number,
	horizontally_flipped: boolean,
	vertically_flipped: boolean,
	drawing_data: Draw_Data_Types,
}

interface Draw_Data_Image_With_Bounds {
	image_ref: HTMLImageElement,
	src_rect: Rectangle,
	dst_rect: Rectangle,
}

interface Draw_Data_Image_With_No_Bounds {
	//images that are just direct references don't need rectangular dimensions to draw
	//honestly we probably want to remove this, but for now we'll support it to keep the code train rolling.
	image_ref: HTMLImageElement,
	src_rect: Rectangle,
	dest_point: Point2D
}

interface Draw_Data_Text {
	text: string,
}

interface Draw_Data_Hitpoints {
	portion: number, //normalized (0.0 to 1.0)
}


type Draw_Data_Types = Draw_Data_Image_With_Bounds|Draw_Data_Image_With_No_Bounds|Draw_Data_Text|Draw_Data_Hitpoints;


interface Blit_Manager_State {
	last_scroll_tick: number,
	last_scroll_initiation_tick: number,
	//we've got two values here - we do a "intended" value for the viewport, but when we change the current camera position, we actually tween towards it gradually.  The current position we're *actually* aimed at gets stored in a different variable, since it either has to be derived from some sort of tweening function, or directly stored (if we did the tweeing function, the time-offset certainly would have to, so dimensionally this at least will always require one dimension of data storage).
	intended_viewport_offset: Point2D,
	actual_viewport_offset: Point2D,
	viewport_velocity: Point2D,
	viewport_tween_progress: number, //normalized 0.0 -> 1.0
}


export const ticks_to_ms = (tick_val: number): number => (
	Math.floor( tick_val * (1000 / 60))
)


export const ms_to_ticks = (ms_val: number): number => (
	Math.floor( ms_val * (60 / 1000))
)


export interface Time_Tracker_Data {
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
	time_tracker: Time_Tracker_Data;
	state: Blit_Manager_State;
	_Draw_List: Array<Draw_Entity>;
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
			last_scroll_tick: 0,
			last_scroll_initiation_tick: 0,
			viewport_tween_progress: 0,
			intended_viewport_offset: {x: 0, y: 0},
			actual_viewport_offset: {x: 0, y: 0},
			viewport_velocity: {x: 0, y: 0},
		}
	}
}



export const Blit_Manager_ƒ = {

	reset_context: ( me: Blit_Manager_Data, ctx: CanvasRenderingContext2D ) => {
		me.ctx = ctx;
	},

/*----------------------- state manipulation -----------------------*/
	/*
		If we try to start scrolling, record the time at which we started, and record the last moment we actually scrolled.  Only start moving once a delay has been elapsed.
	*/

	viewport_debounce_test: (me: Blit_Manager_Data, use_debounce: boolean): boolean => {
		const condition_past_delay = (me.state.last_scroll_tick - me.state.last_scroll_initiation_tick > 10);
		const condition_not_just_started = (me.state.last_scroll_tick == me.time_tracker.current_tick - 1);

		//console.error(condition_past_delay, condition_not_just_started, me.state.last_scroll_tick - me.state.last_scroll_initiation_tick);
		return (
			(use_debounce && condition_past_delay && condition_not_just_started) || !use_debounce
		)
	},

	get_viewport_debounce_values: (
		me: Blit_Manager_Data,
		use_debounce: boolean,
	): {
		last_scroll_tick: number,
		last_scroll_initiation_tick: number,
	} => {

		if(use_debounce){
			return {
				last_scroll_tick: me.time_tracker.current_tick,

				/*
					If we're exactly 1 frame further than the last scroll frame, we're "continuously scrolling", so leave this value alone.  If we're any other value, we've started a new scroll, so change it to the current tick.
				*/
				last_scroll_initiation_tick: me.state.last_scroll_tick == me.time_tracker.current_tick - 1
					?
					me.state.last_scroll_initiation_tick
					:
					me.time_tracker.current_tick,
			}
		} else {
			return {
				last_scroll_tick: me.state.last_scroll_tick,
				last_scroll_initiation_tick: me.state.last_scroll_initiation_tick,
			}
		}
	},


	adjust_viewport_pos: (
		me: Blit_Manager_Data,
		x: number,
		y: number,
		use_debounce: boolean,
	): Blit_Manager_Data => {

		if( Blit_Manager_ƒ.viewport_debounce_test(me, use_debounce) ){
			return {
				...cloneDeep(me),
				state: {
					...Blit_Manager_ƒ.get_viewport_debounce_values(me, use_debounce),
					viewport_tween_progress: (
						me.state.viewport_tween_progress == 1.0 
						?
						0.0
						:
						me.state.viewport_tween_progress * 0.3
					),
					intended_viewport_offset: {
						x: me.state.intended_viewport_offset.x + x,
						y: me.state.intended_viewport_offset.y + y
					},
					actual_viewport_offset: me.state.actual_viewport_offset,
					viewport_velocity: me.state.viewport_velocity,
				}
			}
		} else {
			return {
				...cloneDeep(me),
				state: {
					...me.state,
					...Blit_Manager_ƒ.get_viewport_debounce_values(me, use_debounce),
				}
			}
		}
	},

	add_viewport_velocity: (
		me: Blit_Manager_Data,
		x: number,
		y: number,
		use_debounce: boolean,
	): Blit_Manager_Data => {
		if( Blit_Manager_ƒ.viewport_debounce_test(me, use_debounce) ){
			return {
				...cloneDeep(me),
				state: {
					...me.state,
					...Blit_Manager_ƒ.get_viewport_debounce_values(me, use_debounce),
					viewport_velocity: {
						x: me.state.viewport_velocity.x + x,
						y: me.state.viewport_velocity.y + y
					}				
				}
			}
		} else {
			return {
				...cloneDeep(me),
				state: {
					...me.state,
					...Blit_Manager_ƒ.get_viewport_debounce_values(me, use_debounce),
				}
			}
		}
	},

	yield_gamespace_coords_for_absolute_coords: ( me: Blit_Manager_Data, pos: Screenspace_Pixel_Point) => {
		return <Gamespace_Pixel_Point>{
			x: pos.x - me.state.intended_viewport_offset.x,
			y: pos.y - me.state.intended_viewport_offset.y
		}
	},

	yield_absolute_coords_for_gamespace_coords: ( me: Blit_Manager_Data, pos: Gamespace_Pixel_Point) => {
		return <Screenspace_Pixel_Point>{
			x: me.state.intended_viewport_offset.x + pos.x,
			y: me.state.intended_viewport_offset.y + pos.y
		}
	},

/*----------------------- draw ops -----------------------*/
	queue_draw_op: (p: {
		_BM:					Blit_Manager_Data,
		_AM:					Asset_Manager_Data,
		pos:					Point2D,
		z_index:				number,
		opacity:				number,
		rotate: 				number,
		scale:					number,
		brightness: 			number,
		horizontally_flipped: 	boolean,
		vertically_flipped: 	boolean,
		drawing_data:			Draw_Data_Types
	}) => {

		const occlusion_margin = p._AM.static_vals.post_loading_metadata.max_asset_dimension;

		if(
			is_within_rectangle(p.pos, {
				x: -p._BM.state.actual_viewport_offset.x - occlusion_margin,
				y: -p._BM.state.actual_viewport_offset.y - occlusion_margin,
				w: p._BM._dimensions.x + 2 * occlusion_margin,
				h: p._BM._dimensions.y + 2 * occlusion_margin,
			})
		){
			p._BM._Draw_List.push({
				pos:					p.pos,
				z_index:				p.z_index,
				opacity:				p.opacity,
				rotate: 				p.rotate,
				scale:					p.scale,
				brightness: 			p.brightness,
				horizontally_flipped:	p.horizontally_flipped,
				vertically_flipped:		p.vertically_flipped,
				drawing_data:			p.drawing_data
			});
		}
	},
	
	
	draw_entire_frame: ( me: Blit_Manager_Data ): Blit_Manager_Data => {
		Blit_Manager_ƒ.iterate_viewport_tween(me);

		//round this here, rather than storing a rounded-value, so we're able to do pixel-fraction movement, but won't ever have display jaggies from the viewport "used by actual rendering" sitting at some mid-pixel position.
		const viewport_pos: Point2D = {
			x: Math.round(me.state.actual_viewport_offset.x),
			y: Math.round(me.state.actual_viewport_offset.y)
		};


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

		me.osb_ctx.imageSmoothingEnabled = false;						
		//then blit it
		_.map( sortedBlits, (value,index) => {
			if( Blit_Manager_ƒ.isDraw_Data_Image_With_BoundsForText(value.drawing_data) ){
				me.osb_ctx.save();
				me.osb_ctx.imageSmoothingEnabled = false;
				//@ts-ignore
				me.osb_ctx.textRendering = 'geometricPrecision';

				me.osb_ctx.font = '11.0px Endless Boss Battle, sans-serif';
				me.osb_ctx.textAlign = 'left';
		
				const metrics = me.osb_ctx.measureText(value.drawing_data.text)

				me.osb_ctx.translate(
					value.pos.x + viewport_pos.x - Math.floor(metrics.width / 2),
					value.pos.y + viewport_pos.y
				);

				me.osb_ctx.fillStyle = "#ffffff";
				me.osb_ctx.textBaseline = 'middle';
				me.osb_ctx.fillText(value.drawing_data.text, 0, 0);
				me.osb_ctx.restore();

			} else if ( Blit_Manager_ƒ.isDraw_Data_Image_With_BoundsForHitpoints(value.drawing_data)){
				me.osb_ctx.save();

				me.osb_ctx.translate(
					value.pos.x + viewport_pos.x,
					value.pos.y + viewport_pos.y,
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
			} else if( Blit_Manager_ƒ.isDraw_Data_Image_With_BoundsWithBounds(value.drawing_data) ){

				me.osb_ctx.save();

				/*
					Calculate how much we're supposed to add in order to scale the image.  If `value.scale` is less than 1.0, this will end up being a negative number, and thus, being subtraction.
				*/
				const scale_margin_horizontal = ((value.scale * value.drawing_data.dst_rect.w) - value.drawing_data.dst_rect.w) / 2.0;
				const scale_margin_vertical = ((value.scale * value.drawing_data.dst_rect.h) - value.drawing_data.dst_rect.h) / 2.0;



				me.osb_ctx.translate(
					value.pos.x + viewport_pos.x,
					value.pos.y + viewport_pos.y 
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
					ƒ.if(value.horizontally_flipped, -value.scale, value.scale),
					ƒ.if(value.vertically_flipped, -value.scale, value.scale),
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
					value.pos.x + viewport_pos.x,
					value.pos.y + viewport_pos.y
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
					ƒ.if(value.horizontally_flipped, -value.scale, value.scale),
					ƒ.if(value.vertically_flipped, -value.scale, value.scale),
				);


				me.osb_ctx.drawImage	(
					/* file */				value.drawing_data.image_ref,
					/* dst upper-left x */	value.drawing_data.dest_point.x,
					/* dst upper-left y */	value.drawing_data.dest_point.y,
									);
				me.osb_ctx.restore();
			}
		})



		//follow up with a few bits of utility-drawing:
		Blit_Manager_ƒ.update_time_data(me);
		
		if(me.show_info){
			Blit_Manager_ƒ.draw_fps_text(me);
		}

		//var bitmap = me._OffScreenBuffer.transferToImageBitmap();
		me.ctx.clearRect( 0, 0, me.ctx.canvas.width, me.ctx.canvas.height )
		me.ctx.drawImage(me._OffScreenBuffer, 0, 0);

		
		
		return {
			ctx: me.ctx,
			osb_ctx: me.osb_ctx,
			_OffScreenBuffer: me._OffScreenBuffer,
			_dimensions: me._dimensions,
			show_info: me.show_info,


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

	isDraw_Data_Image_With_BoundsWithBounds( data: Draw_Data_Types ): data is Draw_Data_Image_With_Bounds {
		return (<Draw_Data_Image_With_Bounds>data).dst_rect !== undefined;
	},

	isDraw_Data_Image_With_BoundsForText( data: Draw_Data_Types): data is Draw_Data_Text {
		return (<Draw_Data_Text>data).text !== undefined;
	},

	isDraw_Data_Image_With_BoundsForHitpoints( data: Draw_Data_Types): data is Draw_Data_Hitpoints {
		return (<Draw_Data_Hitpoints>data).portion !== undefined;
	},


/*----------------------- tweening -----------------------*/
	iterate_viewport_tween: ( me: Blit_Manager_Data ): Blit_Manager_State => {
		const { viewport_tween_progress, intended_viewport_offset, actual_viewport_offset, viewport_velocity } = me.state;
		const viewport_friction = 0.8;


		// if( viewport_tween_progress < 1.0 ){
		// 	return {
		// 		intended_viewport_offset: {
		// 			x: intended_viewport_offset.x + viewport_velocity.x,
		// 			y: intended_viewport_offset.x + viewport_velocity.y,
		// 		},
		// 		viewport_tween_progress: viewport_tween_progress + 0.02,
		// 		actual_viewport_offset: cloneDeep(intended_viewport_offset),
		// 		// actual_viewport_offset: {
		// 		// 	x: (actual_viewport_offset.x + viewport_tween_progress * ( intended_viewport_offset.x - actual_viewport_offset.x )),
		// 		// 	y: (actual_viewport_offset.y + viewport_tween_progress * ( intended_viewport_offset.y - actual_viewport_offset.y )),
		// 		// },
		// 		viewport_velocity: {
		// 			x: viewport_velocity.x * viewport_friction,
		// 			y: viewport_velocity.y * viewport_friction,
		// 		},
		// 	}
		// } else {
			return {
				last_scroll_tick: me.state.last_scroll_tick,
				last_scroll_initiation_tick: me.state.last_scroll_initiation_tick,
				viewport_tween_progress: 1.0,
				intended_viewport_offset: {
					x: intended_viewport_offset.x + viewport_velocity.x,
					y: intended_viewport_offset.y + viewport_velocity.y,
				},
				actual_viewport_offset: {
					x: intended_viewport_offset.x + viewport_velocity.x,
					y: intended_viewport_offset.y + viewport_velocity.y,
				},
				viewport_velocity: {
					x: viewport_velocity.x * viewport_friction,
					y: viewport_velocity.y * viewport_friction,
				},
			};
		// }
	},



/*----------------------- utility draw ops -----------------------*/
	fill_canvas_with_solid_color: ( me: Blit_Manager_Data, fill_color: string ) => {
		me.osb_ctx.save();
	    me.osb_ctx.fillStyle = fill_color;
		me.osb_ctx.clearRect( 0, 0, me.ctx.canvas.width, me.ctx.canvas.height )
		me.osb_ctx.fillRect(0,0, me.ctx.canvas.width, me.ctx.canvas.height);
		me.osb_ctx.restore();
	},

	

	update_time_data: ( me: Blit_Manager_Data ) => {
		var date = new Date();
		
		me.time_tracker.current_frame_count += 1;
		
		if( me.time_tracker.current_second < date.getSeconds() || (me.time_tracker.current_second == 59 && date.getSeconds() == 0) ){
			me.time_tracker.prior_frame_count = me.time_tracker.current_frame_count;
			me.time_tracker.current_frame_count = 0;
			me.time_tracker.current_second = date.getSeconds();
		} else {
			
		}
		
		me.time_tracker.current_millisecond = date.getTime();
	},

	draw_fps_text: ( me: Blit_Manager_Data) => {
		me.osb_ctx.save();
		me.osb_ctx.imageSmoothingEnabled = false;
//		me.osb_ctx.font = 'bold 18px pixel, sans-serif';
		me.osb_ctx.textAlign = 'left';

		me.osb_ctx.imageSmoothingEnabled = false;
		//@ts-ignore
		me.osb_ctx.textRendering = 'geometricPrecision';

		me.osb_ctx.font = '11.0px Endless Boss Battle, sans-serif';

		
		//me.osb_ctx.imageSmoothingEnabled = true;
		//me.osb_ctx.letterSpacing = '1.5px';		//TODO:  this works but typescript or the build tool doesn't understand that it's legal, yet.

		// for later reference:  https://stackoverflow.com/questions/4261090/html5-canvas-and-anti-aliasing/4261139
		//me.osb_ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
	    //me.osb_ctx.shadowOffsetY = 2;
	    //me.osb_ctx.shadowBlur = 3;

		const text = `FPS:  ${me.time_tracker.prior_frame_count.toString()}`;
		const position: Point2D = {x: 10, y: Math.round(me.osb_ctx.canvas.height - 14)}

		me.osb_ctx.strokeStyle = 'black';
		me.osb_ctx.miterLimit = 1;
		me.osb_ctx.lineJoin = 'miter';
		me.osb_ctx.lineWidth = 2.25;
		me.osb_ctx.textBaseline = 'middle';
		me.osb_ctx.strokeText(text, position.x, position.y + 1);
		
	    me.osb_ctx.fillStyle = "#ffffff";
		me.osb_ctx.fillText(text, position.x, position.y);
		me.osb_ctx.restore();
	},


}