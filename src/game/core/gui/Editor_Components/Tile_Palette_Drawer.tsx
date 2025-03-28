import { Dispatch, SetStateAction } from "react";
import { Tile_Name } from "../../data/Tile_Types";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../../engine/Asset_Manager/Asset_Manager";
import { Drawer } from "rsuite";
import { map } from "ramda";
import { Tile_Palette_Element } from "../Tile_Palette_Element";



export const Tile_Palette_Drawer = (props: {
	show_tile_palette_drawer: boolean,
	set_show_tile_palette_drawer: Dispatch<SetStateAction<boolean>>,
	selected_tile_type: Tile_Name,
	set_selected_tile_type: Dispatch<SetStateAction<Tile_Name>>,
	_Asset_Manager: () => Asset_Manager_Data,
}) => {



	const tile_type_list: Array<Tile_Name> = Asset_Manager_ƒ.yield_tile_name_list(props._Asset_Manager());

	return <Drawer
		open={props.show_tile_palette_drawer}
		onClose={() => props.set_show_tile_palette_drawer(false)}
		size={'25rem'}
		className="Unit_Palette_Drawer"
	>
		<Drawer.Header>
			<Drawer.Title>Tiles</Drawer.Title>
			<Drawer.Actions>

			</Drawer.Actions>
		</Drawer.Header>
		<Drawer.Body>
			<div className="unit-palette">
				{
					map( (tile_type)=>(
						<div
							className={`creature_instance ${tile_type == props.selected_tile_type ? 'selected' : ''}`}
							key={`${tile_type}`}
							onClick={(evt)=>{
								props.set_selected_tile_type(tile_type)
							}}
						>
							<Tile_Palette_Element
								asset_manager={props._Asset_Manager()}
								tile_name={tile_type}
								asset_list={[]}
								use_black_background={true}
								highlight={false}
								handle_click={ ()=>{} }
								canvas_size={ {x: 70, y: 70} }
							/>
						</div>
					),
					tile_type_list)
				}
			</div>
		</Drawer.Body>
	</Drawer>
}