export interface Point2D {
	x: number,
	y: number
}

export interface Rectangle {
	x: number,
	y: number,
	w: number,
	h: number,
}

export interface PointCubic {
	/*
		These are used as a tool to easily calculate distances in Hex tiles.
		https://www.redblobgames.com/grids/hexagons/

		As it turns out, it's decidedly *non*-trivial to calculate this, via some quick-and-dirty subtraction/addition duct-tape, and it's actually something that's best done by hitting the books and using an actual algorithm a math person worked out.

		Envision these as measuring the distance along "the lines between the tiles."
		No *actual tile* will have a single coordinate, since they don't lie on the lines, but all of them will have nice, clean, direction-based integers to represent them.
	*/

	q: number,  //the north to south axis
	r: number,  //the diagonal axis from NE to SW
	s: number,  //the diagonal axis from NW to SE
}