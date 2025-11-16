import { Dispatch, SetStateAction, useState } from "react";
import { Asset_Manager_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Button, Checkbox, CheckboxGroup, Input, List, Modal, Tooltip, Whisper } from "rsuite";
import { filter, isBoolean, map, pickBy, keys } from "lodash";
import { Icon, Trash } from "@rsuite/icons";
import { BsFileEarmark, BsFileEarmarkLock2 } from "react-icons/bs";
import { includes } from "ramda";
import localforage from "localforage";
import { Preference_Manager_ƒ, Preferences_Data } from "../../engine/Preference_Manager";




export const Preferences_Modal = (props: {
	show_preferences_dialog: boolean,
	set_show_preferences_dialog: Dispatch<SetStateAction<boolean>>,
	_Asset_Manager: () => Asset_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}) => {
	
	const possible_items =  pickBy(props._Asset_Manager().preferences, (item) => (isBoolean(item)));
	const possible_item_names = keys(possible_items);

	const selected_items = pickBy(possible_items, (val)=> val == true);
	const selected_item_names = keys(selected_items);

	return <Modal
		open={props.show_preferences_dialog}
		onClose={()=>props.set_show_preferences_dialog(false)}
		className="Preferences_Modal"
	>
		<h3>Preferences</h3>
		<div className="label">(Settings will be immediately changed on-click, and are saved in "local storage" - in your browser, not in the cloud.):</div>
		<div className="label">{`\u00A0`}</div>
		<div className="label">{JSON.stringify( props._Asset_Manager().preferences )}</div>

		<CheckboxGroup
			name="checkbox-group"
			value={selected_item_names}
			onChange={new_true_value_names => {
				let new_prefs_object: { [keyOf: string]: boolean } = {};
				map( props._Asset_Manager().preferences, (val,idx)=>{
					new_prefs_object[idx] = includes(idx, new_true_value_names)
				});

				Preference_Manager_ƒ.save_all_preferences(
					props._Asset_Manager(),
					new_prefs_object as Preferences_Data,
				);
			}}			
		>
			{
				map(
					possible_item_names,
					(preference_name)=>(
						<Checkbox
							value={preference_name}
							
						>{preference_name}</Checkbox>
					)
				)
			}
		</CheckboxGroup>


		<div className="button-strip">
			<Button
				onClick={ () => { 
					props.set_show_preferences_dialog(false)
				}}
			>Close</Button>
		</div>
	</Modal>
}
