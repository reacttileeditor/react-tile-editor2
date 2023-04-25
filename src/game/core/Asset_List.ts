import { StaticValues } from "./Asset_Manager";

export const asset_list: StaticValues = {
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
		url: "char3-ne.png",
		name: "skeleton-ne",
	},{
		url: "char3.png",
		name: "skeleton-se",
	},{
		url: "red_dot.png",
		name: "red_dot",
	},{
		url: "attack_icon.png",
		name: "attack_icon",
	},{
		url: "deaths_head.png",
		name: "deaths_head",
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
		url: "char3-ne-walk.png",
		name: "skeleton-ne-walk",
		frames: 8,
		frame_duration: 100,
		ping_pong: false,
		pad: 2,
		bounds: {
			x: 1,
			y: 1,
			w: 60,
			h: 120,
		},
	},{
		url: "char3-se-walk.png",
		name: "skeleton-se-walk",
		frames: 8,
		frame_duration: 100,
		ping_pong: false,
		pad: 2,
		bounds: {
			x: 1,
			y: 1,
			w: 60,
			h: 120,
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
	},{
		url: "map-cursor-red-tiny.png",
		name: "red-path-unreachable-dot",
		bounds: {
			x: 0,
			y: 0,
			w: 54,
			h: 34,
		},
	},{
		url: "arrow-tiles.png",
		name: "arrowhead-ne",
		bounds: {
			x: 1,
			y: 181,
			w: 54,
			h: 34,
		},
	},{
		url: "arrow-tiles.png",
		name: "arrowhead-w",
		bounds: {
			x: 57,
			y: 181,
			w: 54,
			h: 34,
		},
	},{
		url: "arrow-tiles.png",
		name: "arrowhead-nw",
		bounds: {
			x: 113,
			y: 181,
			w: 54,
			h: 34,
		},
	},{
		url: "arrow-tiles.png",
		name: "arrowhead-sw",
		bounds: {
			x: 1,
			y: 217,
			w: 54,
			h: 34,
		},
	},{
		url: "arrow-tiles.png",
		name: "arrowhead-e",
		bounds: {
			x: 57,
			y: 217,
			w: 54,
			h: 34,
		},
	},{
		url: "arrow-tiles.png",
		name: "arrowhead-se",
		bounds: {
			x: 113,
			y: 217,
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
		},{
			name: "red-path-unreachable-dot",
			omit_from_random_map_generation: true,
			variants: [{
				graphics: [{
					id: 'red-path-unreachable-dot',
					zorder: 12,
				}],
			}],
		},

		{
			name: "arrowhead-green",
			omit_from_random_map_generation: true,
			variants: [{
				graphics: [{
					id: 'arrowhead-e',
					zorder: 12,
					restrictions:	[
												[/.*/, /.*/],
											[/arrow/, /arrowhead/, /.*/],
												[/.*/, /.*/]
									]
				},{
					id: 'arrowhead-w',
					zorder: 12,
					restrictions:	[
												[/.*/, /.*/],
											[/.*/, /arrowhead/, /arrow/],
												[/.*/, /.*/]
									]
				},{
					id: 'arrowhead-sw',
					zorder: 12,
					restrictions:	[
												[/.*/, /arrow/],
											[/.*/, /arrowhead/, /.*/],
												[/.*/, /.*/]
									]
				},{
					id: 'arrowhead-se',
					zorder: 12,
					restrictions:	[
												[/arrow/, /.*/],
											[/.*/, /arrowhead/, /.*/],
												[/.*/, /.*/]
									]
				},{
					id: 'arrowhead-nw',
					zorder: 12,
					restrictions:	[
												[/.*/, /.*/],
											[/.*/, /arrowhead/, /.*/],
												[/.*/, /arrow/]
									]
				},{
					id: 'arrowhead-ne',
					zorder: 12,
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
				}],
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
	
