import { Image_Data } from "../../engine/Asset_Manager/Asset_Manager";


export const Misc_Image_Data: { [k: string]: Image_Data } = {
	cursor: {
		url: "map-cursor.png",
		name: "cursor",
		not_a_tile: true,
	},
	cursor_green: {
		url: "map-cursor-green.png",
		name: "cursor_green",
		not_a_tile: true,
	},
	cursor_red: {
		url: "map-cursor-red.png",
		name: "cursor_red",
		not_a_tile: true,
	},
	cursor_green_small: {
		url: "map-cursor-green-small.png",
		name: "cursor_green_small",
		not_a_tile: true,
	},
	cursor_red_small: {
		url: "map-cursor-red-small.png",
		name: "cursor_red_small",
		not_a_tile: true,
	},
	red_dot: {
		url: "red_dot.png",
		name: "red_dot",
	},
	attack_icon: {
		url: "attack_icon.png",
		name: "attack_icon",
	},
	deaths_head: {
		url: "deaths_head.png",
		name: "deaths_head",
	},
	target_indicator: {
		url: "target.png",
		name: "target_indicator",
	},
	arrow_placeholder: {
		url: "arrow_placeholder.png",
		name: "arrow_placeholder",
	},
	hit_star: {
		url: "hit_star.png",
		name: "hit_star",
	},
	arcane_shot: {
		url: "effects/particles2.png",
		name: "arcane_shot",
		frames: 5,
		frame_duration: 30,
		ping_pong: true,
		pad: 3,
		bounds: {
			x: 1,
			y: 210,
			w: 15,
			h: 15,
		},
	},
	arcane_shot_particle: {
		url: "effects/particles2.png",
		name: "arcane_shot_particle",
		frames: 8,
		frame_duration: 80,
		pad: 3,
		bounds: {
			x: 1,
			y: 227,
			w: 7,
			h: 7,
		},
	}
};
	
