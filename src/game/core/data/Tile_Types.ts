import { zorder } from "../constants/zorder";
import { StaticValues, TileItem } from "../engine/Asset_Manager";

/*
		special notes on this horrifying "negative match" regex:
		https://stackoverflow.com/questions/6449131/javascript-regular-expression-to-not-match-a-word
		https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
*/


export type TileName =
"grass" |
"grass-and-scree" |
"grass-and-scree" |
"dirt" |
"sandy-dirt" |
"scrub-dirt" |
"scrub-dirt-tall" |
"sand" |
"water" |
"water-placid" |
"menhir2" |
"menhir1" |
"red-path-unreachable-dot" |
"arrowhead-green" |
"arrow-green" ;



export const tile_types: Array<TileItem> = [
	{
		name: "grass",
		variants: [{
				graphics: [{
					id: 'grass1',
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
									[/.*/, /(dirt|grass|menhir|sand)/],
										[/.*/, /(water|water-still)/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-ne1',
				zorder: zorder.water_edge,
				restrictions:	[
									[/(dirt|grass|menhir|sand)/, /.*/],
										[/.*/, /(water|water-still)/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-e1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/(dirt|grass|menhir|sand)/, /(water|water-still)/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-w1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, /(water|water-still)/, /(dirt|grass|menhir|sand)/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-sw1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, /(water|water-still)/, /.*/],
											[/.*/, /(dirt|grass|menhir|sand)/]
								]
			},{
				id: 'water-edge-se1',
				zorder: zorder.water_edge,
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
				zorder: zorder.water_underlay,
			},{
				id: 'water-edge-nw1',
				zorder: zorder.water_edge,
				restrictions:	[
									[/.*/, /(dirt|grass|menhir|sand)/],
										[/.*/, /(water|water-still)/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-ne1',
				zorder: zorder.water_edge,
				restrictions:	[
									[/(dirt|grass|menhir|sand)/, /.*/],
										[/.*/, /(water|water-still)/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-e1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/(dirt|grass|menhir|sand)/, /(water|water-still)/, /.*/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-w1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, /(water|water-still)/, /(dirt|grass|menhir|sand)/],
											[/.*/, /.*/]
								]
			},{
				id: 'water-edge-sw1',
				zorder: zorder.water_edge,
				restrictions:	[
											[/.*/, /.*/],
										[/.*/, /(water|water-still)/, /.*/],
											[/.*/, /(dirt|grass|menhir|sand)/]
								]
			},{
				id: 'water-edge-se1',
				zorder: zorder.water_edge,
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
				zorder: zorder.grass,
			},{
				id: 'menhir2',
				zorder: zorder.rocks,
			}],
		}],
	},{
		name: "menhir1",
		variants: [{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir1',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir4',
				zorder: zorder.rocks,
			}],
		},{
			graphics: [{
				id: 'dirt1',
				zorder: zorder.grass,
			},{
				id: 'menhir3',
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
				id: 'arrow-ne-endcap',
				zorder: zorder.rocks,
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
				id: 'arrow-sw-endcap',
				zorder: zorder.rocks,
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
				id: 'arrow-w-endcap',
				zorder: zorder.rocks,
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
	
