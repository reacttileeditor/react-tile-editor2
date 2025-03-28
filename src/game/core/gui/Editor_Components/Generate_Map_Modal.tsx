import { Dispatch, SetStateAction, useState } from "react";
import { Asset_Manager_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Tilemap_Manager_Data } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Button, Modal, RadioTile, RadioTileGroup } from "rsuite";
import { Icon } from "@rsuite/icons";
import { GiPerspectiveDiceSixFacesOne, GiSpatter } from "react-icons/gi";
import { Map_Generation_ƒ } from "../../engine/Map_Generation";


type Editor_Map_Generation_Types = 'true_random' | 'blob_regions';



export const Generate_Map_Modal = (props: {
	show_generate_map_dialog: boolean,
	set_show_generate_map_dialog: Dispatch<SetStateAction<boolean>>,
	_Asset_Manager: () => Asset_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}) => {
	const [generation_type, set_generation_type] = useState<Editor_Map_Generation_Types>('blob_regions');
	const [deletion_target, set_deletion_target] = useState<string>('');

	return <Modal
		open={props.show_generate_map_dialog}
		onClose={()=>props.set_show_generate_map_dialog(false)}
		className="Generate_Map_Modal"
	>
		<h3>Generate Map</h3>
		<div className="label"><p>This will replace all of the tile data for the current map with a new, randomly generated set of tiles.  The map bounds are whatever your current map is set to.</p> <p>There are multiple options for generation:</p></div>
	
		<RadioTileGroup
			defaultValue="blob_regions"
			value={generation_type}
			onChange={(value: string|number, event)=>{set_generation_type(value as unknown as Editor_Map_Generation_Types) }}
		>
			<RadioTile icon={<Icon as={GiPerspectiveDiceSixFacesOne} />} label="True Random" value="true_random">
				Generates a map by randomly filling each map tile with one of the possible known tile types.  The simplest and first thing we coded.
			</RadioTile>
			<RadioTile icon={<Icon as={GiSpatter} />} label="Blob Regions" value="blob_regions">
				Generates a bunch of contiguous geographic regions composed of a single tile type.
			</RadioTile>

		</RadioTileGroup>

		<div className="button-strip">
			<Button
				appearance="subtle"
				onClick={ () => { 
					props.set_show_generate_map_dialog(false)
				}}
			>Cancel</Button>
			<Button
				disabled={false}
				onClick={ () => {
					if(generation_type == 'true_random'){
						props.set_Tilemap_Manager(
							Map_Generation_ƒ.initialize_tiles_random(props._Tilemap_Manager(), props._Asset_Manager())
						);
					} else {
						props.set_Tilemap_Manager(
							Map_Generation_ƒ.initialize_tiles_blob(props._Tilemap_Manager(), props._Asset_Manager())
						);
					}
					props.set_show_generate_map_dialog(false);
				}}
			>Generate</Button>
		</div>
	</Modal>
}
