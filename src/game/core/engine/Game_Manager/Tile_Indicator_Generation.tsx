import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, find, findIndex, isEmpty, isEqual, isNil, isNumber, last, map, reduce, size, toArray, uniq } from "lodash";
import { includes, keys } from "ramda"

import { constrain_point_within_rect, ƒ } from "../Utils";

import { Canvas_View, Mouse_Button_State } from "../../gui/Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../Blit_Manager";
import { Tile_Palette_Element } from "../../gui/Tile_Palette_Element";
import { Tilemap_Manager_Data, Direction, Tilemap_Manager_ƒ, Tilemap_Single, Tilemaps, Asset_Blit_Tilemaps } from "../Tilemap_Manager/Tilemap_Manager";
import { Pathfinder_ƒ } from "../Pathfinding";

import { Creature_ƒ, New_Creature, Creature_Data, Path_Node_With_Direction, Change_Instance, Creature_Type_Name } from "../../../objects_core/Creature/Creature";

import { Point2D, Rectangle } from '../../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../../objects_core/Custom_Object/Custom_Object";
import { zorder } from "../../constants/zorder";
import { Vals } from "../../constants/Constants";
import { Game_Manager_Data, Game_Manager_ƒ, Game_and_Tilemap_Manager_Data } from "./Game_Manager";
import { Map_Analysis_ƒ } from "../Map_Analysis";
import { tile_maps_init } from "../Tilemap_Manager/Initialization";



export const Game_Manager_ƒ_Tile_Indicator_Generation = {
	/*----------------------- Tile Indicator Generation -----------------------*/




	generate_unit_path_tilemap: (
		me: Game_Manager_Data,
		creature: Creature_Data|undefined,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_TM: Tilemap_Manager_Data
	): Tilemap_Single => {
		let new_real_path_tile_map: Tilemap_Single = Tilemap_Manager_ƒ.create_empty_tile_map(_TM, _AM);

		if(creature != undefined){
			new_real_path_tile_map = map( _TM.tile_maps.real_path, (y_val, y_idx) => {
				return map (y_val, (x_val, x_idx)=>{
					/*
						Here we build a brand new tilemap for the unit path, from scratch.
					*/

					/*if(
						isEqual({x: x_idx, y: y_idx}, creature.tile_pos)
						&&
						!size(creature.path_data.path_this_turn)
					){
						return x_val;//'cursor_green';
					} */



						
					return	includes({x: x_idx, y: y_idx}, creature.path_data.path_this_turn )
					?
						includes({x: x_idx, y: y_idx}, creature.path_data.path_reachable_this_turn)
						?
							isEqual({x: x_idx, y: y_idx}, last(creature.path_data.path_reachable_this_turn))
							?
							'arrowhead_green'
							:
							'arrow_green'
						:
						'red-path-unreachable-dot'
					:	
					''						
				})
			})

			// let new_movemap_tile_map: Tilemap_Single = Tilemap_Manager_ƒ.create_empty_tile_map(_TM, _AM);

			// new_movemap_tile_map = map( _TM.tile_maps.move_map, (y_val, y_idx) => {
			// 	return map (y_val, (x_val, x_idx)=>{
			// 		/*
			// 			Step over each tile, and if something is in the list of possible moves, spit out a tile marker.
			// 		*/

			// 		if (
			// 			!size(creature.path_data.path_this_turn)
			// 			&&
			// 			includes({x: x_idx, y: y_idx}, me.game_state.selected_object_possible_moves)
			// 		){
			// 			return 'tile_boundary';
			// 		}


			// 		return '';
			// 	})
			// })
		}

		return new_real_path_tile_map;
	},

	generate_prospective_unit_path_tilemap: (
		me: Game_Manager_Data,
		creature: Creature_Data|undefined,
		path: Array<Point2D>,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_TM: Tilemap_Manager_Data
	): Tilemap_Single => {
		let new_prospective_path_tile_map: Tilemap_Single = Tilemap_Manager_ƒ.create_empty_tile_map(_TM, _AM);

		if(creature != undefined){
			new_prospective_path_tile_map = map( _TM.tile_maps.real_path, (y_val, y_idx) => {
				return map (y_val, (x_val, x_idx)=>{
					/*
						Here we build a brand new tilemap for the unit path, from scratch.
					*/



					return	includes({x: x_idx, y: y_idx}, path )
							?
								includes({x: x_idx, y: y_idx}, path)
								?
									isEqual({x: x_idx, y: y_idx}, last(path))
									?
									'arrowhead_skinny_green'
									:
									'arrow_skinny_green'
								:
								''
							:	
							''
				})
			})
		}

		return new_prospective_path_tile_map;
	},

	generate_possible_moves_tilemap: (
		me: Game_Manager_Data,
		creature: Creature_Data|undefined,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_TM: Tilemap_Manager_Data
	): Tilemap_Single => {
		console.log('generate_possible_moves_tilemap')
		let new_movemap_tile_map: Tilemap_Single = Tilemap_Manager_ƒ.create_empty_tile_map(_TM, _AM);
		
		let newly_selected_object_possible_moves: Array<Point2D> = [];
		
		if( creature != undefined ){
			newly_selected_object_possible_moves = Map_Analysis_ƒ.calculate_accessible_tiles_for_remaining_movement(
				creature,
				_TM,
				creature.tile_pos
			);
		}


		new_movemap_tile_map = map( _TM.tile_maps.real_path, (y_val, y_idx) => {
			return map (y_val, (x_val, x_idx)=>{
				if(creature == undefined){
					/*
						If nobody's actually selected, we're just doing an empty tile map.
					*/
					return '';
				} else {
					/*
						But if they are, we're isolating the open tiles and moving to them.
					*/

					if (
						includes({x: x_idx, y: y_idx}, newly_selected_object_possible_moves)
					){
						return 'tile_boundary';
					}


					return '';
				}
			})
		})

		return new_movemap_tile_map;
	},

	adjust_tiles_to_display_unit_path_and_possible_moves: (
		me: Game_Manager_Data,
		creature: Creature_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_TM: Tilemap_Manager_Data
	): Game_and_Tilemap_Manager_Data => {

		const new_real_path_tile_map = Game_Manager_ƒ.generate_unit_path_tilemap(
			me,
			creature,
			_AM,
			_BM,
			_TM
		);	

		const new_movemap_tile_map = Game_Manager_ƒ.generate_possible_moves_tilemap(
			me,
			creature,
			_AM,
			_BM,
			_TM
		);


		return {
			tm: {
				level_name: _TM.level_name,
				metadata: cloneDeep(_TM.metadata),
				tile_maps: {
					...cloneDeep(_TM.tile_maps),
					move_map: new_movemap_tile_map,
					real_path: new_real_path_tile_map,
				},
				tile_RNGs: cloneDeep(_TM.tile_RNGs),
				creature_list: cloneDeep(_TM.creature_list),
				initialized: true,
				...Tilemap_Manager_ƒ.cleared_cache(),
				asset_blit_list_cache_by_tilemap: {
					terrain: _TM.asset_blit_list_cache_by_tilemap.terrain,
					move_map: [[[]]],
					real_path: [[[]]],
					prospective_path: [[[]]],
				}

			},
			gm: me,
		}
	},

	adjust_tiles_to_display_unit_path: (
		me: Game_Manager_Data,
		creature: Creature_Data,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_TM: Tilemap_Manager_Data
	): Game_and_Tilemap_Manager_Data => {

		const new_real_path_tile_map = Game_Manager_ƒ.generate_unit_path_tilemap(
			me,
			creature,
			_AM,
			_BM,
			_TM
		);	

		const new_movemap_tile_map = Game_Manager_ƒ.generate_possible_moves_tilemap(
			me,
			creature,
			_AM,
			_BM,
			_TM
		);


		return {
			tm: {
				level_name: _TM.level_name,
				metadata: cloneDeep(_TM.metadata),
				tile_maps: {
					...cloneDeep(_TM.tile_maps),
					real_path: new_real_path_tile_map,
				},
				tile_RNGs: cloneDeep(_TM.tile_RNGs),
				creature_list: cloneDeep(_TM.creature_list),
				initialized: true,
				...Tilemap_Manager_ƒ.cleared_cache(),
				asset_blit_list_cache_by_tilemap: {
					terrain: _TM.asset_blit_list_cache_by_tilemap.terrain,
					move_map: [[[]]],
					real_path: [[[]]],
					prospective_path: [[[]]],
				}

			},
			gm: me,
		}
	},

	adjust_tiles_to_display_possible_moves: (
		me: Game_Manager_Data,
		creature: Creature_Data|undefined,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_TM: Tilemap_Manager_Data
	): Game_and_Tilemap_Manager_Data => {

		const new_movemap_tile_map = Game_Manager_ƒ.generate_possible_moves_tilemap(
			me,
			creature,
			_AM,
			_BM,
			_TM
		);


		let new_tile_maps: Tilemaps = cloneDeep(tile_maps_init);
		
		map(keys(_TM.tile_maps), (name)=>{
			if(name !== 'move_map'){
				new_tile_maps[name] = _TM.tile_maps[name];
			} else {
				new_tile_maps[name] = new_movemap_tile_map
			}
		});

		let new_asset_blit_cache: Asset_Blit_Tilemaps = cloneDeep(tile_maps_init);
		
		map(keys(_TM.asset_blit_list_cache_by_tilemap), (name)=>{
			if(name !== 'move_map'){
				new_asset_blit_cache[name] = _TM.asset_blit_list_cache_by_tilemap[name];
			} else {
				new_asset_blit_cache[name] = [[[]]];
			}
		});		

		
		return {
			tm: {
				level_name: _TM.level_name,
				metadata: cloneDeep(_TM.metadata),
				tile_maps: new_tile_maps,
				tile_RNGs: cloneDeep(_TM.tile_RNGs),
				creature_list: cloneDeep(_TM.creature_list),
				initialized: true,
				...Tilemap_Manager_ƒ.cleared_cache(),
				asset_blit_list_cache_by_tilemap: new_asset_blit_cache,
			},
			gm: me,
		}
	},


	adjust_tiles_to_display_possible_moves_and_prospective_path: (
		me: Game_Manager_Data,
		creature: Creature_Data|undefined,
		path: Array<Point2D>,
		_AM: Asset_Manager_Data,
		_BM: Blit_Manager_Data,
		_TM: Tilemap_Manager_Data
	): Game_and_Tilemap_Manager_Data => {

		const new_movemap_tile_map = Game_Manager_ƒ.generate_possible_moves_tilemap(
			me,
			creature,
			_AM,
			_BM,
			_TM
		);

		const new_prospective_path_tile_map = Game_Manager_ƒ.generate_prospective_unit_path_tilemap(
			me,
			creature,
			path,
			_AM,
			_BM,
			_TM
		);	


		let new_tile_maps: Tilemaps = cloneDeep(tile_maps_init);
		
		map(keys(_TM.tile_maps), (name)=>{
			if( !includes(name, ['move_map','prospective_path']) ){
				new_tile_maps[name] = _TM.tile_maps[name];
			} else {
				if( name == 'move_map'){
					new_tile_maps[name] = new_movemap_tile_map
				} else {
					new_tile_maps[name] = new_prospective_path_tile_map
				}
			}
		});

		let new_asset_blit_cache: Asset_Blit_Tilemaps = cloneDeep(tile_maps_init);
		
		map(keys(_TM.asset_blit_list_cache_by_tilemap), (name)=>{
			if( !includes(name, ['move_map','prospective_path']) ){
				new_asset_blit_cache[name] = _TM.asset_blit_list_cache_by_tilemap[name];
			} else {
				new_asset_blit_cache[name] = [[[]]];
			}
		});		

		
		return {
			tm: {
				level_name: _TM.level_name,
				metadata: cloneDeep(_TM.metadata),
				tile_maps: new_tile_maps,
				tile_RNGs: cloneDeep(_TM.tile_RNGs),
				creature_list: cloneDeep(_TM.creature_list),
				initialized: true,
				...Tilemap_Manager_ƒ.cleared_cache(),
				asset_blit_list_cache_by_tilemap: new_asset_blit_cache,
			},
			gm: me,
		}
	},



}

