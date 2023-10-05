import _, { isEmpty, map, size } from "lodash";
import Prando from 'prando';
import { Blit_Manager_Data, Blit_Manager_ƒ } from "./Blit_Manager";
import * as Utils from "./Utils";
import { Point2D, Rectangle } from '../../interfaces';
import { asset_list } from "./Asset_List";
import { ƒ } from "./Utils";

interface ImageData {
	url: string,
	not_a_tile?: boolean, 
	name: string,
	bounds?: Rectangle,
	frames?: number,
	frame_duration?: number,
	ping_pong?: boolean,
	pad?: number,
};

export interface StaticValues {
	image_data_list: Array<ImageData>,
	raw_image_list: ImageDict,
	assets_meta: AssetsMetaDict,
	tile_types: Array<TileItem>,
};

interface ImageDict {
	[index: string]: HTMLImageElement
}

interface AssetsMetaDict {
	[index: string]: AssetsMetaSpritesheetItem|AssetsMetaSingleImageData,
}

interface AssetsMetaSpritesheetItem {
	dim: {
		w: number,
		h: number,
	},
	bounds: Rectangle,
}

interface AssetsMetaSingleImageData {
	dim: {
		w: number,
		h: number,
	},
}

interface TileItem {
	name: string,
	omit_from_random_map_generation?: boolean,
	variants: Array<VariantItem>,
};

interface VariantItem {
	graphics: Array<GraphicItem|GraphicItemAutotiled>,
};

interface GraphicItem {
	id: string,
	zorder: number,
};

interface GraphicItemAutotiled {
	id: string,
	zorder: number,
	restrictions: AutoTileRestrictionSample,
};

type GraphicItemGeneric = GraphicItemAutotiled|GraphicItem;



type TileComparatorRow = [string, string];
type TileComparatorRowCenter = [string, string, string];
export type TileComparatorSample = [TileComparatorRow, TileComparatorRowCenter, TileComparatorRow];


interface TilePositionComparatorRow extends Array<Point2D> { 0: Point2D; 1: Point2D; }
interface TilePositionComparatorRowCenter extends Array<Point2D> { 0: Point2D; 1: Point2D; 2: Point2D; }
export interface TilePositionComparatorSample extends Array<TilePositionComparatorRow|TilePositionComparatorRowCenter> { 0: TilePositionComparatorRow, 1: TilePositionComparatorRowCenter, 2: TilePositionComparatorRow };


interface AutoTileRestrictionRow extends Array<RegExp> { 0: RegExp; 1: RegExp; }
interface AutoTileRestrictionRowCenter extends Array<RegExp> { 0: RegExp; 1: RegExp; 2: RegExp; }
interface AutoTileRestrictionSample extends Array<AutoTileRestrictionRow|AutoTileRestrictionRowCenter> { 0: AutoTileRestrictionRow, 1: AutoTileRestrictionRowCenter, 2: AutoTileRestrictionRow };

export type ImageListCache = Array<string|null>;













var PATH_PREFIX = "./assets/"

let null_tile_comparator: TileComparatorSample =	[
														['',''],
														['','',''],
														['','']
													];


export type Asset_Manager_Data = {
	consts: {
		tile_width: number,
		tile_height: number,
		row_length: number,
		col_height: number,
	};
	static_vals: StaticValues;
	TileRNG: Prando;
}
													
export const New_Asset_Manager = (): Asset_Manager_Data => {
	return {
		consts: {
			tile_width: 38, //38
			tile_height: 15, //21
			row_length: 14,
			col_height: 20,
		},

		static_vals: asset_list,
		
		TileRNG: new Prando(),
	}
}



export const Asset_Manager_ƒ = {

/*----------------------- initialization and asset loading -----------------------*/
	//https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
	isAssetSpritesheet: ( asset: AssetsMetaSpritesheetItem | AssetsMetaSingleImageData ): asset is AssetsMetaSpritesheetItem => {
		return (<AssetsMetaSpritesheetItem>asset).bounds !== undefined;
	},

	isGraphicAutotiled: ( graphic: GraphicItem | GraphicItemAutotiled ): graphic is GraphicItemAutotiled => {
		return (<GraphicItemAutotiled>graphic).restrictions !== undefined;
	},


	yield_asset_name_list: (me: Asset_Manager_Data) => {
		return _.filter(
			me.static_vals.image_data_list,
			(value, index) => {
				return value.not_a_tile !== true;
			}
		).map( (value,index) => {
			return value.name;
		})
	},

	yield_tile_name_list: (me: Asset_Manager_Data) => {
		return _.sortedUniq(
			_.map( 
				_.filter(me.static_vals.tile_types, (val) => (val.omit_from_random_map_generation != true)),
				(value,index)=>(value.name)
			)
		);
	},

	yield_full_zorder_list: (me: Asset_Manager_Data) => {
			/*
				Step through each of the levels of the tile_types list, and spit out just the zorder values.   This leaves us with a nested structure (the same as the original tile data object's structure), and what we really want to do is just boil it down to a straight list, and figure out which ones are unique. 
			*/
		return  _.sortBy(
				_.uniq(
				_.flatten(
				_.flatten(
					_.map( me.static_vals.tile_types, (value,index)=>{
						return _.map( value.variants,  (value,index)=>{
							return _.map( value.graphics, (value,index)=>{
								return value.zorder;
							});
						}) 
					} )
			))));
	},


	launch_app: (
		me: Asset_Manager_Data,
		do_per_asset_loaded: (current: number, total: number) => void,
		do_once_app_ready: () => void 
	) => {
		me.static_vals.image_data_list.map( ( value, index ) => {

			var temp_image = new Image();
			var temp_url = PATH_PREFIX + value.url;
			
			temp_image.src = temp_url;

			temp_image.onload = () => {
				me.static_vals.raw_image_list[ value.name ] = temp_image;
				
				me.static_vals.assets_meta[ value.name ] = {
					dim: {
						w: temp_image.naturalWidth,
						h: temp_image.naturalHeight
					},
					bounds: value.bounds,
				};

				//Asset_Manager_ƒ.record_asset_load_count(me, do_per_asset_loaded);
				Asset_Manager_ƒ.launch_if_all_assets_are_loaded(me, do_once_app_ready);
			};
		});
	},

	record_asset_load_count: (
		me: Asset_Manager_Data,
		do_per_asset_loaded: (current: number, total: number) => void,
	) => {
		if( _.size( me.static_vals.image_data_list ) > _.size( me.static_vals.raw_image_list ) ) {
			do_per_asset_loaded( _.size( me.static_vals.image_data_list) , _.size( me.static_vals.raw_image_list ) );
		}
	},

	launch_if_all_assets_are_loaded: ( me: Asset_Manager_Data, do_once_app_ready: ()=>void ) => {
		/*
			There's a big problem most canvas apps have, which is that the canvas will start doing its thing right away and start trying to render, even if you haven't loaded any of the images yet.  What we want to do is have it wait until all the images are done loading, so we're rolling a minimalist "asset manager" here.  The only way (I'm aware of) to tell if an image has loaded is the onload callback.  Thus, we register one of these on each and every image, before attempting to load it.

			Because we carefully wait to populate the values of `loadedAssets` until we're actually **in** the callback, we can just do a size comparison to determine if all of the loaded images are there.
		*/

		if( _.size( me.static_vals.image_data_list ) == _.size( me.static_vals.raw_image_list ) ) {
			do_once_app_ready();
		}
	},



/*----------------------- object draw ops -----------------------*/
	get_image_data_for_object: (me: Asset_Manager_Data, image_name: string):ImageData|undefined => {
		let { image_data_list } = me.static_vals;

		return _.find( image_data_list, (value, index) => (value.name == image_name) );
	},


/*----------------------- tile draw ops -----------------------*/
	get_asset_name_for_tile_at_zorder: (me: Asset_Manager_Data, tile_name: string, zorder: number):string|undefined => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = me.static_vals;
		
		let tile_data = Asset_Manager_ƒ.get_asset_data_for_tile_at_zorder(me, tile_name, zorder);

		if(tile_data && tile_data[0]) {
			return tile_data[0].id;
		} else {
			return undefined;
		}
	},

	get_tile_variant_data: (me: Asset_Manager_Data, tile_name: string): Array<VariantItem> => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = me.static_vals;

		let markup_data_for_tile = _.find( tile_types, (value, index) => (value.name == tile_name))
		
		if(markup_data_for_tile == undefined){
			console.error(`Nothing found in asset list for tile type ${tile_name}`);
			return [];
		} else {
			return markup_data_for_tile.variants;
		}
	},
	

	get_asset_data_for_tile_at_zorder: (me: Asset_Manager_Data, tile_name: string, zorder: number):Array<GraphicItemGeneric> => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = me.static_vals;
		
		if( tile_name != '' ){
			let tile_variants = Asset_Manager_ƒ.get_tile_variant_data(me, tile_name);

			if( _.size(tile_variants) ){
				let tile_data = _.filter(
					tile_variants[Asset_Manager_ƒ._tile_dice( me, tile_variants.length ) -1].graphics,
					(value, index) => {return value.zorder == zorder}
				);
				
				return tile_data;
			} else {
				return [];
			}
		} else {
			return [];
		}
	},


	yield_zorder_list_for_tile: (me: Asset_Manager_Data, tile_name: string): Array<number> => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = me.static_vals;
		
		
		let variant_graphic_sets: Array<Array<GraphicItem|GraphicItemAutotiled>> = _.map( Asset_Manager_ƒ.get_tile_variant_data(me, tile_name), (val) => (val.graphics) );
	
		let number_arrays: Array<Array<number>> = _.map( variant_graphic_sets, (val) => {
			return _.map(val, (val2) => (val2.zorder))
		} );
	
		let combined_number_arrays: Array<number> = _.flatten(number_arrays);
	
		let final_array: Array<number> = _.uniq(combined_number_arrays);
	
		return final_array ? final_array : [];
		
	},

	
	draw_all_assets_for_tile_type: (me: Asset_Manager_Data, tile_name: string, _BM: Blit_Manager_Data, pos: Point2D) => {
		let zorders = Asset_Manager_ƒ.yield_zorder_list_for_tile(me, tile_name); 
	
		zorders.map( (value,index) => {
			Asset_Manager_ƒ.draw_image_for_tile_type_at_zorder_and_pos(me, tile_name, _BM, value, pos.x, pos.y, null_tile_comparator, 0);
		});
	},
	
	draw_image_for_tile_type_at_zorder_and_pos: (
			_AM: Asset_Manager_Data,
			tile_name: string,
			_BM: Blit_Manager_Data,
			zorder: number,
			pos_x: number,
			pos_y: number,
			comparator: TileComparatorSample,
			current_milliseconds: number
		) =>
	{
		//_BM.ctx.save();

		//_BM.ctx.translate( pos_x, pos_y );
		let asset_data_array = Asset_Manager_ƒ.get_asset_data_for_tile_at_zorder(_AM, tile_name, zorder);

		var allow_drawing = true;
		
		asset_data_array.map( (value, index) => {
		
			if(  Asset_Manager_ƒ.isGraphicAutotiled(value) ){
				//this is where 
				allow_drawing = Asset_Manager_ƒ.should_we_draw_this_tile_based_on_its_autotiling_restrictions(comparator, value.restrictions);
			} 

			if( value.id && allow_drawing ){
				Asset_Manager_ƒ.draw_image_for_asset_name({
					_AM:						_AM,
					asset_name: 				value.id,
					_BM:						_BM,
					pos:						{ x: pos_x, y: pos_y },
					zorder:						zorder,
					current_milliseconds:		current_milliseconds,
					opacity:					1.0,
					brightness:					1.0,
					horizontally_flipped:		false,  //TODO - we may want to enable random, deterministic flipping of tiles for additional tile variety.  Only horizontal though.
					vertically_flipped:			false,
				});
			}
		});
		//_BM.ctx.restore();	
	},

	get_images_for_tile_type_at_zorder_and_pos: (p: {
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		zorder: number,
		pos: Point2D,
		tile_name: string,
		comparator: TileComparatorSample,
	}): ImageListCache => {

		let asset_data_array = Asset_Manager_ƒ.get_asset_data_for_tile_at_zorder(p._AM, p.tile_name, p.zorder);

		var allow_drawing = true;
		
		return asset_data_array.map( (value, index) => {
		
			if(  Asset_Manager_ƒ.isGraphicAutotiled(value) ){
				allow_drawing = Asset_Manager_ƒ.should_we_draw_this_tile_based_on_its_autotiling_restrictions(p.comparator, value.restrictions);
			}

			return ƒ.if( !isEmpty(value.id) && allow_drawing,
				value.id,
				null
			)
		});
	},

	draw_images_at_zorder_and_pos: (p: {
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		zorder: number,
		pos: Point2D,
		image_list: ImageListCache,
		current_milliseconds: number
	}) => {
		map(p.image_list, (value) => {
			if( value !== null ){
				Asset_Manager_ƒ.draw_image_for_asset_name({
					_AM:						p._AM,
					asset_name: 				value,
					_BM:						p._BM,
					pos:						p.pos,
					zorder:						p.zorder,
					current_milliseconds:		p.current_milliseconds,
					opacity:					1.0,
					brightness:					1.0,
					horizontally_flipped:		false,  //TODO - we may want to enable random, deterministic flipping of tiles for additional tile variety.  Only horizontal though.
					vertically_flipped:			false,
				});
			}
		});
	},


/*----------------------- generic draw ops -----------------------*/
	calculate_pingpong_frame_num: (absolute_frame_num: number, count: number) => {
		/*
			This is a bit ugly, so here's the lowdown:
			
			We're basically looking to take say, 6 frames, and actually turn them into a 12-frame-long animation.
			
			We want input values like:
			0	1	2	3	4	5	6	7	8	9	10
			to become
			0	1	2	3	4	5	4	3	2	1	0

			The very first thing we do is use "frame count minus 1", since we want 0->5, not 0->6
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
	
	draw_image_for_asset_name: (p: {
		_AM: Asset_Manager_Data,
		asset_name: string,
		_BM: Blit_Manager_Data,
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
		brightness: number,
		horizontally_flipped: boolean,
		vertically_flipped: boolean,
	}) => {
		/*
			Before we get started, we have a special 'magic name' used to make various objects (such as floating hp numbers) skip drawing a sprite entirely.
		*/
		if( p.asset_name !== 'omit_image' ){
			let { raw_image_list, image_data_list, assets_meta } = p._AM.static_vals;

			let image = raw_image_list[ p.asset_name ]!;
			let metadata = assets_meta[ p.asset_name ]!;
			let image_data = _.find(image_data_list, {name: p.asset_name});
			
			if(image_data == undefined){
				console.error(`Could not find an image in our image_data_list for the asset named ${p.asset_name}.`); 
			} else {
				let dim = metadata ? metadata.dim : { w: 20, h: 20 };  //safe-access

				let frame_count = image_data.frames ? image_data.frames : 1;
				let frame_duration = image_data.frame_duration ? image_data.frame_duration : 20;
				let frame_padding = image_data.pad ? image_data.pad : 0;

				/*
					And this is where we get into the business of calculating the current frame.
					We start by doing a pretty simple absolute division operation; check our current millisec timer, and see what that would be in frames.
					This is the number we feed into our various formulas.
				*/
				let absolute_frame_num = Math.floor(p.current_milliseconds / frame_duration);
				let current_frame_num;
				
				/*
					For relatively simple setups, like a straightforward 1,2,3 frame ordering, it's a piece of cake:
				*/
				if( !image_data.ping_pong ){
					current_frame_num = Utils.modulo(absolute_frame_num, frame_count);
				} else {
					current_frame_num = Asset_Manager_ƒ.calculate_pingpong_frame_num( absolute_frame_num, frame_count );	
				}

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
		brightness: number,
		horizontally_flipped: boolean,
		vertically_flipped: boolean,
	}) => {
		Blit_Manager_ƒ.queue_draw_op({
			_BM:					p._BM,
			pos:					{ x: p.pos.x, y: p.pos.y },
			z_index:				p.zorder,
			opacity:				p.opacity,
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
			brightness: 			1.0,
			horizontally_flipped:	false,
			vertically_flipped:		false,
			drawing_data:			{
										portion: p.portion,
									}
		});
	},


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

	
/*----------------------- utility functions -----------------------*/
	_tile_dice: (me: Asset_Manager_Data, sides: number) => (
		Utils.dice_anchored_on_specific_random_seed( sides, me.TileRNG )
	),
}