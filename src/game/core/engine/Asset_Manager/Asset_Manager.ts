import _, { isEmpty, isString, map, range, size } from "lodash";
import Prando from 'prando';
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../Blit_Manager";
import * as Utils from "../Utils";
import { Point2D, Rectangle } from '../../../interfaces';
import { asset_list } from "../../data/Asset_List";
import { is_all_true, ƒ } from "../Utils";
import { Dispatch, SetStateAction } from "react";
import { TileName } from "../../data/Tile_Types";
import { Multi_Tile_Pattern } from "../../data/Multi_Tile_Patterns";
import { concat, filter, uniq } from "ramda";
import { Initialization } from "./Initialization";

export interface ImageData {
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
	multi_tile_types: Array<Multi_Tile_Pattern>,
	multi_tile_pattern_metadata: {
		max_mtp_width: number,
		max_mtp_height: number,		
	}
};

interface ImageDict {
	[index: string]: HTMLImageElement
}

interface AssetsMetaDict {
	[index: string]: AssetsMetaSpritesheetItem|AssetsMetaSingleImageData,
}

interface AssetsMetaSpritesheetItem {
	preprocessed: boolean,
	dim: {
		w: number,
		h: number,
	},
	bounds: Rectangle,
}

interface AssetsMetaSingleImageData {
	preprocessed: boolean,
	dim: {
		w: number,
		h: number,
	},
}

export interface TileItem {
	name: TileName,
	omit_from_random_map_generation?: boolean,
	variants: Array<VariantItem>,
};

interface VariantItem {
	graphics: Array<GraphicItem|GraphicItemAutotiled>,
};

export interface GraphicItem {
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














let null_tile_comparator: TileComparatorSample =	[
														['',''],
														['','',''],
														['','']
													];


export type Asset_Manager_Data = {
	consts: {
		tile_width: number,
		tile_height: number,
	};
	static_vals: StaticValues;
	TileRNG: Prando;
}
													
export const New_Asset_Manager = (): Asset_Manager_Data => {
	return {
		consts: {
			tile_width: 38, //38
			tile_height: 16, //21
		},

		static_vals: asset_list,
		
		TileRNG: new Prando(),
	}
}



export const Asset_Manager_ƒ = {
	...Initialization,

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




/*----------------------- object draw ops -----------------------*/
	get_image_data_for_object: (me: Asset_Manager_Data, image_name: string):ImageData|undefined => {
		let { image_data_list } = me.static_vals;

		return _.find( image_data_list, (value, index) => (value.name == image_name) );
	},


/*----------------------- tile draw ops -----------------------*/

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
	


	get_all_asset_data_for_tile_type: (
		me: Asset_Manager_Data,
		tile_name: string
	):Array<GraphicItemGeneric> => {
		
		if( tile_name != '' ){
			let tile_variants = Asset_Manager_ƒ.get_tile_variant_data(me, tile_name);

			if( _.size(tile_variants) ){
				let tile_data = tile_variants[Asset_Manager_ƒ._tile_dice( me, tile_variants.length ) -1].graphics
				
				return tile_data;
			} else {
				return [];
			}
		} else {
			return [];
		}
	},

	yield_asset_list_for_tile_type_with_comparator: (
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		tile_name: string,
		comparator: TileComparatorSample,
	): Array<GraphicItem> => {

		let asset_data_array = Asset_Manager_ƒ.get_all_asset_data_for_tile_type(_AM, tile_name);

		var allow_drawing = true;
		
		const asset_blit_items = asset_data_array.map( (value, index) => {
		
			if(  Asset_Manager_ƒ.isGraphicAutotiled(value) ){
				//this is where 
				allow_drawing = Asset_Manager_ƒ.should_we_draw_this_tile_based_on_its_autotiling_restrictions(comparator, value.restrictions);
			} 

			if( value.id && allow_drawing ){
				return {
					id: value.id,
					zorder: value.zorder,
				};
			}
		});

		return filter((val)=>(val !== undefined), asset_blit_items) as Array<GraphicItem>;
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

	

	

	

/*----------------------- generic draw ops -----------------------*/
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

	get_current_frame_cycle: (image_data: ImageData, current_milliseconds: number): number => {
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

	get_current_frame_number: (image_data: ImageData, current_milliseconds: number): number => {
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

	get_raw_image_for_asset_name: (
		_AM: Asset_Manager_Data,
		asset_name: string,
	): HTMLImageElement => {
		let { raw_image_list, image_data_list, assets_meta } = _AM.static_vals;

		return raw_image_list[ asset_name ]!;
	},

	get_image_data_for_asset_name: (
		_AM: Asset_Manager_Data,
		asset_name: string,
	): ImageData|undefined => {
		let { raw_image_list, image_data_list, assets_meta } = _AM.static_vals;

		return _.find(image_data_list, {name: asset_name});
	},

	get_image_metadata_for_asset_name: (
		_AM: Asset_Manager_Data,
		asset_name: string,
	): AssetsMetaSpritesheetItem|AssetsMetaSingleImageData => {
		let { raw_image_list, image_data_list, assets_meta } = _AM.static_vals;

		return assets_meta[ asset_name ]!;
	},

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