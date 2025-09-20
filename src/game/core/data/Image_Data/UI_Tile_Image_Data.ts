import { Image_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Image_Data_Dictionary } from "../Image_Data";

export type UI_Tile_Image_Data_Type = {
	[Property in _UI_Tile_Image_Data_Type as `${string & Property}`]: Image_Data
};

type _UI_Tile_Image_Data_Type = (keyof typeof UI_Tile_Image_Data)


export const UI_Tile_Image_Data = {

/*----------------------- green arrow tiles -----------------------*/
	"arrow-horizontal-bar": {
		url: "arrow-tiles.png",
		bounds: {
			x: 57,
			y: 1,
			w: 54,
			h: 34,
		},
	},
	"arrow-se-bar": {
		url: "arrow-tiles.png",
		bounds: {
			x: 113,
			y: 1,
			w: 54,
			h: 34,
		},
	},
	"arrow-ne-bar": {
		url: "arrow-tiles.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
	},
	"arrow-w-to-se-bar": {
		url: "arrow-tiles.png",
		bounds: {
			x: 57,
			y: 37,
			w: 54,
			h: 34,
		},
	},
	"arrow-nw-to-e-bar": {
		url: "arrow-tiles.png",
		bounds: {
			x: 113,
			y: 37,
			w: 54,
			h: 34,
		},
	},
	"arrow-sw-to-e-bar": {
		url: "arrow-tiles.png",
		bounds: {
			x: 57,
			y: 73,
			w: 54,
			h: 34,
		},
	},
	"arrow-w-to-ne-bar": {
		url: "arrow-tiles.png",
		bounds: {
			x: 113,
			y: 73,
			w: 54,
			h: 34,
		},
	},
	"arrow-se-to-ne-bar": {
		url: "arrow-tiles.png",
		bounds: {
			x: 1,
			y: 37,
			w: 54,
			h: 34,
		},
	},
	"arrow-sw-to-nw-bar": {
		url: "arrow-tiles.png",
		bounds: {
			x: 1,
			y: 73,
			w: 54,
			h: 34,
		},
	},
	"arrow-se-endcap": {
		url: "arrow-tiles.png",
		bounds: {
			x: 113,
			y: 145,
			w: 54,
			h: 34,
		},
	},
	"arrow-ne-endcap": {
		url: "arrow-tiles.png",
		bounds: {
			x: 1,
			y: 109,
			w: 54,
			h: 34,
		},
	},
	"arrow-sw-endcap": {
		url: "arrow-tiles.png",
		bounds: {
			x: 1,
			y: 145,
			w: 54,
			h: 34,
		},
	},
	"arrow-nw-endcap": {
		url: "arrow-tiles.png",
		bounds: {
			x: 113,
			y: 109,
			w: 54,
			h: 34,
		},
	},
	"arrow-e-endcap": {
		url: "arrow-tiles.png",
		bounds: {
			x: 57,
			y: 145,
			w: 54,
			h: 34,
		},
	},
	"arrow-w-endcap": {
		url: "arrow-tiles.png",
		bounds: {
			x: 57,
			y: 109,
			w: 54,
			h: 34,
		},
	},


	"arrowhead-ne": {
		url: "arrow-tiles.png",
		bounds: {
			x: 1,
			y: 181,
			w: 54,
			h: 34,
		},
	},
	"arrowhead-w": {
		url: "arrow-tiles.png",
		bounds: {
			x: 57,
			y: 181,
			w: 54,
			h: 34,
		},
	},
	"arrowhead-nw": {
		url: "arrow-tiles.png",
		bounds: {
			x: 113,
			y: 181,
			w: 54,
			h: 34,
		},
	},
	"arrowhead-sw": {
		url: "arrow-tiles.png",
		bounds: {
			x: 1,
			y: 217,
			w: 54,
			h: 34,
		},
	},
	"arrowhead-e": {
		url: "arrow-tiles.png",
		bounds: {
			x: 57,
			y: 217,
			w: 54,
			h: 34,
		},
	},
	"arrowhead-se": {
		url: "arrow-tiles.png",
		bounds: {
			x: 113,
			y: 217,
			w: 54,
			h: 34,
		},
	},

/*----------------------- green skinny arrow tiles -----------------------*/
	arrow_skinny_horizontal_bar: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 57,
			y: 1,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_se_bar: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 113,
			y: 1,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_ne_bar: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_w_to_se_bar: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 57,
			y: 37,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_nw_to_e_bar: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 113,
			y: 37,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_sw_to_e_bar: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 57,
			y: 73,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_w_to_ne_bar: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 113,
			y: 73,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_se_to_ne_bar: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 1,
			y: 37,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_sw_to_nw_bar: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 1,
			y: 73,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_se_endcap: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 113,
			y: 145,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_ne_endcap: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 1,
			y: 109,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_sw_endcap: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 1,
			y: 145,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_nw_endcap: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 113,
			y: 109,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_e_endcap: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 57,
			y: 145,
			w: 54,
			h: 34,
		},
	},
	arrow_skinny_w_endcap: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 57,
			y: 109,
			w: 54,
			h: 34,
		},
	},


	arrowhead_skinny_ne: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 1,
			y: 181,
			w: 54,
			h: 34,
		},
	},
	arrowhead_skinny_w: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 57,
			y: 181,
			w: 54,
			h: 34,
		},
	},
	arrowhead_skinny_nw: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 113,
			y: 181,
			w: 54,
			h: 34,
		},
	},
	arrowhead_skinny_sw: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 1,
			y: 217,
			w: 54,
			h: 34,
		},
	},
	arrowhead_skinny_e: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 57,
			y: 217,
			w: 54,
			h: 34,
		},
	},
	arrowhead_skinny_se: {
		url: "arrow-tiles-skinny.png",
		bounds: {
			x: 113,
			y: 217,
			w: 54,
			h: 34,
		},
	},

/*----------------------- utility graphics -----------------------*/
	"red-path-unreachable-dot": {
		url: "map-cursor-red-tiny.png",
		bounds: {
			x: 0,
			y: 0,
			w: 54,
			h: 34,
		},
	},
	pedestal: {
		url: "pedestal.png",
		bounds: {
			x: 0,
			y: 0,
			w: 64,
			h: 67,
		},
	},
	unit_team_indicator: {
		url: "unit_team_indicator.png",
		uses_palette_swap: true,
	},

/*----------------------- tile boundaries (for prospective moves) -----------------------*/

	tile_boundary_fill: {
		url: "tile_boundary_transitions.png",
		bounds: {
			x: 1,
			y: 25,
			w: 54,
			h: 34,
		},
	},
	tile_boundary_sw1: {
		url: "tile_boundary_transitions.png",
		bounds: {
			x: 1,
			y: 169,
			w: 54,
			h: 34,
		},
	},
	tile_boundary_se1: {
		url: "tile_boundary_transitions.png",
		bounds: {
			x: 1,
			y: 61,
			w: 54,
			h: 34,
		},
	},
	tile_boundary_w1: {
		url: "tile_boundary_transitions.png",
		bounds: {
			x: 1,
			y: 205,
			w: 54,
			h: 34,
		},
	},
	tile_boundary_e1: {
		url: "tile_boundary_transitions.png",
		bounds: {
			x: 1,
			y: 97,
			w: 54,
			h: 34,
		},
	},
	tile_boundary_nw1: {
		url: "tile_boundary_transitions.png",
		bounds: {
			x: 1,
			y: 241,
			w: 54,
			h: 34,
		},
	},
	tile_boundary_ne1: {
		url: "tile_boundary_transitions.png",
		bounds: {
			x: 1,
			y: 133,
			w: 54,
			h: 34,
		},
	},
	white_tile: {
		url: "white_tile.png",
		bounds: {
			x: 1,
			y: 1,
			w: 54,
			h: 34,
		},
	}
};
	
const Safety: Image_Data_Dictionary = UI_Tile_Image_Data;
