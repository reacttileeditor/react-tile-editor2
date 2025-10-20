import { Image_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Image_Data_Dictionary } from "../Image_Data";

export type Character_Image_Data_Type = {
	[Property in _Character_Image_Data_Type as `${string & Property}`]: Image_Data
};

type _Character_Image_Data_Type = (keyof typeof Character_Image_Data)


export const Character_Image_Data = {
	hermit:	{
		url: "char1.png",
	},
	"peasant-ne": {
		url: "char2-ne.png",
	},
	"peasant-se": {
		url: "char2.png",
	},
	"skeleton-ne": {
		url: "char3-ne.png",
	},
	"undead-javelineer-se": {
		url: "characters/undead_javelineer.png",
	},
	"skeleton-se": {
		url: "char3.png",
	},
	skeleton_warrior_stand_se: {
		url: "characters/skeleton_warrior_stand_se.png",
		frames: 3,
		frame_duration: 250,
		ping_pong: true,
		pad: 2,
		bounds: {
			x: 1,
			y: 1,
			w: 58,
			h: 118,
		},
	},
	undead_javelineer_se_stand: {
		url: "characters/undead_javelineer_se_stand.png",
		frames: 5,
		frame_duration: 250,
		ping_pong: true,
		pad: 2,
		bounds: {
			x: 1,
			y: 1,
			w: 58,
			h: 158,
		},
		uses_palette_swap: true,
	},
	undead_javelineer_ne_stand: {
		url: "characters/undead_javelineer_ne_stand.png",
	},
	undead_javelineer_se_attack: {
		url: "characters/undead_javelineer_se_attack.png",
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
		uses_palette_swap: true,
	},
	human_footman_se_stand: {
		url: "characters/human_footman_stand_se.png",
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
	},
	human_footman_ne_stand: {
		url: "characters/human_footman_ne_stand.png",
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
	},
	human_footman_se_walk: {
		url: "characters/human_footman_se_walk.png",
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
	},
	human_footman_ne_walk: {
		url: "characters/human_footman_ne_walk.png",
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
	},
	human_footman_ne_attack: {
		url: "characters/human_footman_ne_attack.png",
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
	},
	human_footman_se_attack: {
		url: "characters/human_footman_se_attack.png",
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
	},
	human_hermit_ne_stand: {
		url: "characters/human_hermit_ne_stand.png",
		uses_palette_swap: true,
		frames: 5,
		frame_duration: 180,
		ping_pong: true,
		pad: 2,
		bounds: {
			x: 1,
			y: 1,
			w: 66,
			h: 114,
		},
	},
	human_hermit_se_stand: {
		url: "characters/human_hermit_se_stand.png",
		uses_palette_swap: true,
		frames: 5,
		frame_duration: 180,
		ping_pong: true,
		pad: 2,
		bounds: {
			x: 1,
			y: 1,
			w: 56,
			h: 114,
		},
	},
	human_hermit_se_walk: {
		url: "characters/human_hermit_se_walk.png",
		frames: 8,
		frame_duration: 100,
		ping_pong: false,
		pad: 2,
		bounds: {
			x: 0,
			y: 0,
			w: 68,
			h: 116,
		},
		uses_palette_swap: true,
	},
	human_hermit_ne_walk: {
		url: "characters/human_hermit_ne_walk.png",
		frames: 8,
		frame_duration: 100,
		ping_pong: false,
		pad: 2,
		bounds: {
			x: 0,
			y: 0,
			w: 68,
			h: 116,
		},
		uses_palette_swap: true,
	},
	"peasant-se-walk": {
		url: "char2-se-walk.png",
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
	},
	"peasant-ne-walk": {
		url: "char2-ne-walk.png",
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
	},
	"skeleton-ne-walk": {
		url: "characters/skeleton_warrior_walk_ne.png",
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
	},
	"skeleton-se-walk": {
		url: "char3-se-walk.png",
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
	},
	"skeleton-se-attack": {
		url: "char3-se-attack.png",
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
	}
};
	
const Safety: Image_Data_Dictionary = Character_Image_Data;
