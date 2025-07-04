import Foot_Icon from '../../../assets/feet-icon.png';
import Distance_Icon from '../../../assets/distance-icon.png';
import Left_Click_Icon from '../../../assets/left-click-icon.png';
import Right_Click_Icon from '../../../assets/right-click-icon.png';
import { GameStateInit, Game_Manager_Data, Game_Manager_ƒ, Game_State, Game_and_Tilemap_Manager_Data, New_Game_Manager } from "../../engine/Game_Manager/Game_Manager";
import { equals } from "ramda";
import { Creature_Data, Path_Data } from '../../../objects_core/Creature/Creature';
import { Point2D } from '../../../interfaces';
import { Asset_Manager_Data } from '../../engine/Asset_Manager/Asset_Manager';
import { Blit_Manager_Data } from '../../engine/Blit_Manager';
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ } from '../../engine/Tilemap_Manager/Tilemap_Manager';
import { isEmpty, isNil, size } from 'lodash';




export type Game_Tooltip_Data = {
	pos: Point2D,
	selected_unit: Creature_Data | undefined,
	hovered_unit: Creature_Data | undefined,
	path_data: Path_Data | undefined, 
	tile_pos: Point2D,
	unit_pos?: Point2D,
	tile_name: string,
	tile_cost: string,
};

export const Game_Tooltip_Manager = (props: {
	get_Game_Manager_Data: () => Game_Manager_Data,
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	render_ticktock: boolean,
	announcement_modal_hidden: boolean,
}) => {

	return <div className={`map-tooltip-anchor`} style={{display: `${props.announcement_modal_hidden ? 'block' : 'none'}`}}>
		{
			props.get_Game_Manager_Data() != undefined
			&&
			<Map_Tooltip
				{...Game_Manager_ƒ.get_tooltip_data(props.get_Game_Manager_Data(), props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager())}
			/>
		}
	</div>
}




const Map_Tooltip = (props: Game_Tooltip_Data) => {
	let distance = !isNil(props.unit_pos) ? Tilemap_Manager_ƒ.get_tile_coord_distance_between(props.tile_pos, props.unit_pos) : 0;

	const get_left_click_text = (): string => {
		if(props.selected_unit !== undefined){
			if(props.hovered_unit ){
				if( equals(props.tile_pos, props.unit_pos) ){
					if( size(props.path_data?.path_this_turn) ){
						return 'Cancel Move'
					} else {
						return 'Deselect Unit'
					}
				} else {
					//tile_pos implicitly is the currently selected unit, so this is a different one.
					return 'Select Unit'
				}
			} else {
				return 'Move';
			}
		} else {
			if( props.hovered_unit !== undefined ){ //unit viable for selection
				return 'Select Unit'
			} else {
				return 'n/a'
			}
		}
	}
	const get_right_click_text = (): string => {
		if(props.selected_unit !== undefined){
			if( equals(props.tile_pos, props.unit_pos) ){
				return 'Deselect Unit';
			} else {
				if( size(props.path_data?.path_this_turn) ){
					return 'Cancel Move'
				} else {
					return 'Deselect Unit'
				}
			}
		} else {
			if( false ){ //unit viable for selection
				return 'Select'
			} else {
				return 'n/a'
			}
		}
	}
	return <div
		className="map-tooltip"
		style={{
			left: `${props.pos.x * 2}px`,
			top: `${props.pos.y * 2}px`
		}}
	>
		<div className={`data-row ${get_left_click_text() == 'n/a' ? 'disabled' : '' }`}><img src={Left_Click_Icon}/> {`${get_left_click_text()}`}</div>
		<div className={`data-row ${get_right_click_text() == 'n/a' ? 'disabled' : '' }`}><img src={Right_Click_Icon}/> {`${get_right_click_text()}`}</div>
		<hr />
		<div className="data-row">{`${props.tile_pos.x}, ${props.tile_pos.y}`}</div>
		<div className="data-row">{`${props.tile_name}`}</div>
		{
			!isEmpty(props.tile_cost) && !isNil(props.tile_cost)
			&&
			<div className="data-row"> {`${props.tile_cost}`}<img src={Foot_Icon}/></div>
		}
		{
			!isNil(props.unit_pos)
			&&
			<div className="data-row"> {`${distance}`}<img src={Distance_Icon}/></div>
		}

	</div>
}

