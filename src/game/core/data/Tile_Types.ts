import { zorder } from "../constants/zorder";
import { Static_Values, Tile_Item } from "../engine/Asset_Manager/Asset_Manager";

/*
		special notes on this horrifying "negative match" regex:
		https://stackoverflow.com/questions/6449131/javascript-regular-expression-to-not-match-a-word
		https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
*/


export type Tile_Name = Tile_Name__Excluding_Virtual_Tiles | Tile_Name__Virtual_Tiles_Only;
export type Tile_Name_including_Empty = '' | Tile_Name;

export type Tile_Name__Excluding_Virtual_Tiles = 
"grass" |
"grass-and-scree" |
"dirt" |
"sandy-dirt" |
"scrub-dirt" |
"scrub-dirt-tall" |
"bush" |
"sand" |
"water" |
"water-placid" |
"water_reeds" |
"water_shallow" |
"wideleaf_scrub" |
"menhir-big" |
"menhir-small";

export type Tile_Name__Virtual_Tiles_Only = "red-path-unreachable-dot" |
"arrowhead_green" |
"arrow_green" |
"arrow_skinny_green" |
"arrowhead_skinny_green" |
"cursor_green" |
"tile_boundary";




const ground_tiles = /(dirt|grass|menhir|sand|bush|wideleaf_scrub)/;
const ground_level_tiles = /(dirt|grass|menhir|sand|bush|wideleaf_scrub|water_reeds|water_shallow)/;
const shallow_water_tiles = /(water_reeds|water_shallow)/;
const water_tiles = /(^water$|water-placid)/;


const not_any_arrow = /^((?!(arrow_green|arrowhead_green)).)*$/
const arrow_or_head = /arrow_green|arrowhead_green/

const not_any_skinny_arrow = /^((?!(arrow_skinny_green|arrowhead_skinny_green)).)*$/
const skinny_arrow_or_head = /arrow_skinny_green|arrowhead_skinny_green/



export const tile_types: Array<Tile_Item> = [
	{
		name: "grass",
		graphics: [{
			zorder: zorder.grass,
			asset_variants: [
				'grass1',
				'grass2',
				'grass3',
				'grass4',
				'grass5',
				'grass6',
				'grass7',
			],		
		}],
	},{
		name: "grass-and-scree",
		graphics: [{
			zorder: zorder.grass,
			asset_variants: [
				'grass-and-scree1',
				'grass-and-scree2',
				'grass-and-scree3',
				'grass-and-scree4',
				'grass-and-scree5',
				'grass-and-scree6',
				'grass-and-scree7',
				'grass-and-scree8',
			],		
		}],
	},{
		name: "dirt",
		graphics: [{
			zorder: zorder.grass,
			asset_variants: [
				'dirt1',
				'dirt2',
			],		
		}],
	},{
		name: "sandy-dirt",
		graphics: [{
			zorder: zorder.grass,
			asset_variants: [
				'sandy-dirt1',
			],		
		}],
	},{
		name: "scrub-dirt",
		graphics: [{
			zorder: zorder.grass,
			asset_variants: [
				'scrub-dirt1',
				'scrub-dirt2',
			],
		}],
	},{
		name: "scrub-dirt-tall",
		graphics: [{
			zorder: zorder.grass,
			asset_variants: [
				'scrub-dirt-tall1',
				'scrub-dirt-tall2',
			],
		}],
	},{
		name: "bush",
		graphics: [{
			zorder: zorder.rocks,
			asset_variants: [
				'bush1',
				'bush2',
				'bush3',
				'bush4',
				'bush5',
				'bush6',
			],
		},{
			zorder: zorder.grass,
			asset_variants: [
				'grass1',
				'grass2',
				'grass3',
				'grass4',
				'grass5',
				'grass6',
				'grass7',
			],		
		}],
	},{
		name: "wideleaf_scrub",
		graphics: [{
			zorder: zorder.rocks,
			asset_variants: [
				'wideleaf_scrub1',
				'wideleaf_scrub2',
			],
		},{
			zorder: zorder.grass,
			asset_variants: [
				'grass1',
				'grass2',
				'grass3',
				'grass4',
				'grass5',
				'grass6',
				'grass7',
			],		
		}],
	},{
		name: "sand",
		graphics: [{
			zorder: zorder.grass,
			asset_variants: [
				'sand1',
				'sand2',
				'sand3',
			],
		}],
	},{
		name: "water",
		graphics: [{
			zorder: zorder.water_underlay,
			asset_variants: [
				'water-underlay1',
				'water-underlay2',
				'water-underlay3',
			],
		},{
			zorder: zorder.water_surface,
			asset_variants: [
				'water_ripples_1',
				'water_ripples_2',
			],
		},{
			zorder: zorder.water_shore_walls,
			asset_variants: [
				'shore-walls-right1',
				'shore-walls-right2',
				'shore-walls-right3',
				'shore-walls-right4',
			],	
			restrictions:	[
						[/.*/, ground_level_tiles],
					[/.*/, water_tiles, /.*/],
						[/.*/, /.*/]
			]
		},{
			zorder: zorder.water_shore_walls,
			asset_variants: [
				'shore-walls-left1',
				'shore-walls-left2',
				'shore-walls-left3',
				'shore-walls-left4',
			],	
			restrictions:	[
						[ground_level_tiles, /.*/],
					[/.*/, water_tiles, /.*/],
						[/.*/, /.*/]
			]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-nw1',
			],
			restrictions:	[
								[/.*/, ground_tiles],
									[/.*/, water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-ne1',
			],
			restrictions:	[
								[ground_tiles, /.*/],
									[/.*/, water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-e1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[ground_tiles, water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-w1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, water_tiles, ground_tiles],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-sw1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, water_tiles, /.*/],
										[/.*/, ground_tiles]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-se1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, water_tiles, /.*/],
										[ ground_tiles, /.*/]
							]
		}],
	},{
		name: "water-placid",
		graphics: [{
			zorder: zorder.water_underlay,
			asset_variants: [
				'water-underlay-sparse1',
				'water-underlay-sparse2',
				'water-underlay-sparse3',
				'water-underlay-sparse4',
				'water-underlay-sparse5',
				'water-underlay-sparse6',
			],
		},{
			zorder: zorder.water_surface,
			asset_variants: [
				'water_ripples_1',
				'water_ripples_2',
			],
		},{
			zorder: zorder.water_shore_walls,
			asset_variants: [
				'shore-walls-right1',
				'shore-walls-right2',
				'shore-walls-right3',
				'shore-walls-right4',
			],	
			restrictions:	[
						[/.*/, ground_level_tiles],
					[/.*/, water_tiles, /.*/],
						[/.*/, /.*/]
			]
		},{
			zorder: zorder.water_shore_walls,
			asset_variants: [
				'shore-walls-left1',
				'shore-walls-left2',
				'shore-walls-left3',
				'shore-walls-left4',
			],	
			restrictions:	[
						[ground_level_tiles, /.*/],
					[/.*/, water_tiles, /.*/],
						[/.*/, /.*/]
			]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-nw1',
			],
			restrictions:	[
										[/.*/, ground_tiles],
									[/.*/, water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-ne1',
			],
			restrictions:	[
										[ground_tiles, /.*/],
									[/.*/, water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-e1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[ground_tiles, water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-w1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, water_tiles, ground_tiles],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-sw1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, water_tiles, /.*/],
										[/.*/, ground_tiles]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-edge-se1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, water_tiles, /.*/],
										[ ground_tiles, /.*/]
							]
		}],
	},


	{
		name: "menhir-big",
		graphics: [{
			zorder: zorder.rocks,
			asset_variants: [
				'menhir-big2',
				'menhir-big4',
				'menhir-big5',
			],
		},{
			zorder: zorder.grass,
			asset_variants: [
				'dirt1',
				'dirt2',
			],		
		}],

	},{
		name: "menhir-small",
		graphics: [{
			zorder: zorder.rocks,
			asset_variants: [
				'menhir-small1',
				'menhir-small2',
				'menhir-small3',
				'menhir-small4',
				'menhir-small5',
				'menhir-small6',
				'menhir-small7',
			],
		},{
			zorder: zorder.grass,
			asset_variants: [
				'dirt1',
				'dirt2',
			],		
		}],

	},{
		name: "red-path-unreachable-dot",
		omit_from_random_map_generation: true,
		graphics: [{
			zorder: zorder.rocks,
			asset_variants: [
				'red-path-unreachable-dot',
			],
		}],
	},{
		name: "cursor_green",
		omit_from_random_map_generation: true,
		graphics: [{
			zorder: zorder.map_cursor_low,
			asset_variants: [
				'cursor_green',
			],
		}],
	},

	{
		name: "arrowhead_green",
		omit_from_random_map_generation: true,
		graphics: [{
			asset_variants: [
				'arrowhead-e',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/arrow_green/, /arrowhead_green/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead-w',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrowhead_green/, /arrow_green/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead-sw',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /arrow_green/],
									[/.*/, /arrowhead_green/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead-se',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/arrow_green/, /.*/],
									[/.*/, /arrowhead_green/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead-nw',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrowhead_green/, /.*/],
										[/.*/, /arrow_green/]
							]
		},{
			asset_variants: [
				'arrowhead-ne',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrowhead_green/, /.*/],
										[/arrow_green/, /.*/]
							]
		}]
	},

	{
		name: "arrow_green",
		omit_from_random_map_generation: true,
		graphics: [{
			asset_variants: [
				'arrow-horizontal-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[arrow_or_head, /arrow_green/, arrow_or_head],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrow-se-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[arrow_or_head, /.*/],
									[/.*/, /arrow_green/, /.*/],
										[/.*/, arrow_or_head]
							]
		},{
			asset_variants: [
				'arrow-ne-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, arrow_or_head],
									[/.*/, /arrow_green/, /.*/],
										[arrow_or_head, /.*/]
							]
		},{
			asset_variants: [
				'arrow-w-to-se-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[arrow_or_head, /arrow_green/, /.*/],
										[/.*/, arrow_or_head]
							]
		},{
			asset_variants: [
				'arrow-nw-to-e-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[arrow_or_head, /.*/],
									[/.*/, /arrow_green/, arrow_or_head],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrow-sw-to-e-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrow_green/, arrow_or_head],
										[arrow_or_head, /.*/]
							]
		},{
			asset_variants: [
				'arrow-w-to-ne-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, arrow_or_head],
									[arrow_or_head, /arrow_green/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrow-sw-to-nw-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[arrow_or_head, /.*/],
									[/.*/, /arrow_green/, /.*/],
										[arrow_or_head, /.*/]
							]
		},{
			asset_variants: [
				'arrow-se-to-ne-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, arrow_or_head],
									[/.*/, /arrow_green/, /.*/],
										[/.*/, arrow_or_head]
							]
		},{
			asset_variants: [
				'arrow-nw-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[not_any_arrow, not_any_arrow],
									[not_any_arrow, /arrow_green/, not_any_arrow],
										[not_any_arrow, /arrow_green/]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[not_any_arrow, not_any_arrow],
									[not_any_arrow, /arrow_green/, not_any_arrow],
										[not_any_arrow, /arrow_green/]
							]
		},{
			asset_variants: [
				'arrow-ne-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[not_any_arrow, not_any_arrow],
									[not_any_arrow, /arrow_green/, not_any_arrow],
										[/arrow_green/, not_any_arrow]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[not_any_arrow, not_any_arrow],
									[not_any_arrow, /arrow_green/, not_any_arrow],
										[/arrow_green/, not_any_arrow]
							]
		},{
			asset_variants: [
				'arrow-se-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/arrow_green/, not_any_arrow],
									[not_any_arrow, /arrow_green/, not_any_arrow],
										[not_any_arrow, not_any_arrow]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[/arrow_green/, not_any_arrow],
									[not_any_arrow, /arrow_green/, not_any_arrow],
										[not_any_arrow, not_any_arrow]
							]
		},{
			asset_variants: [
				'arrow-sw-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[not_any_arrow, /arrow_green/],
									[not_any_arrow, /arrow_green/, not_any_arrow],
										[not_any_arrow, not_any_arrow]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[not_any_arrow, /arrow_green/],
									[not_any_arrow, /arrow_green/, not_any_arrow],
										[not_any_arrow, not_any_arrow]
							]
		},{
			asset_variants: [
				'arrow-e-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[not_any_arrow, not_any_arrow],
									[/arrow_green/, /arrow_green/, not_any_arrow],
										[not_any_arrow, not_any_arrow]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[not_any_arrow, not_any_arrow],
									[/arrow_green/, /arrow_green/, not_any_arrow],
										[not_any_arrow, not_any_arrow]
							]
		},{
			asset_variants: [
				'arrow-w-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[not_any_arrow, not_any_arrow],
									[not_any_arrow, /arrow_green/, /arrow_green/],
										[not_any_arrow, not_any_arrow]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[not_any_arrow, not_any_arrow],
									[not_any_arrow, /arrow_green/, /arrow_green/],
										[not_any_arrow, not_any_arrow]
							]
		}],
	},



	{
		name: "arrowhead_skinny_green",
		omit_from_random_map_generation: true,
		graphics: [{
			asset_variants: [
				'arrowhead_skinny_e',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, /.*/],
									[/arrow_skinny_green/, /arrowhead_skinny_green/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead_skinny_w',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrowhead_skinny_green/, /arrow_skinny_green/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead_skinny_sw',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, /arrow_skinny_green/],
									[/.*/, /arrowhead_skinny_green/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead_skinny_se',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/arrow_skinny_green/, /.*/],
									[/.*/, /arrowhead_skinny_green/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead_skinny_nw',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrowhead_skinny_green/, /.*/],
										[/.*/, /arrow_skinny_green/]
							]
		},{
			asset_variants: [
				'arrowhead_skinny_ne',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrowhead_skinny_green/, /.*/],
										[/arrow_skinny_green/, /.*/]
							]
		}]
	},	
	{
		name: "arrow_skinny_green",
		omit_from_random_map_generation: true,
		graphics: [{
			asset_variants: [
				'arrow_skinny_horizontal_bar',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, /.*/],
									[skinny_arrow_or_head, /arrow_skinny_green/, skinny_arrow_or_head],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrow_skinny_se_bar',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[skinny_arrow_or_head, /.*/],
									[/.*/, /arrow_skinny_green/, /.*/],
										[/.*/, skinny_arrow_or_head]
							]
		},{
			asset_variants: [
				'arrow_skinny_ne_bar',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, skinny_arrow_or_head],
									[/.*/, /arrow_skinny_green/, /.*/],
										[skinny_arrow_or_head, /.*/]
							]
		},{
			asset_variants: [
				'arrow_skinny_w_to_se_bar',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, /.*/],
									[skinny_arrow_or_head, /arrow_skinny_green/, /.*/],
										[/.*/, skinny_arrow_or_head]
							]
		},{
			asset_variants: [
				'arrow_skinny_nw_to_e_bar',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[skinny_arrow_or_head, /.*/],
									[/.*/, /arrow_skinny_green/, skinny_arrow_or_head],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrow_skinny_sw_to_e_bar',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrow_skinny_green/, skinny_arrow_or_head],
										[skinny_arrow_or_head, /.*/]
							]
		},{
			asset_variants: [
				'arrow_skinny_w_to_ne_bar',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, skinny_arrow_or_head],
									[skinny_arrow_or_head, /arrow_skinny_green/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrow_skinny_sw_to_nw_bar',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[skinny_arrow_or_head, /.*/],
									[/.*/, /arrow_skinny_green/, /.*/],
										[skinny_arrow_or_head, /.*/]
							]
		},{
			asset_variants: [
				'arrow_skinny_se_to_ne_bar',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/.*/, skinny_arrow_or_head],
									[/.*/, /arrow_skinny_green/, /.*/],
										[/.*/, skinny_arrow_or_head]
							]
		},{
			asset_variants: [
				'arrow_skinny_nw_endcap',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[not_any_skinny_arrow, not_any_skinny_arrow],
									[not_any_skinny_arrow, /arrow_skinny_green/, not_any_skinny_arrow],
										[not_any_skinny_arrow, /arrow_skinny_green/]
							]
		},{
			asset_variants: [
				'arrow_skinny_ne_endcap',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[not_any_skinny_arrow, not_any_skinny_arrow],
									[not_any_skinny_arrow, /arrow_skinny_green/, not_any_skinny_arrow],
										[/arrow_skinny_green/, not_any_skinny_arrow]
							]
		},{
			asset_variants: [
				'arrow_skinny_se_endcap',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[/arrow_skinny_green/, not_any_skinny_arrow],
									[not_any_skinny_arrow, /arrow_skinny_green/, not_any_skinny_arrow],
										[not_any_skinny_arrow, not_any_skinny_arrow]
							]
		},{
			asset_variants: [
				'arrow_skinny_sw_endcap',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[not_any_skinny_arrow, /arrow_skinny_green/],
									[not_any_skinny_arrow, /arrow_skinny_green/, not_any_skinny_arrow],
										[not_any_skinny_arrow, not_any_skinny_arrow]
							]
		},{
			asset_variants: [
				'arrow_skinny_e_endcap',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[not_any_skinny_arrow, not_any_skinny_arrow],
									[/arrow_skinny_green/, /arrow_skinny_green/, not_any_skinny_arrow],
										[not_any_skinny_arrow, not_any_skinny_arrow]
							]
		},{
			asset_variants: [
				'arrow_skinny_w_endcap',
			],
			zorder: zorder.map_arrows_low,
			restrictions:	[
										[not_any_skinny_arrow, not_any_skinny_arrow],
									[not_any_skinny_arrow, /arrow_skinny_green/, /arrow_skinny_green/],
										[not_any_skinny_arrow, not_any_skinny_arrow]
							]
		}],
	},

	

	{
		name: "water_reeds",
		graphics: [{
			zorder: zorder.water_underlay,
			asset_variants: [
				'water-underlay-sparse1',
				'water-underlay-sparse2',
				'water-underlay-sparse3',
				'water-underlay-sparse4',
				'water-underlay-sparse5',
				'water-underlay-sparse6',
			],
		},{
			zorder: zorder.rocks,
			asset_variants: [
				'water_reeds_1',
			],
		},{
			zorder: zorder.water_surface,
			asset_variants: [
				'water_ripples_1',
				'water_ripples_2',
			],
		},{
			zorder: zorder.water_shore_wall_top,
			asset_variants: [
				'water-underlay-dark1',
				'water-underlay-dark2',
			],
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-ne1',
			],
			restrictions:	[
										[/.*/, ground_tiles],
									[/.*/, shallow_water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-nw1',
			],
			restrictions:	[
										[ground_tiles, /.*/],
									[/.*/, shallow_water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-w1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[ground_tiles, shallow_water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-e1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, shallow_water_tiles, ground_tiles],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-se1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, shallow_water_tiles, /.*/],
										[/.*/, ground_tiles]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-sw1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, shallow_water_tiles, /.*/],
										[ ground_tiles, /.*/]
							]
		}],
	},{
		name: "water_shallow",
		graphics: [{
			zorder: zorder.water_underlay,
			asset_variants: [
				'water-underlay-sparse1',
				'water-underlay-sparse2',
				'water-underlay-sparse3',
				'water-underlay-sparse4',
				'water-underlay-sparse5',
				'water-underlay-sparse6',
			],
		},{
			zorder: zorder.water_surface,
			asset_variants: [
				'water_ripples_1',
				'water_ripples_2',
			],
		},{
			zorder: zorder.water_shore_wall_top,
			asset_variants: [
				'water-underlay-dark1',
				'water-underlay-dark2',
			],
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-ne1',
			],
			restrictions:	[
										[/.*/, ground_tiles],
									[/.*/, shallow_water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-nw1',
			],
			restrictions:	[
										[ground_tiles, /.*/],
									[/.*/, shallow_water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-w1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[ground_tiles, shallow_water_tiles, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-e1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, shallow_water_tiles, ground_tiles],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-se1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, shallow_water_tiles, /.*/],
										[/.*/, ground_tiles]
							]
		},{
			zorder: zorder.water_edge,
			asset_variants: [
				'water-underlay-edge-sw1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, shallow_water_tiles, /.*/],
										[ ground_tiles, /.*/]
							]
		}],
	},
	/*,{
		name: "anim_test",
		variants: [{
			graphics: [{
				id: 'animation_test',
				zorder: zorder.water_surface,
			}]
		}],
	}*/


	{
		name: "tile_boundary",
		graphics: [{
			zorder: zorder.map_boundary_low,
			asset_variants: [
				'tile_boundary_fill',
			],
		},{
			zorder: zorder.map_boundary,
			asset_variants: [
				'tile_boundary_ne1',
			],
			restrictions:	[
										[/.*/, /^((?!(tile_boundary)).)*$/],
									[/.*/, /tile_boundary/, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.map_boundary,
			asset_variants: [
				'tile_boundary_nw1',
			],
			restrictions:	[
										[/^((?!(tile_boundary)).)*$/, /.*/],
									[/.*/, /tile_boundary/, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.map_boundary,
			asset_variants: [
				'tile_boundary_w1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/^((?!(tile_boundary)).)*$/, /tile_boundary/, /.*/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.map_boundary,
			asset_variants: [
				'tile_boundary_e1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /tile_boundary/, /^((?!(tile_boundary)).)*$/],
										[/.*/, /.*/]
							]
		},{
			zorder: zorder.map_boundary,
			asset_variants: [
				'tile_boundary_se1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /tile_boundary/, /.*/],
										[/.*/, /^((?!(tile_boundary)).)*$/]
							]
		},{
			zorder: zorder.map_boundary,
			asset_variants: [
				'tile_boundary_sw1',
			],
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /tile_boundary/, /.*/],
										[ /^((?!(tile_boundary)).)*$/, /.*/]
							]
		}],

	}

];
	
