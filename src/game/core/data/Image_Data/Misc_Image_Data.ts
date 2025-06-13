import { Image_Data } from "../../engine/Asset_Manager/Asset_Manager";


export const Misc_Image_Data: { [k: string]: Image_Data } = {
	cursor: {
		url: "map-cursor.png",
		not_a_tile: true,
	},
	cursor_green: {
		url: "map-cursor-green.png",
		not_a_tile: true,
	},
	cursor_red: {
		url: "map-cursor-red.png",
		not_a_tile: true,
	},
	cursor_green_small: {
		url: "map-cursor-green-small.png",
		not_a_tile: true,
	},
	cursor_red_small: {
		url: "map-cursor-red-small.png",
		not_a_tile: true,
	},
	red_dot: {
		url: "red_dot.png",
	},
	attack_icon: {
		url: "attack_icon.png",
	},
	deaths_head: {
		url: "deaths_head.png",
	},
	target_indicator: {
		url: "target.png",
	},
	arrow_placeholder: {
		url: "arrow_placeholder.png",
	},
	hit_star: {
		url: "hit_star.png",
	},
	arcane_shot: {
		url: "effects/particles2.png",
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
	
