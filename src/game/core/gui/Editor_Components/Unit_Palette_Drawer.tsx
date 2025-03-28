import { Dispatch, SetStateAction } from "react";
import { Direction, Directions } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Creature_Type_Name, Creature_ƒ } from "../../../objects_core/Creature/Creature";
import { Asset_Manager_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Drawer, Dropdown, Slider } from "rsuite";
import { indexOf, map } from "ramda";
import { Tile_Palette_Element } from "../Tile_Palette_Element";
import { zorder } from "../../constants/zorder";

export const Unit_Palette_Drawer = (props: {
	show_unit_palette_drawer: boolean,
	set_show_unit_palette_drawer: Dispatch<SetStateAction<boolean>>,
	selected_creature_type: Creature_Type_Name,
	set_selected_creature_type: Dispatch<SetStateAction<Creature_Type_Name>>,
	selected_creature_direction: Direction,
	set_selected_creature_direction: Dispatch<SetStateAction<Direction>>,
	selected_creature_team: number,
	set_selected_creature_team: Dispatch<SetStateAction<number>>,
	_Asset_Manager: () => Asset_Manager_Data,
}) => {


	const set_direction = (input: number) => {
		props.set_selected_creature_direction( Directions[input]);
	}



	const creature_list: Array<Creature_Type_Name> = Creature_ƒ.list_all_creature_types();

	return <Drawer
		open={props.show_unit_palette_drawer}
		onClose={() => props.set_show_unit_palette_drawer(false)}
		size={'25rem'}
		className="Unit_Palette_Drawer"
	>
		<Drawer.Header>
			<Drawer.Title>Units</Drawer.Title>
			<Drawer.Actions>

			</Drawer.Actions>
		</Drawer.Header>
		<Drawer.Body>
			<div className="team-selection">
				<Dropdown title={`Team #${props.selected_creature_team}`}>
					{
						map( (team_number)=>(
							<Dropdown.Item
								key={team_number}
								onSelect={ (eventKey: string, evt)=>{
									props.set_selected_creature_team(team_number)
								} }
								active={props.selected_creature_team == team_number}
							>Team #{team_number}</Dropdown.Item>
						),
						[1,2,3])
					}
				</Dropdown>
			</div>
			<div className="team-selection">
				<Slider
					min={0}
					max={Directions.length - 1}
					value={indexOf(props.selected_creature_direction, Directions)}
					className="team-slider"
					handleStyle={{
					borderRadius: 10,
					color: '#fff',
					fontSize: 12,
					width: 32,
					height: 22
					}}
					graduated
					tooltip={false}
					handleTitle={props.selected_creature_direction}
					onChange={set_direction}
				/>
			</div>
			<div className="unit-palette">
				{
					map( (creature_type)=>(
						<div
							className={`creature_instance ${creature_type == props.selected_creature_type ? 'selected' : ''}`}
							key={`${Creature_ƒ.get_delegate(creature_type).yield_creature_image()}`}
							onClick={(evt)=>{
								props.set_selected_creature_type(creature_type)
							}}
						>
							<Tile_Palette_Element
								asset_manager={props._Asset_Manager()}
								tile_name={''}
								asset_list={[{
									id: `${Creature_ƒ.get_delegate(creature_type).yield_creature_image()}`,
									zorder: zorder.rocks,
								}]}
								use_black_background={true}
								highlight={false}
								handle_click={ ()=>{} }
								canvas_size={ {x: 70, y: 70} }
								centering_offset={ {x: 0, y: -0.8} }
							/>
						</div>
					),
					creature_list)
				}
			</div>
		</Drawer.Body>
	</Drawer>
}

