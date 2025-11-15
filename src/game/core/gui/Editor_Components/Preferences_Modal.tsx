import { Dispatch, SetStateAction, useState } from "react";
import { Asset_Manager_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Button, Checkbox, CheckboxGroup, Input, List, Modal, Tooltip, Whisper } from "rsuite";
import { map } from "lodash";
import { Icon, Trash } from "@rsuite/icons";
import { BsFileEarmark, BsFileEarmarkLock2 } from "react-icons/bs";
import { includes } from "ramda";
import localforage from "localforage";
import { Preference_Manager_ƒ } from "../../engine/Preference_Manager";




export const Preferences_Modal = (props: {
	show_preferences_dialog: boolean,
	set_show_preferences_dialog: Dispatch<SetStateAction<boolean>>,
	_Asset_Manager: () => Asset_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}) => {
	const [selected_file, set_selected_file] = useState<string>('');
	const [deletion_target, set_deletion_target] = useState<string>('');


	return <Modal
		open={props.show_preferences_dialog}
		onClose={()=>props.set_show_preferences_dialog(false)}
		className="Preferences_Modal"
	>
		<h3>Preferences</h3>
		<div className="label">(Settings will be immediately changed on-click, and are saved in "local storage" - in your browser, not in the cloud.):</div>
		<div className="label">{`\u00A0`}</div>
		<div className="label">{JSON.stringify( props._Asset_Manager().preferences )}</div>

		<CheckboxGroup name="checkbox-group">
			<Checkbox
				value="start_in_fullscreen"
				checked={props._Asset_Manager().preferences.start_in_fullscreen}
				defaultChecked={props._Asset_Manager().preferences.start_in_fullscreen}
				onChange={	(value, checked: boolean) => {

						Preference_Manager_ƒ.save_individual_preference(
							props._Asset_Manager(),
							'start_in_fullscreen',
							checked
						)
					}
				}
			>Start in Fullscreen</Checkbox>
			<Checkbox
				value="show_unit_hitboxes"
				checked={props._Asset_Manager().preferences.show_unit_hitboxes}
				defaultChecked={props._Asset_Manager().preferences.show_unit_hitboxes}
				onChange={	(value, checked: boolean) => {

						Preference_Manager_ƒ.save_individual_preference(
							props._Asset_Manager(),
							'show_unit_hitboxes',
							checked
						)
					}
				}
			>Show Unit Hitboxes</Checkbox>
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
