import { zorder } from "../constants/zorder";
import { Static_Values, Tile_Item } from "../engine/Asset_Manager/Asset_Manager";

/*
		special notes on this horrifying "negative match" regex:
		https://stackoverflow.com/questions/6449131/javascript-regular-expression-to-not-match-a-word
		https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
*/


export type Tile_Name =
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
"wideleaf_scrub" |
"menhir-big" |
"menhir-small" |
"red-path-unreachable-dot" |
"arrowhead-green" |
"arrow-green" |
"cursor_green";

const ground_tiles = /(dirt|grass|menhir|sand|bush|wideleaf_scrub)/;
const water_tiles = /(water|water-still)/;

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
				'water-ripples',
			],
		},{
			zorder: zorder.grass,
			asset_variants: [
				'water_sparkles',
			],
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
				'water-underlay-placid',
				'water-underlay-sparse1',
				'water-underlay-sparse2',
			],
		},{
			zorder: zorder.water_surface,
			asset_variants: [
				'water-ripples',
			],
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
		name: "arrowhead-green",
		omit_from_random_map_generation: true,
		graphics: [{
			asset_variants: [
				'arrowhead-e',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/arrow/, /arrowhead/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead-w',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrowhead/, /arrow/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead-sw',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /arrow/],
									[/.*/, /arrowhead/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead-se',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/arrow/, /.*/],
									[/.*/, /arrowhead/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrowhead-nw',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrowhead/, /.*/],
										[/.*/, /arrow/]
							]
		},{
			asset_variants: [
				'arrowhead-ne',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrowhead/, /.*/],
										[/arrow/, /.*/]
							]
		}]
	},

	{
		name: "arrow-green",
		omit_from_random_map_generation: true,
		graphics: [{
			asset_variants: [
				'arrow-horizontal-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/arrow/, /arrow/, /arrow/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrow-se-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/arrow/, /.*/],
									[/.*/, /arrow/, /.*/],
										[/.*/, /arrow/]
							]
		},{
			asset_variants: [
				'arrow-ne-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /arrow/],
									[/.*/, /arrow/, /.*/],
										[/arrow/, /.*/]
							]
		},{
			asset_variants: [
				'arrow-w-to-se-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/arrow/, /arrow/, /.*/],
										[/.*/, /arrow/]
							]
		},{
			asset_variants: [
				'arrow-nw-to-e-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/arrow/, /.*/],
									[/.*/, /arrow/, /arrow/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrow-sw-to-e-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /.*/],
									[/.*/, /arrow/, /arrow/],
										[/arrow/, /.*/]
							]
		},{
			asset_variants: [
				'arrow-w-to-ne-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /arrow/],
									[/arrow/, /arrow/, /.*/],
										[/.*/, /.*/]
							]
		},{
			asset_variants: [
				'arrow-sw-to-nw-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/arrow/, /.*/],
									[/.*/, /arrow/, /.*/],
										[/arrow/, /.*/]
							]
		},{
			asset_variants: [
				'arrow-se-to-ne-bar',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/.*/, /arrow/],
									[/.*/, /arrow/, /.*/],
										[/.*/, /arrow/]
							]
		},{
			asset_variants: [
				'arrow-nw-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
									[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
									[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/]
							]
		},{
			asset_variants: [
				'arrow-ne-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
									[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
										[/arrow/, /^((?!(arrow)).)*$/]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
									[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
										[/arrow/, /^((?!(arrow)).)*$/]
							]
		},{
			asset_variants: [
				'arrow-se-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/arrow/, /^((?!(arrow)).)*$/],
									[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[/arrow/, /^((?!(arrow)).)*$/],
									[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
							]
		},{
			asset_variants: [
				'arrow-sw-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /arrow/],
									[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /arrow/],
									[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
							]
		},{
			asset_variants: [
				'arrow-e-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
									[/arrow/, /arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
									[/arrow/, /arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
							]
		},{
			asset_variants: [
				'arrow-w-endcap',
			],
			zorder: zorder.rocks,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
									[/^((?!(arrow)).)*$/, /arrow/, /arrow/],
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
							]
		},{
			asset_variants: [
				'cursor_green',
			],
			zorder: zorder.map_cursor_low,
			restrictions:	[
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
									[/^((?!(arrow)).)*$/, /arrow/, /arrow/],
										[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
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
];
	
