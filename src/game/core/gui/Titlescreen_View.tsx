import { Button } from "rsuite";
import "./Primary_View.scss";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { App_Modes } from "./Primary_View";
import Foot_Icon from '../../assets/logo.png';
import { Preference_Manager_ƒ } from "../engine/Preference_Manager";
import { Asset_Manager_Data } from "../engine/Asset_Manager/Asset_Manager";

interface Props {
	set_app_mode: Dispatch<SetStateAction<App_Modes>>,
	set_fullscreen: (status: boolean) => void,
	_AM: Asset_Manager_Data,
}


export const Titlescreen_View = (props: Props) => {

	const [current_prefs, set_current_prefs] = useState<{ [keyOf: string]: boolean }>({});


	useEffect(() => {
		Preference_Manager_ƒ.load_preferences(
			props._AM,
			(new_AM: Asset_Manager_Data) => {
				set_current_prefs(new_AM.preferences)	
			}
		);
	}, []);


	return (
		<div className="width_wrapper">
			<div className="title_screen">
				<div className="title_screen_node">
					<div className="canvas_holder">
						<div className="title_screen_internal">
							<img className="logo" src={Foot_Icon}/>
							<h1>{'\u291F '}<span>W</span>iergild {' \u2920'}</h1>
							<Button
								onClick={ () => { 
									props.set_app_mode('game');
									if(current_prefs.start_in_fullscreen){
										props.set_fullscreen(true);
									}
								} }
							>
								{'Start Game...'}
							</Button>
							<div className="description">
								<p><strong>Note:</strong> This is a tactical strategy game, but with a <em>major</em> twist; units don't move when you click on them, they're just given a plan that will only happen when you click "Next Turn" - and then they all move at once.</p>

								<p><strong>Known Bugs:</strong> </p>
								<p>The Forced Move/Attack Move buttons are glitchy and you might have to click on them repeatedly to make them work.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
