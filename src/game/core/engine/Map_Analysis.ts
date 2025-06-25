import { Point2D } from "../../interfaces";
import { Creature_Data, Creature_ƒ } from "../../objects_core/Creature/Creature";
import { Map_Generation_ƒ } from "./Map_Generation";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "./Tilemap_Manager/Tilemap_Manager";
import { concat, filter, flatten, includes, keys, slice, uniq } from "ramda";


export const Map_Analysis_ƒ = {


	// yield_move_cost_for_tile_type: (me: Creature_Data, tile_type: string): number|null => (
	// 	Creature_ƒ.get_delegate(me.type_name).yield_move_cost_for_tile_type(tile_type)
	// ),

	calculate_accessible_tiles_for_remaining_movement: (
		me: Creature_Data,
		_TM: Tilemap_Manager_Data,
		location: Point2D,
	): Array<Point2D> => {

		const open_tiles: Array<Point2D> = Map_Generation_ƒ.get_all_open_tiles_adjacent_to(
			_TM,
			location,
			[]
		)

		return concat(open_tiles, [location]);
	}

	/*----------------------- blob-related code -----------------------*/
		// get_all_accessible_tiles_adjacent_to: (
		// 	_TM: Tilemap_Manager_Data,
		// 	location: Point2D,
		// 	forbidden_tiles: Array<Point2D>,
		// ): Array<Point2D> => {
		// 	const adjacent_tiles: Array<Point2D> = [
		// 		Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'east'),
		// 		Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'north_east'),
		// 		Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'north_west'),
		// 		Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'south_east'),
		// 		Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'south_west'),
		// 		Tilemap_Manager_ƒ.get_adjacent_tile_in_direction(location, 'west')
		// 	];
	
		// 	const adjacent_tiles_within_map = filter(
		// 		(tile) => (	Tilemap_Manager_ƒ.is_within_map_bounds( _TM, tile )),
		// 		adjacent_tiles
		// 	)
	
		// 	const open_adjacent_tiles = filter(
		// 		(val)=>( !includes(val,forbidden_tiles)),
		// 		adjacent_tiles_within_map
		// 	);
	
		// 	return open_adjacent_tiles;
		// },
	
}