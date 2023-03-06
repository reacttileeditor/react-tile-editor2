import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

import Prando from 'prando';

var PATH_PREFIX = "./assets/"
import { Blit_Manager } from "./Blit_Manager";
import * as Utils from "./Utils";


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

interface StaticValues {
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


import { Point2D, Rectangle } from '../interfaces';

let null_tile_comparator: TileComparatorSample =	[
														['',''],
														['','',''],
														['','']
													];

export class Asset_Manager {
	consts: {
		tile_width: number,
		tile_height: number,
		row_length: number,
		col_height: number,
	};
	static_vals: StaticValues;
	TileRNG: Prando;

/*----------------------- initialization and asset loading -----------------------*/
	constructor() {
		
//		this.state = {
//			tileStatus: null,
//		};

/*
		special notes on this horrifying "negative match" regex:
		https://stackoverflow.com/questions/6449131/javascript-regular-expression-to-not-match-a-word
		https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
*/

		this.consts = {
			tile_width: 38, //38
			tile_height: 15, //21
			row_length: 14,
			col_height: 20,
		}

		this.static_vals = {
			image_data_list: [{
				url: "map-cursor.png",
				name: "cursor",
				not_a_tile: true,
			},{
				url: "map-cursor-green.png",
				name: "cursor_green",
				not_a_tile: true,
			},{
				url: "map-cursor-red.png",
				name: "cursor_red",
				not_a_tile: true,
			},{
				url: "map-cursor-green-small.png",
				name: "cursor_green_small",
				not_a_tile: true,
			},{
				url: "map-cursor-red-small.png",
				name: "cursor_red_small",
				not_a_tile: true,
			},{
				url: "test2.png",
				name: "dirt1",
			},{
				url: "char1.png",
				name: "hermit",
			},{
				url: "char2-ne.png",
				name: "peasant-ne",
			},{
				url: "char2.png",
				name: "peasant-se",
			},{
				url: "char3.png",
				name: "skeleton",
			},{
				url: "red_dot.png",
				name: "red_dot",
			},{
				url: "char2-se-walk.png",
				name: "peasant-se-walk",
				frames: 8,
				frame_duration: 100,
				ping_pong: false,
				pad: 2,
				bounds: {
					x: 1,
					y: 1,
					w: 58,
					h: 118,
				},
			},{
				url: "char2-ne-walk.png",
				name: "peasant-ne-walk",
				frames: 8,
				frame_duration: 100,
				ping_pong: false,
				pad: 2,
				bounds: {
					x: 1,
					y: 1,
					w: 58,
					h: 118,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "menhir1",
				bounds: {
					x: 1,
					y: 1,
					w: 54,
					h: 58,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "menhir3",
				bounds: {
					x: 113,
					y: 1,
					w: 54,
					h: 58,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "menhir4",
				bounds: {
					x: 169,
					y: 1,
					w: 54,
					h: 58,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "menhir2",
				bounds: {
					x: 57,
					y: 1,
					w: 54,
					h: 58,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "grass-and-scree1",
				bounds: {
					x: 1,
					y: 97,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "grass-and-scree2",
				bounds: {
					x: 57,
					y: 97,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "grass-and-scree3",
				bounds: {
					x: 113,
					y: 97,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "grass1",
				bounds: {
					x: 1,
					y: 133,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "dirt2",
				bounds: {
					x: 57,
					y: 205,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "sandy-dirt1",
				bounds: {
					x: 57,
					y: 61,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "scrub-dirt1",
				bounds: {
					x: 57,
					y: 169,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "scrub-dirt2",
				bounds: {
					x: 113,
					y: 169,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "scrub-dirt-tall1",
				bounds: {
					x: 57,
					y: 313,
					w: 54,
					h: 48,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "scrub-dirt-tall2",
				bounds: {
					x: 113,
					y: 313,
					w: 54,
					h: 48,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "sand1",
				bounds: {
					x: 1,
					y: 277,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "sand2",
				bounds: {
					x: 57,
					y: 277,
					w: 54,
					h: 34,
				},
			},{
				url: "hex-tile-experiment-tiles.png",
				name: "sand3",
				bounds: {
					x: 113,
					y: 277,
					w: 54,
					h: 34,
				},
			},{
				url: "water-tiles.png",
				name: "water-base1",
				bounds: {
					x: 1,
					y: 25,
					w: 54,
					h: 34,
				},
			},{
				url: "water-tiles.png",
				name: "water-edge-nw1",
				bounds: {
					x: 1,
					y: 61,
					w: 54,
					h: 34,
				},
				frames: 4,
				frame_duration: 200,
				ping_pong: true,
				pad: 2,
			},{
				url: "water-tiles.png",
				name: "water-edge-w1",
				bounds: {
					x: 1,
					y: 97,
					w: 54,
					h: 34,
				},
				frames: 4,
				frame_duration: 200,
				ping_pong: true,
				pad: 2,
			},{
				url: "water-tiles.png",
				name: "water-edge-sw1",
				bounds: {
					x: 1,
					y: 133,
					w: 54,
					h: 34,
				},
			},{
				url: "water-tiles.png",
				name: "water-edge-se1",
				bounds: {
					x: 1,
					y: 169,
					w: 54,
					h: 34,
				},
			},{
				url: "water-tiles.png",
				name: "water-edge-e1",
				bounds: {
					x: 1,
					y: 205,
					w: 54,
					h: 34,
				},
				frames: 4,
				frame_duration: 200,
				ping_pong: true,
				pad: 2,
			},{
				url: "water-tiles.png",
				name: "water-edge-ne1",
				bounds: {
					x: 1,
					y: 241,
					w: 54,
					h: 34,
				},
				frames: 4,
				frame_duration: 200,
				ping_pong: true,
				pad: 2,
			},{
				url: "water-tile-sheet.png",
				name: "water-ripples",
				bounds: {
					x: 1,
					y: 1,
					w: 54,
					h: 34,
				},
				frames: 8,
				frame_duration: 200,
				pad: 2,
			},{
				url: "water-underlay.png",
				name: "water-underlay2",
				bounds: {
					x: 1,
					y: 1,
					w: 54,
					h: 34,
				},

				pad: 2,
			},{
				url: "water-underlay-placid.png",
				name: "water-underlay-placid",
				bounds: {
					x: 1,
					y: 1,
					w: 54,
					h: 34,
				},

				pad: 2,
			},{
				url: "water-underlay-tile-sheet.png",
				name: "water-underlay",
				bounds: {
					x: 1,
					y: 1,
					w: 54,
					h: 34,
				},
				frames: 8,
				frame_duration: 180,
				pad: 2,
			},{
				url: "animation_test.png",
				name: "animation_test",
				bounds: {
					x: 0,
					y: 0,
					w: 38,
					h: 21,
				},
				frames: 4,
				frame_duration: 200,
				ping_pong: true
			},{
				url: "arrow-tiles.png",
				name: "arrow-horizontal-bar",
				bounds: {
					x: 57,
					y: 1,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-se-bar",
				bounds: {
					x: 113,
					y: 1,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-ne-bar",
				bounds: {
					x: 1,
					y: 1,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-w-to-se-bar",
				bounds: {
					x: 57,
					y: 37,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-nw-to-e-bar",
				bounds: {
					x: 113,
					y: 37,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-sw-to-e-bar",
				bounds: {
					x: 57,
					y: 73,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-w-to-ne-bar",
				bounds: {
					x: 113,
					y: 73,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-se-to-ne-bar",
				bounds: {
					x: 1,
					y: 37,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-sw-to-nw-bar",
				bounds: {
					x: 1,
					y: 73,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-se-endcap",
				bounds: {
					x: 113,
					y: 145,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-ne-endcap",
				bounds: {
					x: 1,
					y: 109,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-sw-endcap",
				bounds: {
					x: 1,
					y: 145,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-nw-endcap",
				bounds: {
					x: 113,
					y: 109,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-e-endcap",
				bounds: {
					x: 57,
					y: 145,
					w: 54,
					h: 34,
				},
			},{
				url: "arrow-tiles.png",
				name: "arrow-w-endcap",
				bounds: {
					x: 57,
					y: 109,
					w: 54,
					h: 34,
				},
			}],


			raw_image_list: {},
			assets_meta: {},
			
			tile_types: [
				{
					name: "grass",
					variants: [{
							graphics: [{
								id: 'grass1',
								zorder: 3,
							}],
						}
					],
				},{
					name: "grass-and-scree",
					variants: [{
							graphics: [{
								id: 'grass-and-scree1',
								zorder: 3,
							}],
						},{
							graphics: [{
								id: 'grass-and-scree2',
								zorder: 3,
							}],
						},{
							graphics: [{
								id: 'grass-and-scree3',
								zorder: 3,
							}],
						}
					],
				},{
					name: "dirt",
					variants: [{
						graphics: [{
							id: 'dirt1',
							zorder: 3,
						}],
					},{
						graphics: [{
							id: 'dirt2',
							zorder: 3,
						}],
					}],
				},{
					name: "sandy-dirt",
					variants: [{
						graphics: [{
							id: 'sandy-dirt1',
							zorder: 3,
						}],
					}],
				},{
					name: "scrub-dirt",
					variants: [{
						graphics: [{
							id: 'scrub-dirt1',
							zorder: 3,
						}],
					},{
						graphics: [{
							id: 'scrub-dirt2',
							zorder: 3,
						}],
					}],
				},{
					name: "scrub-dirt-tall",
					variants: [{
						graphics: [{
							id: 'scrub-dirt-tall1',
							zorder: 3,
						}],
					},{
						graphics: [{
							id: 'scrub-dirt-tall2',
							zorder: 3,
						}],
					}],
				},{
					name: "sand",
					variants: [{
						graphics: [{
							id: 'sand1',
							zorder: 3,
						}],
					},{
						graphics: [{
							id: 'sand2',
							zorder: 3,
						}],
					},{
						graphics: [{
							id: 'sand3',
							zorder: 3,
						}],
					}],
				},{
					name: "water",
					variants: [{
						graphics: [{
							id: 'water-underlay',
							zorder: -1,
						},{
							id: 'water-ripples',
							zorder: 0,
						},{
							id: 'water-edge-nw1',
							zorder: 1,
							restrictions:	[
												[/.*/, /(dirt|grass|menhir|sand)/],
													[/.*/, /(water|water-still)/, /.*/],
														[/.*/, /.*/]
											]
						},{
							id: 'water-edge-ne1',
							zorder: 1,
							restrictions:	[
												[/(dirt|grass|menhir|sand)/, /.*/],
													[/.*/, /(water|water-still)/, /.*/],
														[/.*/, /.*/]
											]
						},{
							id: 'water-edge-e1',
							zorder: 1,
							restrictions:	[
														[/.*/, /.*/],
													[/(dirt|grass|menhir|sand)/, /(water|water-still)/, /.*/],
														[/.*/, /.*/]
											]
						},{
							id: 'water-edge-w1',
							zorder: 1,
							restrictions:	[
														[/.*/, /.*/],
													[/.*/, /(water|water-still)/, /(dirt|grass|menhir|sand)/],
														[/.*/, /.*/]
											]
						},{
							id: 'water-edge-sw1',
							zorder: 1,
							restrictions:	[
														[/.*/, /.*/],
													[/.*/, /(water|water-still)/, /.*/],
														[/.*/, /(dirt|grass|menhir|sand)/]
											]
						},{
							id: 'water-edge-se1',
							zorder: 1,
							restrictions:	[
														[/.*/, /.*/],
													[/.*/, /(water|water-still)/, /.*/],
														[ /(dirt|grass|menhir|sand)/, /.*/]
											]
						}],
					}],
				},{
					name: "water-placid",
					variants: [{
						graphics: [{
							id: 'water-underlay-placid',
							zorder: -1,
						},{
							id: 'water-edge-nw1',
							zorder: 1,
							restrictions:	[
												[/.*/, /(dirt|grass|menhir|sand)/],
													[/.*/, /(water|water-still)/, /.*/],
														[/.*/, /.*/]
											]
						},{
							id: 'water-edge-ne1',
							zorder: 1,
							restrictions:	[
												[/(dirt|grass|menhir|sand)/, /.*/],
													[/.*/, /(water|water-still)/, /.*/],
														[/.*/, /.*/]
											]
						},{
							id: 'water-edge-e1',
							zorder: 1,
							restrictions:	[
														[/.*/, /.*/],
													[/(dirt|grass|menhir|sand)/, /(water|water-still)/, /.*/],
														[/.*/, /.*/]
											]
						},{
							id: 'water-edge-w1',
							zorder: 1,
							restrictions:	[
														[/.*/, /.*/],
													[/.*/, /(water|water-still)/, /(dirt|grass|menhir|sand)/],
														[/.*/, /.*/]
											]
						},{
							id: 'water-edge-sw1',
							zorder: 1,
							restrictions:	[
														[/.*/, /.*/],
													[/.*/, /(water|water-still)/, /.*/],
														[/.*/, /(dirt|grass|menhir|sand)/]
											]
						},{
							id: 'water-edge-se1',
							zorder: 1,
							restrictions:	[
														[/.*/, /.*/],
													[/.*/, /(water|water-still)/, /.*/],
														[ /(dirt|grass|menhir|sand)/, /.*/]
											]
						}],
					}],
				},{
					name: "menhir2",
					variants: [{
						graphics: [{
							id: 'dirt1',
							zorder: 3,
						},{
							id: 'menhir2',
							zorder: 12,
						}],
					}],
				},{
					name: "menhir1",
					variants: [{
						graphics: [{
							id: 'dirt1',
							zorder: 3,
						},{
							id: 'menhir1',
							zorder: 12,
						}],
					},{
						graphics: [{
							id: 'dirt1',
							zorder: 3,
						},{
							id: 'menhir4',
							zorder: 12,
						}],
					},{
						graphics: [{
							id: 'dirt1',
							zorder: 3,
						},{
							id: 'menhir3',
							zorder: 12,
						}],
					}],
				},

				{
					name: "arrow-green",
					omit_from_random_map_generation: true,
					variants: [{
						graphics: [{
							id: 'arrow-horizontal-bar',
							zorder: 12,
							restrictions:	[
														[/.*/, /.*/],
													[/arrow/, /arrow/, /arrow/],
														[/.*/, /.*/]
											]
						},{
							id: 'arrow-se-bar',
							zorder: 12,
							restrictions:	[
														[/arrow/, /.*/],
													[/.*/, /arrow/, /.*/],
														[/.*/, /arrow/]
											]
						},{
							id: 'arrow-ne-bar',
							zorder: 12,
							restrictions:	[
														[/.*/, /arrow/],
													[/.*/, /arrow/, /.*/],
														[/arrow/, /.*/]
											]
						},{
							id: 'arrow-w-to-se-bar',
							zorder: 12,
							restrictions:	[
														[/.*/, /.*/],
													[/arrow/, /arrow/, /.*/],
														[/.*/, /arrow/]
											]
						},{
							id: 'arrow-nw-to-e-bar',
							zorder: 12,
							restrictions:	[
														[/arrow/, /.*/],
													[/.*/, /arrow/, /arrow/],
														[/.*/, /.*/]
											]
						},{
							id: 'arrow-sw-to-e-bar',
							zorder: 12,
							restrictions:	[
														[/.*/, /.*/],
													[/.*/, /arrow/, /arrow/],
														[/arrow/, /.*/]
											]
						},{
							id: 'arrow-w-to-ne-bar',
							zorder: 12,
							restrictions:	[
														[/.*/, /arrow/],
													[/arrow/, /arrow/, /.*/],
														[/.*/, /.*/]
											]
						},{
							id: 'arrow-sw-to-nw-bar',
							zorder: 12,
							restrictions:	[
														[/arrow/, /.*/],
													[/.*/, /arrow/, /.*/],
														[/arrow/, /.*/]
											]
						},{
							id: 'arrow-se-to-ne-bar',
							zorder: 12,
							restrictions:	[
														[/.*/, /arrow/],
													[/.*/, /arrow/, /.*/],
														[/.*/, /arrow/]
											]
						},{
							id: 'arrow-nw-endcap',
							zorder: 12,
							restrictions:	[
														[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
													[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
														[/^((?!(arrow)).)*$/, /arrow/]
											]
						},{
							id: 'arrow-ne-endcap',
							zorder: 12,
							restrictions:	[
														[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
													[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
														[/arrow/, /^((?!(arrow)).)*$/]
											]
						},{
							id: 'arrow-se-endcap',
							zorder: 12,
							restrictions:	[
														[/arrow/, /^((?!(arrow)).)*$/],
													[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
														[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
											]
						},{
							id: 'arrow-sw-endcap',
							zorder: 12,
							restrictions:	[
														[/^((?!(arrow)).)*$/, /arrow/],
													[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
														[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
											]
						},{
							id: 'arrow-e-endcap',
							zorder: 12,
							restrictions:	[
														[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
													[/arrow/, /arrow/, /^((?!(arrow)).)*$/],
														[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
											]
						},{
							id: 'arrow-w-endcap',
							zorder: 12,
							restrictions:	[
														[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
													[/^((?!(arrow)).)*$/, /arrow/, /arrow/],
														[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
											]
						}
						// ,{
						// 	id: 'arrow-w-endcap',
						// 	zorder: 12,
						// 	restrictions:	[
						// 								[/.*/, /.*/],
						// 							[/.*/, /arrow/, /.*/],
						// 								[/.*/, /.*/]
						// 					]
						// }
						],
					}],
				},				

				/*,{
					name: "anim_test",
					variants: [{
						graphics: [{
							id: 'animation_test',
							zorder: 0,
						}]
					}],
				}*/
			]
		};
		
		this.TileRNG = new Prando();
	}

	//https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
	isAssetSpritesheet( asset: AssetsMetaSpritesheetItem | AssetsMetaSingleImageData ): asset is AssetsMetaSpritesheetItem {
		return (<AssetsMetaSpritesheetItem>asset).bounds !== undefined;
	}

	isGraphicAutotiled( graphic: GraphicItem | GraphicItemAutotiled ): graphic is GraphicItemAutotiled {
		return (<GraphicItemAutotiled>graphic).restrictions !== undefined;
	}


	yield_asset_name_list = () => {
		return _.filter(
			this.static_vals.image_data_list,
			(value, index) => {
				return value.not_a_tile !== true;
			}
		).map( (value,index) => {
			return value.name;
		})
	}

	yield_tile_name_list = () => {
		return _.sortedUniq(
			_.map( 
				_.filter(this.static_vals.tile_types, (val) => (val.omit_from_random_map_generation != true)),
				(value,index)=>(value.name)
			)
		);
	}

	yield_full_zorder_list = () => {
			/*
				Step through each of the levels of the tile_types list, and spit out just the zorder values.   This leaves us with a nested structure (the same as the original tile data object's structure), and what we really want to do is just boil it down to a straight list, and figure out which ones are unique. 
			*/
		return  _.sortBy(
				_.uniq(
				_.flatten(
				_.flatten(
					_.map( this.static_vals.tile_types, (value,index)=>{
						return _.map( value.variants,  (value,index)=>{
							return _.map( value.graphics, (value,index)=>{
								return value.zorder;
							});
						}) 
					} )
			))));
	}


	launch_app = ( do_once_app_ready: ()=>void ) => {
		this.static_vals.image_data_list.map( ( value, index ) => {

			var temp_image = new Image();
			var temp_url = PATH_PREFIX + value.url;
			
			temp_image.src = temp_url;

			temp_image.onload = () => {
				this.static_vals.raw_image_list[ value.name ] = temp_image;
				
				this.static_vals.assets_meta[ value.name ] = {
					dim: {
						w: temp_image.naturalWidth,
						h: temp_image.naturalHeight
					},
					bounds: value.bounds,
				};
				this.launch_if_all_assets_are_loaded(do_once_app_ready);
			};
		});
	}

	launch_if_all_assets_are_loaded = ( do_once_app_ready: ()=>void ) => {
		/*
			There's a big problem most canvas apps have, which is that the canvas will start doing its thing right away and start trying to render, even if you haven't loaded any of the images yet.  What we want to do is have it wait until all the images are done loading, so we're rolling a minimalist "asset manager" here.  The only way (I'm aware of) to tell if an image has loaded is the onload callback.  Thus, we register one of these on each and every image, before attempting to load it.

			Because we carefully wait to populate the values of `loadedAssets` until we're actually **in** the callback, we can just do a size comparison to determine if all of the loaded images are there.
		*/

		if( _.size( this.static_vals.image_data_list ) == _.size( this.static_vals.raw_image_list ) ) {
			console.log( this.static_vals.assets_meta );

			do_once_app_ready();
		}
	}



/*----------------------- object draw ops -----------------------*/
	get_image_data_for_object = (image_name: string):ImageData|undefined => {
		let { image_data_list } = this.static_vals;

		return _.find( image_data_list, (value, index) => (value.name == image_name) );
	}


/*----------------------- tile draw ops -----------------------*/
	get_asset_name_for_tile_at_zorder = (tile_name: string, zorder: number):string|undefined => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = this.static_vals;
		
		let tile_data = this.get_asset_data_for_tile_at_zorder(tile_name, zorder);

		if(tile_data && tile_data[0]) {
			return tile_data[0].id;
		} else {
			return undefined;
		}
	}

	get_tile_variant_data = (tile_name: string): Array<VariantItem> => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = this.static_vals;

		let markup_data_for_tile = _.find( tile_types, (value, index) => (value.name == tile_name))
		
		if(markup_data_for_tile == undefined){
			console.error(`Nothing found in asset list for tile type ${tile_name}`);
			return [];
		} else {
			return markup_data_for_tile.variants;
		}
	}
	

	get_asset_data_for_tile_at_zorder = (tile_name: string, zorder: number):Array<GraphicItemGeneric> => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = this.static_vals;
		
		if( tile_name != '' ){
			let tile_variants = this.get_tile_variant_data(tile_name);

			if( _.size(tile_variants) ){
				let tile_data = _.filter(
					tile_variants[this._tile_dice( tile_variants.length ) -1].graphics,
					(value, index) => {return value.zorder == zorder}
				);
				
				return tile_data;
			} else {
				return [];
			}
		} else {
			return [];
		}
	}


	yield_zorder_list_for_tile = (tile_name: string): Array<number> => {
		let { raw_image_list, image_data_list, assets_meta, tile_types } = this.static_vals;
		
		
		let variant_graphic_sets: Array<Array<GraphicItem|GraphicItemAutotiled>> = _.map( this.get_tile_variant_data(tile_name), (val) => (val.graphics) );
	
		let number_arrays: Array<Array<number>> = _.map( variant_graphic_sets, (val) => {
			return _.map(val, (val2) => (val2.zorder))
		} );
	
		let combined_number_arrays: Array<number> = _.flatten(number_arrays);
	
		let final_array: Array<number> = _.uniq(combined_number_arrays);
	
		return final_array ? final_array : [];
		
	}

	
	draw_all_assets_for_tile_type = (tile_name: string, _BM: Blit_Manager, pos: Point2D) => {
		let zorders = this.yield_zorder_list_for_tile(tile_name); 
	
		zorders.map( (value,index) => {
			this.draw_image_for_tile_type_at_zorder_and_pos(tile_name, _BM, value, pos.x, pos.y, null_tile_comparator, 0);
		});
	}
	
	draw_image_for_tile_type_at_zorder_and_pos = (
			tile_name: string,
			_BM: Blit_Manager,
			zorder: number,
			pos_x: number,
			pos_y: number,
			comparator: TileComparatorSample,
			current_milliseconds: number
		) =>
	{
		//_BM.ctx.save();

		//_BM.ctx.translate( pos_x, pos_y );
		let asset_data_array = this.get_asset_data_for_tile_at_zorder(tile_name, zorder);

		var allow_drawing = true;
		
		asset_data_array.map( (value, index) => {
		
			if(  this.isGraphicAutotiled(value) ){
				//this is where 
				allow_drawing = this.should_we_draw_this_tile_based_on_its_autotiling_restrictions(comparator, value.restrictions);
			} 

			if( value.id && allow_drawing ){
				this.draw_image_for_asset_name({
					asset_name: 				value.id,
					_BM:						_BM,
					pos:						{ x: pos_x, y: pos_y },
					zorder:						zorder,
					current_milliseconds:		current_milliseconds,
					opacity:					1.0,
					horizontally_flipped:		false,  //TODO - we may want to enable random, deterministic flipping of tiles for additional tile variety.  Only horizontal though.
					vertically_flipped:			false,
				});
			}
		});
		//_BM.ctx.restore();	
	}

/*----------------------- generic draw ops -----------------------*/
	calculate_pingpong_frame_num = (absolute_frame_num: number, count: number) => {
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
	}
	
	draw_image_for_asset_name = (p: {
		asset_name: string,
		_BM: Blit_Manager,
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
		horizontally_flipped: boolean,
		vertically_flipped: boolean,
	}) => {
		let { raw_image_list, image_data_list, assets_meta } = this.static_vals;

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
				current_frame_num = this.calculate_pingpong_frame_num( absolute_frame_num, frame_count );	
			}

			/*
				This assumes the canvas is pre-translated so our draw position is at the final point, so we don't have to do any calculation for that, here.
			
				This is the place where we do all 'spritesheet' handling, and also where we do all animation handling.
			*/
		
			if( !this.isAssetSpritesheet(metadata) ){
				p._BM.queue_draw_op({
					pos:					{ x: p.pos.x, y: p.pos.y },
					z_index:				p.zorder,
					opacity:				p.opacity,
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
				p._BM.queue_draw_op({
					pos:					{ x: p.pos.x, y: p.pos.y },
					z_index:				p.zorder,
					opacity:				p.opacity,
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

	draw_text = (p: {
		text: string,
		_BM: Blit_Manager,
		pos: Point2D,
		zorder: number,
		current_milliseconds: number,
		opacity: number,
		horizontally_flipped: boolean,
		vertically_flipped: boolean,
	}) => {
		p._BM.queue_draw_op({
			pos:					{ x: p.pos.x, y: p.pos.y },
			z_index:				p.zorder,
			opacity:				p.opacity,
			horizontally_flipped:	p.horizontally_flipped,
			vertically_flipped:		p.vertically_flipped,
			drawing_data:			{
										text: p.text,
									}
		});
	}


/*----------------------- auto-tiling logic -----------------------*/
	should_we_draw_this_tile_based_on_its_autotiling_restrictions = ( tile_data: TileComparatorSample, autotile_restrictions: AutoTileRestrictionSample ): boolean => {
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
	}

	
/*----------------------- utility functions -----------------------*/
	_tile_dice = (sides: number) => (
		Utils.dice_anchored_on_specific_random_seed( sides, this.TileRNG )
	)
}