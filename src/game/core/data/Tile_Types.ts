import { zorder } from "../constants/zorder";
import { StaticValues, TileItem } from "../engine/Asset_Manager/Asset_Manager";

/*
		special notes on this horrifying "negative match" regex:
		https://stackoverflow.com/questions/6449131/javascript-regular-expression-to-not-match-a-word
		https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
*/


export type TileName =
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
"menhir-big" |
"menhir-small" |
"red-path-unreachable-dot" |
"arrowhead-green" |
"arrow-green" |
"cursor_green";

const ground_tiles = /(dirt|grass|menhir|sand|bush)/;
const water_tiles = /(water|water-still)/;

export const tile_types: Array<TileItem> = [
	{
		name: "grass",
		variants: [{
				graphics: [{
					id: 'grass1',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass2',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass3',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass4',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass5',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass6',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass7',
					zorder: zorder.grass,
				}],
			}
		],
	},{
		name: "grass-and-scree",
		variants: [{
				graphics: [{
					id: 'grass-and-scree1',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass-and-scree2',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass-and-scree3',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass-and-scree4',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass-and-scree5',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass-and-scree6',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass-and-scree7',
					zorder: zorder.grass,
				}],
			},{
				graphics: [{
					id: 'grass-and-scree8',
					zorder: zorder.grass,
				}],
			}
		],
	},{
		name: "dirt",
		variants: [{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			}],
		},{
			graphics: [{
				id: 'dirt2',
				zorder: zorder.grass,
			}],
		}],
	},{
		name: "sandy-dirt",
		variants: [{
			graphics: [{
				id: 'sandy-dirt1',
				zorder: zorder.grass,
			}],
		}],
	},{
		name: "scrub-dirt",
		variants: [{
			graphics: [{
				id: 'scrub-dirt1',
				zorder: zorder.grass,
			}],
		},{
			graphics: [{
				id: 'scrub-dirt2',
				zorder: zorder.grass,
			}],
		}],
	},{
		name: "scrub-dirt-tall",
		variants: [{
			graphics: [{
				id: 'scrub-dirt-tall1',
				zorder: zorder.grass,
			}],
		},{
			graphics: [{
				id: 'scrub-dirt-tall2',
				zorder: zorder.grass,
			}],
		}],
	},{
		name: "bush",
		variants: [{
			graphics: [{
				id: 'bush1',
				zorder: zorder.rocks,
			},{
				id: 'grass1',
				zorder: zorder.grass,
			}],
		},{
			graphics: [{
				id: 'bush2',
				zorder: zorder.rocks,
			},{
				id: 'grass2',
				zorder: zorder.grass,
			}],
		},{
			graphics: [{
				id: 'bush3',
				zorder: zorder.rocks,
			},{
				id: 'grass3',
				zorder: zorder.grass,
			}],
		}],
	},{
		name: "sand",
		variants: [{
			graphics: [{
				id: 'sand1',
				zorder: zorder.grass,
			}],
		},{
			graphics: [{
				id: 'sand2',
				zorder: zorder.grass,
			}],
		},{
			graphics: [{
				id: 'sand3',
				zorder: zorder.grass,
			}],
		}],
	},{
		name: "water",
		variants: [{
			graphics: [{
				id: 'water-underlay',
				zorder: zorder.water_underlay,
			},{
				id: 'water-ripples',
				zorder: zorder.water_surface,
			},{
				id: 'water-edge-nw1',
				zorder: zorder.water_edge,
				restrictions:	[
									[/.*/, ground_tiles],
										[/.*/, water_tiles, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-ne1',
				zorder: zorder.water_edge,
				restrictions:	[
									[ground_tiles, /.*/],
										[/.*/, water_tiles, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-e1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[ground_tiles, water_tiles, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-w1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, water_tiles, ground_tiles],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-sw1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, water_tiles, /.*/],
											[/.*/, ground_tiles]
								]
			},{
				id: 'water-edge-se1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, water_tiles, /.*/],
											[ ground_tiles, /.*/]
								]
			}],
		}],
	},{
		name: "water-placid",
		variants: [{
			graphics: [{
				id: 'water-underlay-placid',
				zorder: zorder.water_underlay,
			},{
				id: 'water-edge-nw1',
				zorder: zorder.water_edge,
				restrictions:	[
									[/.*/, ground_tiles],
										[/.*/, water_tiles, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-ne1',
				zorder: zorder.water_edge,
				restrictions:	[
									[ground_tiles, /.*/],
										[/.*/, water_tiles, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-e1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[ground_tiles, water_tiles, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-w1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, water_tiles, ground_tiles],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-sw1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, water_tiles, /.*/],
											[/.*/, ground_tiles]
								]
			},{
				id: 'water-edge-se1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, water_tiles, /.*/],
											[ ground_tiles, /.*/]
								]
			}],
		}],
	},{
		name: "menhir-big",
		variants: [{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-big2',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-big4',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-big5',
				zorder: zorder.rocks,
			}],
		}],
	},{
		name: "menhir-small",
		variants: [{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-small1',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-small2',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-small3',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-small4',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-small5',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-small6',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir-small7',
				zorder: zorder.rocks,
			}],
		}],
	},{
		name: "red-path-unreachable-dot",
		omit_from_random_map_generation: true,
		variants: [{
			graphics: [{
				id: 'red-path-unreachable-dot',
				zorder: zorder.rocks,
			}],
		}],
	},{
		name: "cursor_green",
		omit_from_random_map_generation: true,
		variants: [{
			graphics: [{
				id: 'cursor_green',
				zorder: zorder.map_cursor_low,
			}],
		}],
	},

	{
		name: "arrowhead-green",
		omit_from_random_map_generation: true,
		variants: [{
			graphics: [{
				id: 'arrowhead-e',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /.*/],
										[/arrow/, /arrowhead/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'arrowhead-w',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, /arrowhead/, /arrow/],
											[/.*/, /.*/]
								]
			},{
				id: 'arrowhead-sw',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /arrow/],
										[/.*/, /arrowhead/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'arrowhead-se',
				zorder: zorder.rocks,
				restrictions:	[
											[/arrow/, /.*/],
										[/.*/, /arrowhead/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'arrowhead-nw',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, /arrowhead/, /.*/],
											[/.*/, /arrow/]
								]
			},{
				id: 'arrowhead-ne',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, /arrowhead/, /.*/],
											[/arrow/, /.*/]
								]
			}]
		}]
	},

	{
		name: "arrow-green",
		omit_from_random_map_generation: true,
		variants: [{
			graphics: [{
				id: 'arrow-horizontal-bar',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /.*/],
										[/arrow/, /arrow/, /arrow/],
											[/.*/, /.*/]
								]
			},{
				id: 'arrow-se-bar',
				zorder: zorder.rocks,
				restrictions:	[
											[/arrow/, /.*/],
										[/.*/, /arrow/, /.*/],
											[/.*/, /arrow/]
								]
			},{
				id: 'arrow-ne-bar',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /arrow/],
										[/.*/, /arrow/, /.*/],
											[/arrow/, /.*/]
								]
			},{
				id: 'arrow-w-to-se-bar',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /.*/],
										[/arrow/, /arrow/, /.*/],
											[/.*/, /arrow/]
								]
			},{
				id: 'arrow-nw-to-e-bar',
				zorder: zorder.rocks,
				restrictions:	[
											[/arrow/, /.*/],
										[/.*/, /arrow/, /arrow/],
											[/.*/, /.*/]
								]
			},{
				id: 'arrow-sw-to-e-bar',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, /arrow/, /arrow/],
											[/arrow/, /.*/]
								]
			},{
				id: 'arrow-w-to-ne-bar',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /arrow/],
										[/arrow/, /arrow/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'arrow-sw-to-nw-bar',
				zorder: zorder.rocks,
				restrictions:	[
											[/arrow/, /.*/],
										[/.*/, /arrow/, /.*/],
											[/arrow/, /.*/]
								]
			},{
				id: 'arrow-se-to-ne-bar',
				zorder: zorder.rocks,
				restrictions:	[
											[/.*/, /arrow/],
										[/.*/, /arrow/, /.*/],
											[/.*/, /arrow/]
								]
			},{
				id: 'arrow-nw-endcap',
				zorder: zorder.rocks,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
											[/^((?!(arrow)).)*$/, /arrow/]
								]
			},{
				id: 'cursor_green',
				zorder: zorder.map_cursor_low,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
											[/^((?!(arrow)).)*$/, /arrow/]
								]
			},{
				id: 'arrow-ne-endcap',
				zorder: zorder.rocks,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
											[/arrow/, /^((?!(arrow)).)*$/]
								]
			},{
				id: 'cursor_green',
				zorder: zorder.map_cursor_low,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
											[/arrow/, /^((?!(arrow)).)*$/]
								]
			},{
				id: 'arrow-se-endcap',
				zorder: zorder.rocks,
				restrictions:	[
											[/arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
								]
			},{
				id: 'cursor_green',
				zorder: zorder.map_cursor_low,
				restrictions:	[
											[/arrow/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
								]
			},{
				id: 'arrow-sw-endcap',
				zorder: zorder.rocks,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /arrow/],
										[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
								]
			},{
				id: 'cursor_green',
				zorder: zorder.map_cursor_low,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /arrow/],
										[/^((?!(arrow)).)*$/, /arrow/, /^((?!(arrow)).)*$/],
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
								]
			},{
				id: 'arrow-e-endcap',
				zorder: zorder.rocks,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
										[/arrow/, /arrow/, /^((?!(arrow)).)*$/],
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
								]
			},{
				id: 'cursor_green',
				zorder: zorder.map_cursor_low,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
										[/arrow/, /arrow/, /^((?!(arrow)).)*$/],
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
								]
			},{
				id: 'arrow-w-endcap',
				zorder: zorder.rocks,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/, /arrow/],
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
								]
			},{
				id: 'cursor_green',
				zorder: zorder.map_cursor_low,
				restrictions:	[
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/],
										[/^((?!(arrow)).)*$/, /arrow/, /arrow/],
											[/^((?!(arrow)).)*$/, /^((?!(arrow)).)*$/]
								]
			}],
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
	
