import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import { v4 as uuid } from "uuid";

import { ƒ } from "./Utils";

// import { Canvas_View } from "./Canvas_View";
// import { Asset_Manager } from "./Asset_Manager";
// import { Blit_Manager } from "./Blit_Manager";
// import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Tilemap_Manager, Direction } from "./Tilemap_Manager";
import { Pathfinder, Pathfinding_Result } from "./Pathfinding";

import { Point2D, Rectangle } from './interfaces';
import { CustomObjectType, CustomObjectTypeName, Custom_Object } from "./Custom_Object";
import { Game_State } from "./Game_View";
import { Base_Object } from "./Base_Object";

export type PathNodeWithDirection = {
	position: Point2D,
	direction: Direction,
}

export type CreatureTypeName = 'hermit' | 'peasant' | 'skeleton';




export class Creature extends Base_Object {
	tile_pos: Point2D;
	facing_direction: Direction;
	planned_tile_pos: Point2D;
	unique_id: string;
	path_this_turn: Array<Point2D>;
	path_this_turn_with_directions: Array<PathNodeWithDirection>;
	path_reachable_this_turn: Array<Point2D>;
	path_reachable_this_turn_with_directions: Array<PathNodeWithDirection>;
	animation_this_turn: Array<Anim_Schedule_Element>;
	type_name: CreatureTypeName;
	team: number;
	get_game_state: () => Game_State;

	creature_basetype_delegate: CreatureType;
	pixel_pos: Point2D;



	constructor(p: {
		get_game_state:  () => Game_State,
		tile_pos: Point2D,
		direction?: Direction,
		planned_tile_pos: Point2D,
		type_name: CreatureTypeName,
		team: number,
		unique_id?: string,
	}) {
		super({
			get_game_state:  p.get_game_state,
			type_name: p.type_name,
			pixel_pos: {x:0, y: 0},
		})

		this.tile_pos = p.tile_pos;
		this.facing_direction = ƒ.if(p.direction !== undefined, p.direction, Direction.south_east);
		this.type_name = p.type_name;
		this.planned_tile_pos = p.planned_tile_pos;
		this.path_this_turn = [];
		this.path_this_turn_with_directions = [];
		this.path_reachable_this_turn = [];
		this.path_reachable_this_turn_with_directions = [];
		this.animation_this_turn = [];
		this.team = p.team;
		this.get_game_state = p.get_game_state;
		
		if(p.unique_id != undefined){
			this.unique_id = p.unique_id;
		} else {
			this.unique_id = uuid();
		}
		
		this.creature_basetype_delegate = this.instantiate_basetype_delegate();

		this.pixel_pos = {x:0, y: 0};
		
	}
	
	yield_move_cost_for_tile_type = (tile_type: string): number|null => (
		this.creature_basetype_delegate.yield_move_cost_for_tile_type(tile_type)
	)
	
	yield_moves_per_turn = (): number => (
		this.creature_basetype_delegate.yield_moves_per_turn()
	)
	
	yield_walk_asset_for_direction = (direction: Direction):string => (
		this.creature_basetype_delegate.yield_walk_asset_for_direction(direction)
	)

	yield_stand_asset_for_direction = (direction: Direction):string => (
		this.creature_basetype_delegate.yield_stand_asset_for_direction(direction)
	)


	yield_creature_image = () => (
		this.creature_basetype_delegate.yield_creature_image()
	)






/*----------------------- basetype management -----------------------*/

	get_info = ():CreatureType => (
		this.creature_basetype_delegate
	)


	instantiate_basetype_delegate = ():CreatureType => {
		return {
			hermit: new CT_Hermit(),
			peasant: new CT_Peasant(),
			skeleton: new CT_Skeleton(),
		}[this.type_name];
	}

/*----------------------- movement -----------------------*/

	set_path = (new_path: Array<Point2D>, _Tilemap_Manager: Tilemap_Manager) => {
		this.path_this_turn = new_path;
		this.path_reachable_this_turn = this.yield_path_reachable_this_turn(new_path);
		
		this.path_this_turn_with_directions = this.build_directional_path_from_path(
			this.path_this_turn,
			_Tilemap_Manager
		);

		this.path_reachable_this_turn_with_directions = this.yield_directional_path_reachable_this_turn(this.path_this_turn_with_directions);


		//console.log("directional path", this.path_this_turn_with_directions)

		this.build_anim_from_path(_Tilemap_Manager);

		//console.log('anim:', this.animation_this_turn)
	}
	
	yield_path_reachable_this_turn = (new_path: Array<Point2D>):Array<Point2D> => {
		let moves_remaining = this.yield_moves_per_turn();
		let final_path: Array<Point2D> = [];
	
		_.map( new_path, (val) => {
			moves_remaining = moves_remaining - 1;
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	}

	yield_directional_path_reachable_this_turn = (new_path: Array<PathNodeWithDirection>):Array<PathNodeWithDirection> => {
		let moves_remaining = this.yield_moves_per_turn();
		let final_path: Array<PathNodeWithDirection> = [];
	
		_.map( new_path, (val) => {
			moves_remaining = moves_remaining - 1;
			
			if(moves_remaining > 0){
				final_path.push(val);
			}
		})
		
		return final_path;
	}

	
	build_anim_from_path = (_Tilemap_Manager: Tilemap_Manager) => {
		var time_so_far = 0;
		this.animation_this_turn = [];

		_.map(this.path_reachable_this_turn, (val,idx) => {
			if(idx != _.size(this.path_reachable_this_turn) - 1){
				this.animation_this_turn.push({
					direction: this.extract_direction_from_map_vector(
						val,
						this.path_reachable_this_turn[idx + 1],
						_Tilemap_Manager
					),
					duration: 300,
					start_time: time_so_far,
					start_pos: val,
					end_pos: this.path_reachable_this_turn[idx + 1],
				})
				
				time_so_far = time_so_far + 300;
			}
		})
	}

	build_directional_path_from_path = (
		raw_path: Array<Point2D>,
		_Tilemap_Manager: Tilemap_Manager
	): Array<PathNodeWithDirection> => (

		_.map( raw_path, (val, idx) => {


			if( idx == 0){
				return {
					position: raw_path[idx],
					direction: this.facing_direction
				}
			} else {
				return {
					position: raw_path[idx],
					direction: this.extract_direction_from_map_vector(
						raw_path[idx - 1],
						raw_path[idx],
						_Tilemap_Manager
					)
				}
			}
		} )
	)

	extract_direction_from_map_vector = (
		start_pos: Point2D,
		end_pos: Point2D,
		_Tilemap_Manager: Tilemap_Manager
	):Direction => {
		const pixel_start_pos = _Tilemap_Manager.convert_tile_coords_to_pixel_coords(start_pos);
		const pixel_end_pos = _Tilemap_Manager.convert_tile_coords_to_pixel_coords(end_pos);

		if( pixel_start_pos.y == pixel_end_pos.y ){
			if(pixel_start_pos.x < pixel_end_pos.x){
				return Direction.east;
			} else {
				return Direction.west;
			}
		} else if( pixel_start_pos.y >= pixel_end_pos.y  ){
			if(pixel_start_pos.x < pixel_end_pos.x){
				return Direction.north_east;
			} else {
				return Direction.north_west;
			}
		} else {
			if(pixel_start_pos.x < pixel_end_pos.x){
				return Direction.south_east;
			} else {
				return Direction.south_west;
			}
		}
	}
	
	calculate_total_anim_duration = (): number => {
		return ƒ.if( _.size(this.animation_this_turn) > 0,
			_.reduce(
				_.map(this.animation_this_turn, (val)=> (val.duration)),
				(left,right) => (left + right)
			) as number,
			0
		)
	}

	process_single_frame = (_Tilemap_Manager: Tilemap_Manager, offset_in_ms: number): {new_state: Creature, spawnees: Array<Custom_Object> } => {

		const new_obj = _.cloneDeep(this);

		new_obj.pixel_pos = new_obj.yield_position_for_time_in_post_turn_animation(_Tilemap_Manager, offset_in_ms)

		const spawnees = ƒ.if(offset_in_ms >= 20 && offset_in_ms <= 100 && this.type_name == 'peasant', [new Custom_Object({
			get_game_state: this.get_game_state,
			pixel_pos: new_obj.pixel_pos,
			type_name: 'shot' as CustomObjectTypeName,
		})], []);

		return {
			new_state: new_obj,
			spawnees: spawnees
		};
		
		/*
			PLANS:
			- calculate which tile we're moving into, so that we know where we end up "stopping"
			- start doing rudimentary AI behavior, where we take shots at enemies if they're in-range.
		*/
	}



	yield_animation_segment_for_time_offset = (offset_in_ms: number): Anim_Schedule_Element|undefined => (
		_.find(this.animation_this_turn, (val) => {
			//			console.log(`start ${val.start_time}, offset ${offset_in_ms}, end ${val.start_time + val.duration}`);
		
			return val.start_time <= offset_in_ms
			&&
			offset_in_ms < (val.start_time + val.duration)
		})
	)


	yield_direction_for_time_in_post_turn_animation = ( offset_in_ms: number ):Direction => {
		var animation_segment = this.yield_animation_segment_for_time_offset(offset_in_ms);

		if(animation_segment == undefined){
			/*
				TODO -I don't really have the time to think through this - this comment's getting written during some test implementation.
				We'll just return 'east' for now.
			*/
			return Direction.east;
		} else {
			return animation_segment.direction;
		}
	}
	
	yield_position_for_time_in_post_turn_animation = (_Tilemap_Manager: Tilemap_Manager, offset_in_ms: number):Point2D => {
//		console.log(this.animation_this_turn);
		var animation_segment = this.yield_animation_segment_for_time_offset(offset_in_ms);
		
		if(animation_segment == undefined){
			/*
				There are a few reasons we might not be able to find a corresponding animation segment.
				If the desired time is off the end of the animation, return our final position.
				
				If it's absolutely anything else, then let's just return the initial starting position.  The most common case for this would be one where we just don't really have an animation.
				(Nominally this would include "before the start of the animation", but as much as that's an error case, it makes no sense why we'd end up there)
			*/

			if(offset_in_ms >= this.calculate_total_anim_duration() ){
				return _Tilemap_Manager.convert_tile_coords_to_pixel_coords(this.planned_tile_pos)
			} else {
				return _Tilemap_Manager.convert_tile_coords_to_pixel_coords(this.tile_pos)
			}
		} else {
			//cheating for some test code - first we'll just do the start pos; then we'll linearly interpolate.   We want to linearly interpolate here, because any "actual" easing function should happen over the whole animation, not one segment (otherwise we'll have a very 'stuttery' movement pattern.
			
			let time_offset_in_anim_segment = (offset_in_ms - animation_segment.start_time);
			let time_offset_normalized = 1.0 - (time_offset_in_anim_segment / animation_segment.duration)
			
            return ƒ.round_point_to_nearest_pixel( 
                ƒ.tween_points(
                    _Tilemap_Manager.convert_tile_coords_to_pixel_coords( animation_segment.start_pos ),
                    _Tilemap_Manager.convert_tile_coords_to_pixel_coords( animation_segment.end_pos ),
                    time_offset_normalized
                )
            );
			
			//return _Tilemap_Manager.convert_tile_coords_to_pixel_coords(animation_segment.start_pos);
		}
	}
}


type Anim_Schedule_Element = {
	direction: Direction,
	duration: number,
	start_time: number,
	start_pos: Point2D,
	end_pos: Point2D,
}


export type CreatureType = CT_Hermit | CT_Peasant | CT_Skeleton;


class Creature_Base_Type {
	yield_walk_asset_for_direction = (direction:Direction):string => ( this.yield_creature_image() )
	yield_stand_asset_for_direction = (direction:Direction):string => ( this.yield_creature_image() )

	yield_move_cost_for_tile_type = (tile_type: string): number|null => {
		if(tile_type == 'menhir1' || tile_type == 'menhir2'){
			return null;
		} else if (tile_type == 'water'){
			return 10;
		} else {
			return 1;
		}
	}

	yield_prettyprint_name = () => ( 'Generic Unit' )


	yield_creature_image = () => ( '' )
/*----------------------- stats -----------------------*/
	yield_moves_per_turn = (): number => ( 1 )
	yield_damage = (): number => ( 5 )
	yield_max_hitpoints = (): number => ( 100 )


}

class CT_Hermit extends Creature_Base_Type {

	yield_moves_per_turn = () => ( 5 )
	yield_creature_image = () => ( 'hermit' )
	yield_prettyprint_name = () => ( 'Hermit' )

}

class CT_Peasant extends Creature_Base_Type {

	yield_walk_asset_for_direction = (direction:Direction):string => {
		/*return {
			Direction.north_east: 'peasant-ne-walk',
			Direction.north_west:'peasant-ne-walk',
			Direction.east: 'peasant-ne-walk',
			Direction.south_east: 'peasant-se-walk',
			Direction.west: 'peasant-se-walk',
			Direction.south_west: 'peasant-se-walk',			
		}[direction];*/

		switch(direction){
			case Direction.north_east:
				return 'peasant-ne-walk'; break;
			case Direction.north_west:
				return 'peasant-ne-walk'; break;
			case Direction.east:
				return 'peasant-ne-walk'; break;
			case Direction.south_east:
				return 'peasant-se-walk'; break;
			case Direction.west:
				return 'peasant-se-walk'; break;
			case Direction.south_west:
				return 'peasant-se-walk'; break;
		}
	}
	
	yield_stand_asset_for_direction = (direction:Direction):string => {
		switch(direction){
			case Direction.north_east:
				return 'peasant-ne'; break;
			case Direction.north_west:
				return 'peasant-ne'; break;
			case Direction.east:
				return 'peasant-ne'; break;
			case Direction.south_east:
				return 'peasant-se'; break;
			case Direction.west:
				return 'peasant-se'; break;
			case Direction.south_west:
				return 'peasant-se'; break;
		}
	}
	

	yield_moves_per_turn = () => ( 8 )
	yield_creature_image = () => ( 'peasant-se' )
	yield_prettyprint_name = () => ( 'Peasant' )

}

class CT_Skeleton extends Creature_Base_Type {

	yield_moves_per_turn = () => ( 8 )
	yield_creature_image = () => ( 'skeleton' )
	yield_prettyprint_name = () => ( 'Skeleton' )

}
