import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Asset_Manager_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ, Tilemap_Metadata } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Button, Input, Modal } from "rsuite";
import { toNumber } from "lodash";

export const Edit_Metadata_Modal = (props: {
	show_metadata_dialog: boolean,
	set_show_metadata_dialog: Dispatch<SetStateAction<boolean>>,
	level_metadata: Tilemap_Metadata,
	_Asset_Manager: () => Asset_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}) => {
	const [origin_x, set_origin_x] = useState<number>(0);
	const [origin_y, set_origin_y] = useState<number>(0);

	const [grow_x, set_grow_x] = useState<number>(0);
	const [grow_x2, set_grow_x2] = useState<number>(0);
	const [grow_y, set_grow_y] = useState<number>(0);
	const [grow_y2, set_grow_y2] = useState<number>(0);


	useEffect(() => {
		reset_values();
	}, [props.level_metadata]);

	const reset_values = () => {
		set_origin_x(props.level_metadata.origin.x);
		set_origin_y(props.level_metadata.origin.y);
		set_grow_x(0);
		set_grow_x2(0);
		set_grow_y(0);
		set_grow_y2(0);
	}


	return <Modal
		open={props.show_metadata_dialog}
		onClose={()=>{
			reset_values();
			props.set_show_metadata_dialog(false);
		}}
		className="Save_File_Modal"
		//@ts-ignore
		onKeyDown={(evt)=>{
			evt.stopPropagation();
		}}
	>
		<h3>Edit Metadata</h3>
		<div className="label">This allows you to grow/shrink the map along the x/y axes.  Positive values add rows or columns, negative values remove them.</div>
		<div className="input-grid-sizes">
			<div className="spacer"/>
			<div className="input-pair">
				<Input
					value={grow_y}
					type="number"
					onChange={(value: string, event) => { set_grow_y(toNumber(value)) }}		
				/>
			</div>
			<div className="spacer"/>

			<div className="input-pair">
				<Input
					value={grow_x}
					type="number"
					onChange={(value: string, event) => { set_grow_x(toNumber(value)) }}		
				/>
			</div>
			<div className="image"/>
			<div className="input-pair">
				<Input
					value={grow_x2}
					type="number"
					onChange={(value: string, event) => { set_grow_x2(toNumber(value)) }}		
				/>
			</div>

			<div className="spacer"/>
			<div className="input-pair">
				<Input
					value={grow_y2}
					type="number"
					onChange={(value: string, event) => { set_grow_y2(toNumber(value)) }}		
				/>
			</div>
			<div className="spacer"/>
		</div>
		<div className="label">Origin was added to potentially allow "auto-adjusting" map script locations in the future, if rows are added/removed from the top or left side of the map.  We're leaving the bindings here since we may want to use it later.</div>
		<div className="input-strip">
			<div className="input-pair">
				<div className="label">Origin X:</div>
				<Input
					value={origin_x}
					type="number"
					disabled
					onChange={(value: string, event) => { set_origin_x(toNumber(value)) }}		
				/>
			</div>
			<div className="input-pair">
				<div className="label">Origin Y:</div>
				<Input
					value={origin_y}
					type="number"
					disabled
					onChange={(value: string, event) => { set_origin_y(toNumber(value)) }}		
				/>
			</div>
		</div>

		<div className="button-strip">
			<Button
				appearance="subtle"
				onClick={ () => { 
					reset_values();
					props.set_show_metadata_dialog(false);
				}}
			>Cancel</Button>
			<Button
				disabled={false}
				onClick={ () => { 
					props.set_Tilemap_Manager({
						...props._Tilemap_Manager(),
						metadata: Tilemap_Manager_ƒ.set_metadata(props._Tilemap_Manager(), {
							origin: {
								x: origin_x,
								y: origin_y,
							}
						}).metadata,
						tile_maps: Tilemap_Manager_ƒ.expand_tile_map(props._Tilemap_Manager(), {
							grow_x: grow_x,
							grow_x2: grow_x2,
							grow_y: grow_y,
							grow_y2: grow_y2,
						}).tile_maps
					});
					props.set_show_metadata_dialog(false)
				}}
			>Save</Button>
		</div>
	</Modal>
}
