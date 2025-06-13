import { Image_Data } from "../../engine/Asset_Manager/Asset_Manager";


export type Tile_Image_Data_Type = {
	[Property in _Tile_Image_Data_Type as `${string & Property}`]: Image_Data
};

type _Tile_Image_Data_Type = (keyof typeof Tile_Image_Data)



export const Tile_Image_Data = {
	dirt1: {
		url: "test2.png",
	},
	"multi-tile-pattern-test1": {
		url: "multi-tile-pattern-test1.png",
	},
	"multi-tile-pattern-test2": {
		url: "multi-tile-pattern-test2.png",
	},
	"multi-tile-pattern-test3": {
		url: "multi-tile-pattern-test3.png",
	},
	"multi-tile-pattern-test4": {
		url: "multi-tile-pattern-test4.png",
	},
	menhir_big_mtp_1: {
		url: "menhir_big_mtp_1.png",
	},
	menhir_big_mtp_1b: {
		url: "menhir_big_mtp_1b.png",
	},
	menhir_big_mtp_2: {
		url: "menhir_big_mtp_2.png",
	},
	menhir_big_mtp_4: {
		url: "menhir_big_mtp_4.png",
	},
	menhir_big_mtp_2b: {
		url: "menhir_big_mtp_2b.png",
	},
	menhir_big_mtp_3: {
		url: "menhir_big_mtp_3.png",
	},
	menhir_big_mtp_3b: {
		url: "menhir_big_mtp_3b.png",
	},
	"menhir-small1": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 1,
			y: 439,
			w: 54,
			h: 58,
		},
	},
	"menhir-small2": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 439,
			w: 54,
			h: 58,
		},
	},
	"menhir-small3": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 113,
			y: 439,
			w: 54,
			h: 58,
		},
	},
	"menhir-small4": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 169,
			y: 439,
			w: 54,
			h: 58,
		},
	},
	"menhir-small5": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 224,
			y: 439,
			w: 54,
			h: 58,
		},
	},
	"menhir-small6": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 279,
			y: 439,
			w: 54,
			h: 58,
		},
	},
	"menhir-small7": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 335,
			y: 439,
			w: 54,
			h: 58,
		},
	},
	"menhir-big2": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 1,
			w: 54,
			h: 58,
		},
	},
	"menhir-big4": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 168,
			y: 0,
			w: 56,
			h: 60,
		},
	},
	"menhir-big5": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 224,
			y: 0,
			w: 56,
			h: 60,
		},
	},
	"grass-and-scree1": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 1,
			y: 97,
			w: 54,
			h: 34,
		},
	},
	"grass-and-scree2": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 97,
			w: 54,
			h: 34,
		},
	},
	"grass-and-scree3": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 113,
			y: 97,
			w: 54,
			h: 34,
		},
	},
	"grass-and-scree4": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 169,
			y: 97,
			w: 54,
			h: 34,
		},
	},
	"grass-and-scree5": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 225,
			y: 97,
			w: 54,
			h: 34,
		},
	},
	"grass-and-scree6": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 281,
			y: 97,
			w: 54,
			h: 34,
		},
	},
	"grass-and-scree7": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 337,
			y: 97,
			w: 54,
			h: 34,
		},
	},
	"grass-and-scree8": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 393,
			y: 97,
			w: 54,
			h: 34,
		},
	},
	bush1: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 1,
			y: 363,
			w: 54,
			h: 74,
		},
	},
	bush2: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 363,
			w: 54,
			h: 74,
		},
	},
	bush3: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 113,
			y: 363,
			w: 54,
			h: 74,
		},
	},
	grass1: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 1,
			y: 133,
			w: 54,
			h: 34,
		},
	},
	grass2: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 133,
			w: 54,
			h: 34,
		},
	},
	grass3: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 113,
			y: 133,
			w: 54,
			h: 34,
		},
	},
	grass4: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 169,
			y: 133,
			w: 54,
			h: 34,
		},
	},
	grass5: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 225,
			y: 133,
			w: 54,
			h: 34,
		},
	},
	grass6: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 281,
			y: 133,
			w: 54,
			h: 34,
		},
	},
	grass7: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 337,
			y: 133,
			w: 54,
			h: 34,
		},
	},
	dirt2: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 205,
			w: 54,
			h: 34,
		},
	},
	"sandy-dirt1": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 61,
			w: 54,
			h: 34,
		},
	},
	"scrub-dirt1": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 169,
			w: 54,
			h: 34,
		},
	},
	"scrub-dirt2": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 113,
			y: 169,
			w: 54,
			h: 34,
		},
	},
	"scrub-dirt-tall1": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 313,
			w: 54,
			h: 48,
		},
	},
	"scrub-dirt-tall2": {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 113,
			y: 313,
			w: 54,
			h: 48,
		},
	},
	sand1: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 1,
			y: 277,
			w: 54,
			h: 34,
		},
	},
	sand2: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 57,
			y: 277,
			w: 54,
			h: 34,
		},
	},
	sand3: {
		url: "hex-tile-experiment-tiles.png",
		bounds: {
			x: 113,
			y: 277,
			w: 54,
			h: 34,
		},
	},
	"water-base1": {
		url: "water-tiles.png",
		bounds: {
			x: 1,
			y: 25,
			w: 54,
			h: 34,
		},
	},
	"water-edge-nw1": {
		url: "water-tiles.png",
		bounds: {
			x: 1,
			y: 61,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	},
	"water-edge-w1": {
		url: "water-tiles.png",
		bounds: {
			x: 1,
			y: 97,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	},
	"water-edge-sw1": {
		url: "water-tiles.png",
		bounds: {
			x: 1,
			y: 133,
			w: 54,
			h: 34,
		},
	},
	"water-edge-se1": {
		url: "water-tiles.png",
		bounds: {
			x: 1,
			y: 169,
			w: 54,
			h: 34,
		},
	},
	"water-edge-e1": {
		url: "water-tiles.png",
		bounds: {
			x: 1,
			y: 205,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	},
	"water-edge-ne1": {
		url: "water-tiles.png",
		bounds: {
			x: 1,
			y: 241,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	},
	water_ripples_1a: {
		url: "water_ripple_1a.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 8,
		frame_duration: 100,
		pad: 2,
	},
	water_ripples_1b: {
		url: "water_ripple_1b.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 8,
		frame_duration: 110,
		pad: 2,
	},
	water_ripples_2a: {
		url: "water_ripple_2a.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 8,
		frame_duration: 90,
		pad: 2,
	},
	water_ripples_2b: {
		url: "water_ripple_2b.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 8,
		frame_duration: 110,
		pad: 2,
	},
	water_ripples_2c: {
		url: "water_ripple_2c.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 8,
		frame_duration: 120,
		pad: 2,
	},
	"water-underlay0": {
		url: "water-underlay.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},

		pad: 2,
	},
	"water-underlay-placid": {
		url: "water-underlay-placid.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},

		pad: 2,
	},
	"water-underlay-dark1": {
		url: "water-underlay-dark1.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 54,
		},
		frames: 3,
		frame_duration: 270,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-dark2": {
		url: "water-underlay-dark2.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 54,
		},
		frames: 3,
		frame_duration: 280,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay1": {
		url: "water-underlay-tile-sheet.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 8,
		frame_duration: 180,
		pad: 2,
	},
	"water-underlay2": {
		url: "water-underlay2.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 180,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay3": {
		url: "water-underlay3.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 190,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-sparse1": {
		url: "water-underlay-sparse1.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 192,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-sparse2": {
		url: "water-underlay-sparse2.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 184,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-sparse3": {
		url: "water-underlay-sparse3.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 188,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-sparse4": {
		url: "water-underlay-sparse4.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 174,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-sparse5": {
		url: "water-underlay-sparse5.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 164,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-sparse6": {
		url: "water-underlay-sparse6.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 4,
		frame_duration: 196,
		ping_pong: true,
		pad: 2,
	},
	water_sparkles_blank1: {
		url: "water-sparkles.png",
		bounds: {
			x: 1,
			y: 1,
			w: 1,
			h: 1,
		},
		frames: 1,
		frame_duration: 600,
		pad: 2,
	},
	water_sparkles_blank2: {
		url: "water-sparkles.png",
		bounds: {
			x: 1,
			y: 1,
			w: 1,
			h: 1,
		},
		frames: 1,
		frame_duration: 900,
		pad: 2,
	},
	water_sparkles1: {
		url: "water-sparkles.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 9,
		frame_duration: 100,
		pad: 2,
	},
	water_sparkles2: {
		url: "water-sparkles.png",
		bounds: {
			x: 1,
			y: 37,
			w: 54,
			h: 34,
		},
		frames: 8,
		frame_duration: 90,
		pad: 2,
	},
	water_sparkles3: {
		url: "water-sparkles.png",
		bounds: {
			x: 1,
			y: 73,
			w: 54,
			h: 34,
		},
		frames: 6,
		frame_duration: 110,
		pad: 2,
	},
	water_sparkles4: {
		url: "water-sparkles.png",
		bounds: {
			x: 1,
			y: 109,
			w: 54,
			h: 34,
		},
		frames: 6,
		frame_duration: 120,
		pad: 2,
	},
	animation_test: {
		url: "animation_test.png",
		bounds: {
			x: 0,
			y: 0,
			w: 38,
			h: 21,
		},
		frames: 4,
		frame_duration: 200,
		ping_pong: true
	},
	animation_test2: {
		url: "animation_test2.png",
		bounds: {
			x: 0,
			y: 0,
			w: 38,
			h: 21,
		},
		frames: 5,
		frame_duration: 200,
		ping_pong: false
	},
	wideleaf_scrub1__anim1: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 3,
		frame_duration: 210,
		pad: 2,
		ping_pong: true
	},
	wideleaf_scrub1__anim2: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 1,
			y: 37,
			w: 54,
			h: 34,
		},
		frames: 3,
		frame_duration: 210,
		pad: 2,
		ping_pong: true
	},
	wideleaf_scrub1__anim3: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 1,
			y: 73,
			w: 54,
			h: 34,
		},
		frames: 2,
		frame_duration: 410,
		pad: 2,
		ping_pong: true
	},
	wideleaf_scrub1__anim2b: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 3,
		frame_duration: 450,
		pad: 2,
		ping_pong: true
	},
	wideleaf_scrub1__anim3b: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 1,
			y: 37,
			w: 54,
			h: 34,
		},
		frames: 3,
		frame_duration: 510,
		pad: 2,
		ping_pong: true
	},
	wideleaf_scrub2__anim1: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 224,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 3,
		frame_duration: 210,
		pad: 2,
		ping_pong: true
	},
	wideleaf_scrub2__anim2: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 224,
			y: 37,
			w: 54,
			h: 34,
		},
		frames: 3,
		frame_duration: 210,
		pad: 2,
		ping_pong: true
	},
	wideleaf_scrub2__anim3: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 224,
			y: 73,
			w: 54,
			h: 34,
		},
		frames: 2,
		frame_duration: 410,
		pad: 2,
		ping_pong: true
	},
	wideleaf_scrub2__anim2b: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 224,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 3,
		frame_duration: 450,
		pad: 2,
		ping_pong: true
	},
	wideleaf_scrub2__anim3b: {
		url: "terrain-tiles2.png",
		bounds: {
			x: 224,
			y: 37,
			w: 54,
			h: 34,
		},
		frames: 3,
		frame_duration: 510,
		pad: 2,
		ping_pong: true
	},
	"shore-walls-right1": {
		url: "shore-walls-right1.png",
		bounds: {
			x: 0,
			y: 0,
			w: 126,
			h: 76,
		},
		frames: 4,
		frame_duration: 220,
		ping_pong: true
	},
	"shore-walls-right2": {
		url: "shore-walls-right2.png",
		bounds: {
			x: 0,
			y: 0,
			w: 126,
			h: 76,
		},
		frames: 4,
		frame_duration: 180,
		ping_pong: true
	},
	"shore-walls-right3": {
		url: "shore-walls-right3.png",
		bounds: {
			x: 0,
			y: 0,
			w: 126,
			h: 76,
		},
		frames: 4,
		frame_duration: 190,
		ping_pong: true
	},
	"shore-walls-right4": {
		url: "shore_walls_right4.png",
		bounds: {
			x: 0,
			y: 0,
			w: 126,
			h: 76,
		},
		frames: 4,
		frame_duration: 210,
		ping_pong: true
	},
	"shore-walls-left1": {
		url: "shore-walls-left1.png",
		bounds: {
			x: 0,
			y: 0,
			w: 126,
			h: 76,
		},
		frames: 4,
		frame_duration: 220,
		ping_pong: true
	},
	"shore-walls-left2": {
		url: "shore-walls-left2.png",
		bounds: {
			x: 0,
			y: 0,
			w: 126,
			h: 76,
		},
		frames: 4,
		frame_duration: 180,
		ping_pong: true
	},
	"shore-walls-left3": {
		url: "shore-walls-left3.png",
		bounds: {
			x: 0,
			y: 0,
			w: 126,
			h: 76,
		},
		frames: 4,
		frame_duration: 190,
		ping_pong: true
	},
	"shore-walls-left4": {
		url: "shore_walls_left4.png",
		bounds: {
			x: 0,
			y: 0,
			w: 126,
			h: 76,
		},
		frames: 4,
		frame_duration: 210,
		ping_pong: true
	},
	water_reeds_1a: {
		url: "water_reeds_1a.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 5,
		frame_duration: 100,
		ping_pong: true,
		pad: 2,
	},
	water_reeds_1b: {
		url: "water_reeds_1b.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 5,
		frame_duration: 100,
		ping_pong: true,
		pad: 2,
	},
	water_reeds_1c: {
		url: "water_reeds_1c.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
		frames: 2,
		frame_duration: 175,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-edge-sw1": {
		url: "water-underlay-transitions.png",
		bounds: {
			x: 1,
			y: 169,
			w: 54,
			h: 34,
		},
		frames: 1,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-edge-se1": {
		url: "water-underlay-transitions.png",
		bounds: {
			x: 1,
			y: 61,
			w: 54,
			h: 34,
		},
		frames: 1,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-edge-w1": {
		url: "water-underlay-transitions.png",
		bounds: {
			x: 1,
			y: 205,
			w: 54,
			h: 34,
		},
		frames: 1,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-edge-e1": {
		url: "water-underlay-transitions.png",
		bounds: {
			x: 1,
			y: 97,
			w: 54,
			h: 34,
		},
		frames: 1,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-edge-nw1": {
		url: "water-underlay-transitions.png",
		bounds: {
			x: 1,
			y: 241,
			w: 54,
			h: 34,
		},
		frames: 1,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	},
	"water-underlay-edge-ne1": {
		url: "water-underlay-transitions.png",
		bounds: {
			x: 1,
			y: 133,
			w: 54,
			h: 34,
		},
		frames: 1,
		frame_duration: 130,
		ping_pong: true,
		pad: 2,
	}
};
	
