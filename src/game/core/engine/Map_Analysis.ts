import { map, size } from "lodash";
import { Point2D, Tile_Pos_Point } from "../../interfaces";
import { Creature_Data, Creature_ƒ } from "../../objects_core/Creature/Creature";
import { Map_Generation_ƒ } from "./Map_Generation";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ, Tilemap_Single } from "./Tilemap_Manager/Tilemap_Manager";
import { ascend, concat, descend, equals, filter, flatten, includes, keys, Ord, slice, sortBy, sortWith, uniq, uniqWith } from "ramda";



type Tile_And_Movement_Data = {
	pos: Tile_Pos_Point,
	remaining_moves: number,
}

export const Map_Analysis_ƒ = {



	calculate_accessible_tiles_for_remaining_movement: (
		creature: Creature_Data,
		_TM: Tilemap_Manager_Data,
		location: Tile_Pos_Point,
		tile_map: Tilemap_Single,
	): Array<Tile_Pos_Point> => {


		/*
			WARNING:  this entire system bakes in a cardinal assumption that our a-star pathfinding doesn't, which is that moving from tile A to tile B is purely determined by the cost of tile B.  This algorithm should be easily adaptable to a differential system (relying on A->B rather than just B), but it's important for future reference.   A differential system would be desirable for e.g. Civ-style "embarkation", or any similar things where it's more expensive to step "up" than it is to step "down".
		*/


		/*
			The process we're following here is to gradually "grow" our current tile search, step by step, until we run out of tiles to move to.

			We use a paired data structure, containing a location, and the number of moves remaining at that location.  When the algorithm is finished, we discard all of the "remaining moves" data, since we just want the list of "which tiles".

			We do most of the work in a function called "expand search"; it takes a list of parent tiles (we're able to start with a list of just one; our source tile), and each parent tile lists "how many moves we have left" for the path that it took to get to them.  In each phase of this, we step over every single tile, and grab every "open" tile next to it.  For interior tiles, this obviously gives no results, but for exterior ones, there's a lot of overlap between adjacent border tiles (two adjacent ones in a 'triangle' will always grab the same third member of the triangle) - because of this we do a big "uniq" pass to eliminate all over the overlap.

			Each pass of this function should basically return a new, 1-tile wide "shell" around the edge.

			Naturally; this blob needs to stop growing on a tile-by-tile basis as we run out of movement.  Because we have tile move costs that are more complex than "one", it's easier to "red flag" this stuff by detecting when it dips below zero, rather than looking for zero itself.  Essentially, we filter after every "growth", and look for any newly added tiles where the remaining moves have dipped below zero, and remove them from the additions.   We don't prevent growth, so yeah; every further "iteration" of the list will eat the cost of re-calculating all the previously invalid growth source, and if that proves expensive, we might optimize by adding some memory of what's to be omitted.

			We know that we're done when we attempt to `expand_search()` and nothing changes.  Once the results of a pass are identical to the previous one, we're done. 
		*/

		//initially, we're just going to cheat and do a numeric number of passes instead, though.

		const initial_tile: Tile_And_Movement_Data = {
			pos: location,
			remaining_moves: Creature_ƒ.get_delegate(creature.type_name).yield_moves_per_turn(),
		}

		let current_tiles: Array<Tile_And_Movement_Data> = [initial_tile];

		let terminate_iter = false;
		let iter = 0;
		while( !terminate_iter && iter < 100 ){
			let new_tiles = Map_Analysis_ƒ.expand_search(_TM, creature, current_tiles, tile_map);

			if( size(new_tiles) == 0 ){
				terminate_iter = true;
			}

			iter++;

			current_tiles = concat(
				new_tiles,
				current_tiles
			)
		}

		return map(current_tiles, (val)=>(val.pos));
	},

	expand_search: (
		_TM: Tilemap_Manager_Data,
		creature: Creature_Data,
		current_tiles: Array<Tile_And_Movement_Data>,
		tile_map: Tilemap_Single,
	): Array<Tile_And_Movement_Data> => {

		/*
			This is really similar to the code for map blob generation.


			First we build a list of all potential tiles we can pick.  We do this by stepping through all members of the existing blob, and calculating all tiles that are adjacent to them.  This would include a bunch of bad tiles, so we filter that out in two steps; the first being that we forbid any tile that's already been picked by either this blob or any prior blob.

			The second is that this would produce a ton of duplicates, so we run a uniq pass to get rid of all of those.
		*/

		//rather than using uniq, we need to grab the value that has the most move points left, since that would be the shortest path

		const non_unique_open_possibilities: Array<Tile_And_Movement_Data> = flatten(
			map(current_tiles, (parent_tile)=>{
				const open_tiles = Map_Generation_ƒ.get_all_open_tiles_adjacent_to(
					_TM,
					parent_tile.pos,
					map(current_tiles, (val)=>(val.pos)),
				)

				/*
					True blocking tiles have a `null` movecost, so omit them:
				*/
				const accessible_open_tiles = filter(
					(tile) => ( Map_Analysis_ƒ.get_move_cost_for_pos(_TM, tile, creature, tile_map) !== null ),
					open_tiles
				)

				/*
					Return all of the points paired with the "moves left" their parent had, and subtract the new move cost from them.
				*/
				return map(accessible_open_tiles, (val)=>({
					pos: val,
					remaining_moves: parent_tile.remaining_moves - (Map_Analysis_ƒ.get_move_cost_for_pos(_TM, val, creature, tile_map) as number)
				}))
			})
		);

		const filtered_open_possibilities: Array<Tile_And_Movement_Data> = filter(
			(val)=>( val.remaining_moves >= 0 ),
			non_unique_open_possibilities
		)

		/*
			In an ideal world, we'd like to be able to run some kind of "uniq" function that detects "matching items", and then uses a secondary criterion to discard one of the two; essentially saying that "hey, consider the position field to be the 'identifier'/'primary' value for this, and then use the remaining moves as a secondary value to decide which one to keep".

			However, we're not given such an all-in-one function in Ramda, so we'd either have to recreate the basic functionality of `uniq` using some other function, or rely on what they do provide.

			What they do provide is a `uniqWith` function which relies on prior sorting of our list to decide what stays/goes - it "prefers the first item" if our test function considers them equal.
		*/
		const sorted_non_unique_open_possibilities = sortWith( [descend(
			(val: Tile_And_Movement_Data) => ( val.remaining_moves )
		)], filtered_open_possibilities)

		const unique_open_possibilities = uniqWith(
			(a: Tile_And_Movement_Data, b: Tile_And_Movement_Data): boolean => (
				equals(a.pos, b.pos)
			),
			sorted_non_unique_open_possibilities
		)

		return unique_open_possibilities;


	},
	


	get_move_cost_for_pos: (
		_TM: Tilemap_Manager_Data,
		pos: Tile_Pos_Point,
		creature: Creature_Data,
		tile_map: Tilemap_Single,
	): number|null => {

		const tile_type = Tilemap_Manager_ƒ.get_tile_name_for_pos_in_tilemap(
			pos,
			tile_map
		)	

		return Creature_ƒ.get_delegate(creature.type_name).yield_move_cost_for_tile_type(tile_type);
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