import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { cloneDeep, concat, filter, findIndex, includes, isEmpty, isNil, isNumber, last, map, reduce, size, uniq } from "lodash";


import { Asset_Manager_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, ticks_to_ms } from "../../engine/Blit_Manager";
import { Tile_Palette_Element } from "../Tile_Palette_Element";
import { Direction, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";

import { Creature_ƒ, New_Creature, Creature_Data, Path_Node_With_Direction, Change_Instance } from "../../../objects_core/Creature/Creature";


import Foot_Icon from '../../../assets/feet-icon.png';
import { GameStateInit, Game_Manager_Data, Game_Manager_ƒ, Game_State, New_Game_Manager } from "../../engine/Game_Manager/Game_Manager";
import { Button } from "rsuite";
import { zorder } from "../../constants/zorder";


import "./Game_Status_Display.scss";
import { Image_And_Image_Sequence_Data_Names } from "../../data/Image_Data";





interface Game_Status_Display_Props {
	get_Game_Manager_Data: () => Game_Manager_Data,
	set_Game_Manager_Data: (newVal: Game_Manager_Data) => void;
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
	set_announcement_modal_hidden: Dispatch<SetStateAction<boolean>>,
	render_ticktock: boolean,
}



export const New_Turn_Controls = (props: Game_Status_Display_Props) => {
	const _GS = props.get_Game_Manager_Data()?.game_state;
	const _GM = props.get_Game_Manager_Data();

	return <div
		className="next_turn_control centered_text"
	>
		<Button
			disabled={ _GM.animation_state.is_animating_live_game }
			onClick={(evt)=>{
				props.set_announcement_modal_hidden(true);

				const newData = Game_Manager_ƒ.advance_turn_start(props.get_Game_Manager_Data(), props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager());

				props.set_Game_Manager_Data(
					newData.gm
				)

				props.set_Tilemap_Manager(
					newData.tm
				)
			}}
		>
			{`${_GM.animation_state.is_animating_live_game ? 'Playing…': 'Next Turn'}`}
		</Button>
		<div className="annotations">
			{`Turn: ${_GS.current_turn}`}
		</div>
	</div>
}

export const Game_Status_Display = (props: Game_Status_Display_Props) => {

	const _GS = props.get_Game_Manager_Data()?.game_state;
	const [asset_name, set_asset_name] = useState<Image_And_Image_Sequence_Data_Names>('grass1');





	const get_selected_creature = (_GS: Game_State): Creature_Data|undefined => {

		if( _GS?.selected_object_index != undefined ){
			return _GS.turn_list[_GS.current_turn].creature_list[_GS.selected_object_index]
		} else {
			return undefined;
		}
	}

	const selected_creature: Creature_Data|undefined = get_selected_creature(_GS);

	useEffect(() => {
		if(selected_creature){
			set_asset_name(Creature_ƒ.get_delegate(selected_creature.type_name).yield_creature_image())
		}
	}, [props.render_ticktock]);	

	return (
		<>{
			_GS
			&&
			<>
			<div
				className="game_status_display"
			>
				<div className="centered_text">
				{
					(selected_creature !== undefined ?
						<Label_and_Data_Pair
							label={'Selected Unit:'}
							data={`${Creature_ƒ.get_delegate(selected_creature.type_name).yield_prettyprint_name()}`}
						/> :
						<Label_and_Data_Pair
							label={'No Unit Selected.'}
							data={`\u00A0`}
						/>
					)
				}
				</div>
				<>{
					(selected_creature !== undefined)
					?
					<>
						<Tile_Palette_Element
							asset_manager={props._Asset_Manager()}
							tile_name={''}
							asset_list={
								size(asset_name) > 0
								?
								[{
									id: asset_name,
									zorder: zorder.rocks,
								},{
									id: 'pedestal',
									zorder: zorder.grass,
								}]
								:
								[{
									id: 'pedestal',
									zorder: zorder.grass,
								}]
							}
							use_black_background={false}
							highlight={false}
							handle_click={ ()=>{} }
							canvas_size={ {x: 100, y: 100} }
							centering_offset={ {x: 0, y: -0.6} }
						/>

						<Label_and_Data_Pair
							label={'Team:'}
							data={`${selected_creature.team}`}
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

					:
					<>
						<Tile_Palette_Element
							asset_manager={props._Asset_Manager()}
							tile_name={''}
							asset_list={[{
								id: 'pedestal',
								zorder: zorder.grass,
							}]}
							use_black_background={false}
							highlight={false}
							handle_click={ ()=>{} }
							canvas_size={ {x: 100, y: 100} }
							centering_offset={ {x: 0, y: -0.6} }
						/>
						<Label_and_Data_Pair
							label={'Team:'}
							data={`\u00A0`}
						/>

						<Label_and_Data_Pair
							label={'Hitpoints:'}
							data={`\u00A0`}
						/>
						<Label_and_Data_Pair
							label={'Moves:'}
							data={`\u00A0`}
						/>
						<Label_and_Data_Pair
							label={'Damage:'}
							data={`\u00A0`}
						/>
					</>
				}</>
			</div>
			</>
		}</>
	)
}


const Label_and_Data_Pair = (props: {label: string, data: string}) => (
		<div className="label_and_data_pair">
			<div className="label">{props.label}</div>
			<div className="data">{props.data}</div>
		</div>
	)

