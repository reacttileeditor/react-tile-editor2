import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

import { PriorityQueue } from 'ts-pq';

import { ƒ } from "./Utils";

import { Asset_Manager_Data, TileComparatorSample, TilePositionComparatorSample } from "./Asset_Manager";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "./Tilemap_Manager";
import { Creature_Data, Creature_ƒ } from "../../objects_core/Creature";
import { Point2D, Rectangle } from '../../interfaces';

interface tileViewState {
	tileStatus: TileGrid,
	initialized: boolean,
}

interface NodeGraph {
	[index: string]: Array<WeightedNode>
}

interface NodeAddrToNodeAddrDict {
	[index: string]: string
}

interface NodeAddrToNumberDict {
	[index: string]: number
}

interface WeightedNode {
	tile_addr: string,
	move_cost: number,
}

type TileGrid = Array<Array<string>>;

export type Pathfinding_Result = {
	successful_path: Array<Point2D>,
	discarded_nodes: Array<string>,
}


export const Node_Graph_Generate = (_TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _Creature: Creature_Data, grid: TileGrid ): NodeGraph => {

	
/*----------------------- core functionality -----------------------*/
	const move_cost_for_coords = ( _grid: TileGrid, _coords: Point2D ): number|null => (
		Creature_ƒ.yield_move_cost_for_tile_type( _Creature, _grid[_coords.y][_coords.x] )
	)
	
	
	const push_if_not_null = (_array: Array<WeightedNode>, _push_val: WeightedNode|null): void => {
		if(_push_val != null){
			_array.push( _push_val );
		}
	}
	
	const check_tile = ( _grid: TileGrid, _coords: Point2D ): WeightedNode|null => {
		/*
			If the tile we're checking is out of bounds, then it's blocked.
			If the tile we're checking is open, it's a valid node connection, so we return it (so we can add it to the graph).
		*/
		if( Tilemap_Manager_ƒ.is_within_map_bounds( _TM, _coords ) ){
			let weight = move_cost_for_coords( _grid, _coords );
		
			if( weight !== null ){
				return {
					tile_addr: _coords.x + "," + _coords.y,
					move_cost: weight,	
				};
			} else {
				return null;
			}
		} else {
			return null;
		}
	};


	const check_adjacencies = ( _grid: TileGrid, _coords: Point2D ): Array<WeightedNode> => {
		const tile_data: TilePositionComparatorSample = Tilemap_Manager_ƒ.get_tile_position_comparator_for_pos(_TM, _coords);
		var adjacent_nodes: Array<WeightedNode> = [];

		/*
			Check every adjacent tile in clockwise order, starting from the north.
			Skip the very middle tile [1][1] in the comparator, because we're attempting to build a graph of "vectors" (i.e. directions we can move towards), and this will break the algorithm if we include it.  Probably. 
		*/
		push_if_not_null( adjacent_nodes, check_tile ( _grid, tile_data[0][0] ));
		push_if_not_null( adjacent_nodes, check_tile ( _grid, tile_data[0][1] ));
		push_if_not_null( adjacent_nodes, check_tile ( _grid, tile_data[1][0] ));
		push_if_not_null( adjacent_nodes, check_tile ( _grid, tile_data[1][2] ));
		push_if_not_null( adjacent_nodes, check_tile ( _grid, tile_data[2][0] ));
		push_if_not_null( adjacent_nodes, check_tile ( _grid, tile_data[2][1] ));

		return adjacent_nodes;
	}
	
	const build_node_graph_from_grid = ( _grid: TileGrid ): NodeGraph => {
		var graph_as_adjacency_list: Array<string> = [];
		
		_.map( _grid, (row_value: Array<string>, row_index) => {
			_.map( row_value, (col_value, col_index) => {

				//using this to skip solid tiles; we already handle tracking adjacencies *into* solid tile in the check_adjacencies function, but we need to skip looking *outwards* from solid tiles as well.
				if( move_cost_for_coords( _grid, {x: col_index, y: row_index} ) !== null ){
					(graph_as_adjacency_list[`${col_index},${row_index}` as any] as any) = check_adjacencies( _grid, { x: col_index, y: row_index } );
				}
			})
		});
		
		return graph_as_adjacency_list as unknown as NodeGraph;
	}

	return build_node_graph_from_grid(grid);
}

const addr_to_tuple = (the_string: string): Point2D => {
	return{ x: Number(the_string.split(',')[0]), y: Number(the_string.split(',')[1]) }
}

const tuple_to_addr = (the_tuple: Point2D): string => {
	return  the_tuple.x + ',' + the_tuple.y;
}
			


const a_star_search = ( _graph: NodeGraph, _start_coords: Point2D, _end_coords: Point2D, _creature: Creature_Data ): Pathfinding_Result => {
	var discarded_nodes = [];
	let search_was_aborted_early : boolean = false;
	let search_has_succeeded : boolean = false;


	var frontier = new PriorityQueue<Point2D>();
	var costs_so_far: NodeAddrToNumberDict = {};  //a map of node addresses (keys) to move cost (values)
	var came_from: NodeAddrToNodeAddrDict = {}; //a map of node addresses (keys) to node addresses (values) 
	
	
	const compute_node_heuristic = ( _node_coords: Point2D, _end_coords: Point2D ) => {
		return Math.hypot( _node_coords.x - _end_coords.x, _node_coords.y - _end_coords.y);
	}
	

	//do some bigtime sanity checks so we don't crash
	if(
		!(tuple_to_addr(_start_coords) in _graph)

		//I'm really not sure if we should have end_coords in this check.  Sort of a todo for later.
	){
		/*
			We're testing to see if the start coords were somehow blocked.  If they're not available as one of the graph keys it means they're not a passable tile.
		
			Remember that the graph isn't merely list of connections, but it's specifically a list of one-way connections; that is, indications that "if you were in tile A, you could go to tile B" - and that the reverse of that, the B->A case, is stored separately and NOT automatically the same as A->B in a node graph.  It's possible to have one-way connections in a node graph, even though we don't currently use them (but say, jumping off a cliff might count, and a lot more prosaic movement constraints might kick this rule into play when units have pretty limited moves-per-turn, and when there's a 'rounded' move cost for entering a tile).
		
			So if a node isn't in the graph, we know for sure the whole path reconstruction thing will fail.
		*/
		search_was_aborted_early = true;
	} 
	
	if( !search_was_aborted_early ){
		frontier.insert( _start_coords, 0 );
		costs_so_far[ tuple_to_addr(_start_coords) ] = 0;
		while( (frontier.size() > 0) ){
	
			const _current_node = frontier.pop(false) as Point2D;
			const current_node = tuple_to_addr(_current_node);
	
			if(current_node == tuple_to_addr(_end_coords)){
				search_has_succeeded = true;
				break;
			}
	
			_.map( _graph[ current_node ], (next_node, index) => {
				/*
					This loads the cost of "this particular unit" moving to the next tile from the weighted node graph.
					
					Note that this isn't "commutative" (the old math rule about a + b = b + a).  Going from "tile A to tile B" might have a different cost than "tile B to tile A".  
					
					This might sound a bit crazy, but it's mighty convenient, because it's frequently used in a lot of games.  A common trope is how jumping off a (short!) ledge is much cheaper than clambering up.  Another common trope is (in 4x strategy games like Civ) is having the act of moving troops onto water take far more time than having them move from water to land (the presumption being that they take a large amount of time to assemble boats from local materials upon embarking, but to disembark, they just hop off and abandon the ships). 
				*/
				var new_cost = costs_so_far[ current_node ] + next_node.move_cost;
			
				if(
					!_.includes(_.keys(costs_so_far), next_node.tile_addr)
					||
					new_cost < costs_so_far[next_node.tile_addr]
				){
					costs_so_far[next_node.tile_addr] = new_cost;
			
					frontier.insert(
						addr_to_tuple(next_node.tile_addr),
						new_cost + compute_node_heuristic( addr_to_tuple(next_node.tile_addr), _end_coords )
					);
					
					came_from[next_node.tile_addr] = current_node;
			
				}

			})
		}
	}
	

	const reconstruct_path = (came_from: NodeAddrToNodeAddrDict, start_node: string, goal_node: string): Array<Point2D> => {
		let current_node = goal_node;
		let path: Array<string>  = [];
		while( current_node != start_node ){
			path.push(current_node);
			current_node = came_from[current_node];
		}
		path.push(start_node);
		
		let path_as_tuples = _.map(path, (val,idx) => ( addr_to_tuple(val) ) );
		let path_in_natural_order = _.reverse(_.cloneDeep(path_as_tuples));
		return path_in_natural_order;
	}


	return {
		successful_path:	ƒ.if(search_has_succeeded,
								()=>( reconstruct_path(came_from, tuple_to_addr(_start_coords), tuple_to_addr(_end_coords) )),
								[]
							),
		discarded_nodes: _.keys(came_from)
	};
	
}




export const Pathfinder_ƒ = {
	find_path_between_map_tiles: (_TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _start_coords: Point2D, _end_coords: Point2D, _Creature: Creature_Data) => {
		/*
			We're going to go ahead and pass in the creature as a constructor argument; the idea here is that we can't really "reuse" an existing node graph generator and just pass in a new creature type; the moment anything changes about the creature we're using, we need to completely rebuild the node graph from scratch.  So there's no sense in pipelining it into the whole function tree inside the class - we have to nuke and rebuild anyways, so why not make the interface a bit simpler?
		*/
		//const _Node_Graph_Generator = new Node_Graph_Generator(_TM, _AM, _Creature);

	
		//const _graph = _Node_Graph_Generator.build_node_graph_from_grid( _TM.tile_maps.terrain );

		const _graph = Node_Graph_Generate(_TM, _AM, _Creature, _TM.tile_maps.terrain);

		return a_star_search( _graph, _start_coords, _end_coords, _Creature );
	}
}

