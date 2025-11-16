import localforage from "localforage";
import { Asset_Manager_Data } from "./Asset_Manager/Asset_Manager";

export type Preferences_Data = {
	start_in_fullscreen: boolean,
	show_unit_hitboxes: boolean,
}

export const Preferences_Init: Preferences_Data = {
	start_in_fullscreen: true,
	show_unit_hitboxes: false,
}


export const Preference_Manager_ƒ = {

	/*----------------------- file writing -----------------------*/
	load_preferences: (
		_AM: Asset_Manager_Data,
	): void => {
		let prefs_data = Preferences_Init;

		localforage.getItem<Preferences_Data>('preferences').then((value) => {
			if(value != null){
				prefs_data = value;
			}

			_AM.preferences = prefs_data;
		}).catch((value) => {
			throw("couldn't load level")
		});
	},

	save_individual_preference: (
		_AM: Asset_Manager_Data,
		setting_name: string,
		setting_value: boolean
	): void => {
		const prior_prefs_data = _AM.preferences;

		const prefs_data: Preferences_Data = {
			...prior_prefs_data,
			[setting_name]: setting_value,
		}

		localforage.setItem('preferences', prefs_data);
		_AM.preferences = prefs_data;
	},

	save_all_preferences: (
		_AM: Asset_Manager_Data,
		new_prefs_data: Preferences_Data,
	): void => {

		localforage.setItem('preferences', new_prefs_data);
		_AM.preferences = new_prefs_data;
	},	
}
