import { Dispatch, SetStateAction, useState } from "react";
import { Asset_Manager_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Button, Checkbox, CheckboxGroup, Input, List, Modal, Tooltip, Whisper } from "rsuite";
import { map } from "lodash";
import { Icon, Trash } from "@rsuite/icons";
import { BsFileEarmark, BsFileEarmarkLock2 } from "react-icons/bs";
import { includes } from "ramda";
import localforage from "localforage";

type Preferences_Data = {
	start_in_titlescreen: boolean,
	show_unit_hitboxes: boolean,
}

const Preferences_Init: Preferences_Data = {
	start_in_titlescreen: true,
	show_unit_hitboxes: false,
}


export const Preferences_ƒ = {

/*----------------------- file writing -----------------------*/
load_settings: (
): void => {
	let prefs_data = Preferences_Init;

	localforage.getItem<Preferences_Data>('preferences').then((value) => {
		if(value != null){
			prefs_data = value;
		}

		//SET SINGLETON VALUE IN CALLBACK, HERE
	}).catch((value) => {
		throw("couldn't load level")
	});
},

save_setting: (
	prior_prefs_data: Preferences_Data,
	setting_name: string,
	setting_value: boolean
): void => {

		const prefs_data: Preferences_Data = {
			...prior_prefs_data,
			[setting_name]: setting_value,
		}

		localforage.setItem('preferences', prefs_data);
		//SET SINGLETON VALUE IN CALLBACK, HERE
	},
}



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

		<CheckboxGroup name="checkbox-group">
			<Checkbox value="A">Start in Fullscreen</Checkbox>
			<Checkbox value="B">Show Unit Hitboxes</Checkbox>
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
