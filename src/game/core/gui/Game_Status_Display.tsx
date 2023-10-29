import React from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, findIndex, includes, isEmpty, isNil, isNumber, last, map, reduce, size, uniq } from "lodash";

import { ƒ } from "../engine/Utils";

import { Canvas_View, MouseButtonState } from "./Canvas_View";
import { Asset_Manager_Data } from "../engine/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager";

import { Creature_ƒ, New_Creature, Creature_Data, PathNodeWithDirection, ChangeInstance } from "../../objects_core/Creature";

import "./Primary_View.scss";
import "./Game_Status_Display.scss";

import { Point2D, Rectangle } from '../../interfaces';
import { Custom_Object_Data, Custom_Object_ƒ } from "../../objects_core/Custom_Object";

import Foot_Icon from '../../../assets/feet-icon.png';
import { GameStateInit, Game_Manager_Data, Game_Manager_ƒ, Game_State, New_Game_Manager } from "../engine/Game_Manager";





export type TooltipData = {
	pos: Point2D,
	tile_name: string,
	tile_cost: string,
};




interface Game_Status_Display_Props {
	get_Game_Manager_Data: () => Game_Manager_Data,
	set_Game_Manager_Data: (newVal: Game_Manager_Data) => void;
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}


export const Game_Status_Display = (props: Game_Status_Display_Props) => {

	const _GS = props.get_Game_Manager_Data()?.game_state;




	const get_selected_creature = (_GS: Game_State): Creature_Data|undefined => {

		if( _GS?.selected_object_index != undefined ){
			return _GS.turn_list[_GS.current_turn].creature_list[_GS.selected_object_index]
		} else {
			return undefined;
		}
	}

	const selected_creature = get_selected_creature(_GS);

	return (
		<>{
			_GS
			&&
			<div
				className="game_status_display"
			>
				<button
					onClick={(evt)=>{
						const newData = Game_Manager_ƒ.advance_turn_start(props.get_Game_Manager_Data(), props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager());


						props.set_Game_Manager_Data(
							newData.gm
						)

						props.set_Tilemap_Manager(
							newData.tm
						)
					}}
				>
					Next Turn
				</button>
				<Label_and_Data_Pair
					label={'Turn #:'}
					data={`${_GS.current_turn}`}
				/>
				<Label_and_Data_Pair
					label={'Objectives:'}
					data={``}
				/>
				<Label_and_Data_Pair
					label={''}
					data={`${_GS.objective_text}`}
				/>
				<br />
				<hr />
				<br />
				<>
				{
					(selected_creature !== undefined ?
						<Label_and_Data_Pair
							label={'Selected Unit:'}
							data={`${Creature_ƒ.get_delegate(selected_creature.type_name).yield_prettyprint_name()}`}
						/> :
						<Label_and_Data_Pair
							label={''}
							data={`No Unit Selected.`}
						/>
					)
				}
				</>
				<>
				{
					(selected_creature !== undefined)
					&&
					<>
						<Label_and_Data_Pair
							label={'Team:'}
							data={`${selected_creature.team}`}
						/>

						<Tile_Palette_Element
							asset_manager={props._Asset_Manager()}
							tile_name={''}
							asset_name={`${Creature_ƒ.get_delegate(selected_creature.type_name).yield_creature_image()}`}
							highlight={false}
							handle_click={ ()=>{} }
						/>
						<Label_and_Data_Pair
							label={'Hitpoints:'}
							data={`${selected_creature.current_hitpoints} / ${Creature_ƒ.get_delegate(selected_creature.type_name).yield_max_hitpoints()}`}
						/>
						<Label_and_Data_Pair
							label={'Moves:'}
							data={`${Creature_ƒ.get_delegate(selected_creature.type_name).yield_moves_per_turn()}`}
						/>
						<Label_and_Data_Pair
							label={'Damage:'}
							data={`${Creature_ƒ.get_delegate(selected_creature.type_name).yield_damage()}`}
						/>
					</>
				}
				</>

			</div>
		}</>
	)
}


const Label_and_Data_Pair = (props: {label: string, data: string}) => (
		<div className="label_and_data_pair">
			<div className="label">{props.label}</div>
			<div className="data">{props.data}</div>
		</div>
	)

