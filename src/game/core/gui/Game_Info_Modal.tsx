import React, { Dispatch, SetStateAction } from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, findIndex, includes, isEmpty, isNil, isNumber, last, map, reduce, size, uniq } from "lodash";

import { ƒ } from "../engine/Utils";

import { Canvas_View, MouseButtonState } from "./Canvas_View";
import { Asset_Manager_Data } from "../engine/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager";

import "./Game_Info_Modal.scss";

import Foot_Icon from '../../../assets/feet-icon.png';
import { GameStateInit, Game_Manager_Data, Game_Manager_ƒ, Game_State, New_Game_Manager } from "../engine/Game_Manager";







interface Game_Status_Display_Props {
	get_Game_Manager_Data: () => Game_Manager_Data,
	set_Game_Manager_Data: (newVal: Game_Manager_Data) => void;
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}


export const Game_Info_Modal = (props: {
	get_Game_Manager_Data: () => Game_Manager_Data,
	announcement_modal_hidden: boolean,	
	set_announcement_modal_hidden: Dispatch<SetStateAction<boolean>>,
}) => {

	const _GS = props.get_Game_Manager_Data()?.game_state;
	const _GM = props.get_Game_Manager_Data();



	return <div className={`game-info-modal-anchor`}>
		<div className={`game-info-modal ${props.announcement_modal_hidden ? 'hidden':''}`}>
		{
			(()=>{
				if( _GS.current_turn == 0 ){
					return <div>{`Starting Game`}</div>
				} else {
					return <div>{`Starting Turn ${_GS.current_turn}`}</div>
				}
			})()
			
		}
		</div>
	</div>
}


