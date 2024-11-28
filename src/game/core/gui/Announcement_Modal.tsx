import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { cloneDeep, concat, filter, findIndex, includes, isEmpty, isNil, isNumber, last, map, reduce, size, uniq } from "lodash";

import { ƒ } from "../engine/Utils";

import { Canvas_View, Mouse_Button_State } from "./Canvas_View";
import { Asset_Manager_Data } from "../engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager/Tilemap_Manager";

import "./Announcement_Modal.scss";

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


export const Announcement_Modal = (props: {
	get_Game_Manager_Data: () => Game_Manager_Data,
	announcement_modal_hidden: boolean,	
	set_announcement_modal_hidden: Dispatch<SetStateAction<boolean>>,
}) => {
	const [last_turn_number_shown, set_last_turn_number_shown] = useState<number>(-1);


	const _GS = props.get_Game_Manager_Data()?.game_state;
	const _GM = props.get_Game_Manager_Data();



	useEffect(() => {
		if( _GS.current_turn > last_turn_number_shown){
			set_last_turn_number_shown(_GS.current_turn);
			props.set_announcement_modal_hidden(false);
		}
	}, [_GS.current_turn]);


	return <div className={`game-info-modal-anchor`}>
		<div className={`game-info-modal ${props.announcement_modal_hidden ? 'hidden':''}`}>
			<div className="content">
			{
				(()=>{
					if( _GS.current_turn == 0 ){
						return <>
							<div>{`Starting Game`}</div>
							<>{
								map(_GS.objective_text.split('\n'), (val)=>(
									<div className='body'>{`${val}`}</div>
								) )
							}</>
						</>
					} else {
						return <div>{`Turn ${_GS.current_turn}`}</div>
					}
				})()
				
			}
			</div>
			<div className="left-bg" />
			<div className="right-bg" />
			<div className="core-bg" />
			<div className="shadow" />
		</div>
	</div>
}


