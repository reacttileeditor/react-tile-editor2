import { zorder } from "../constants/zorder";
import { ImageData } from "../engine/Asset_Manager";
import { tile_types } from "./Tile_Types";


export const image_data_list: Array<ImageData> = [{
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
	url: "multi-tile-pattern-test1.png",
	name: "multi-tile-pattern-test1",
},{
	url: "multi-tile-pattern-test2.png",
	name: "multi-tile-pattern-test2",
},{
	url: "multi-tile-pattern-test3.png",
	name: "multi-tile-pattern-test3",
},{
	url: "multi-tile-pattern-test4.png",
	name: "multi-tile-pattern-test4",
},{
	url: "menhir2_mtp_1.png",
	name: "menhir2_mtp_1",
},{
	url: "menhir2_mtp_1b.png",
	name: "menhir2_mtp_1b",
},{
	url: "menhir2_mtp_2.png",
	name: "menhir2_mtp_2",
},{
	url: "menhir2_mtp_2b.png",
	name: "menhir2_mtp_2b",
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
	url: "characters/undead_javelineer.png",
	name: "undead-javelineer-se",
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
	url: "arrow_placeholder.png",
	name: "arrow_placeholder",
},{
	url: "hit_star.png",
	name: "hit_star",
},{
	url: "characters/skeleton_warrior_stand_se.png",
	name: "skeleton_warrior_stand_se",
	frames: 3,
	frame_duration: 170,
	ping_pong: true,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 58,
		h: 118,
	},
},{
	url: "characters/undead_javelineer_se_stand.png",
	name: "undead_javelineer_se_stand",
	frames: 5,
	frame_duration: 170,
	ping_pong: true,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 58,
		h: 158,
	},
},{
	url: "characters/undead_javelineer_ne_stand.png",
	name: "undead_javelineer_ne_stand",
},{
	url: "characters/human_footman_stand_se.png",
	name: "human_footman_se_stand",
	frames: 5,
	frame_duration: 170,
	ping_pong: true,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 58,
		h: 158,
	},
},{
	url: "characters/human_footman_ne_stand.png",
	name: "human_footman_ne_stand",
	frames: 5,
	frame_duration: 170,
	ping_pong: true,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 78,
		h: 158,
	},
},{
	url: "characters/human_footman_se_walk.png",
	name: "human_footman_se_walk",
	frames: 8,
	frame_duration: 100,
	ping_pong: false,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 68,
		h: 158,
	},
},{
	url: "characters/human_footman_ne_walk.png",
	name: "human_footman_ne_walk",
	frames: 8,
	frame_duration: 100,
	ping_pong: false,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 68,
		h: 158,
	},
},{
	url: "characters/human_footman_ne_attack.png",
	name: "human_footman_ne_attack",
	frames: 10,
	frame_duration: 100,
	ping_pong: false,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 78,
		h: 158,
	},
},{
	url: "characters/human_footman_se_attack.png",
	name: "human_footman_se_attack",
	frames: 10,
	frame_duration: 100,
	ping_pong: false,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 78,
		h: 158,
	},
},{
	url: "characters/undead_javelineer_se_attack.png",
	name: "undead_javelineer_se_attack",
	frames: 12,
	frame_duration: 100,
	ping_pong: false,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 98,
		h: 178,
	},
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
	url: "characters/skeleton_warrior_walk_ne.png",
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
	url: "char3-se-attack.png",
	name: "skeleton-se-attack",
	frames: 10,
	frame_duration: 100,
	ping_pong: false,
	pad: 2,
	bounds: {
		x: 1,
		y: 1,
		w: 98,
		h: 138,
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
	name: "grass2",
	bounds: {
		x: 57,
		y: 133,
		w: 54,
		h: 34,
	},
},{
	url: "hex-tile-experiment-tiles.png",
	name: "grass3",
	bounds: {
		x: 113,
		y: 133,
		w: 54,
		h: 34,
	},
},{
	url: "hex-tile-experiment-tiles.png",
	name: "grass4",
	bounds: {
		x: 169,
		y: 133,
		w: 54,
		h: 34,
	},
},{
	url: "hex-tile-experiment-tiles.png",
	name: "grass5",
	bounds: {
		x: 225,
		y: 133,
		w: 54,
		h: 34,
	},
},{
	url: "hex-tile-experiment-tiles.png",
	name: "grass6",
	bounds: {
		x: 281,
		y: 133,
		w: 54,
		h: 34,
	},
},{
	url: "hex-tile-experiment-tiles.png",
	name: "grass7",
	bounds: {
		x: 337,
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
}];
	
