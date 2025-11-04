import { Button } from "rsuite";
import "./Primary_View.scss";
import { Dispatch, SetStateAction } from "react";
import { App_Modes } from "./Primary_View";

interface Props {
	set_app_mode: Dispatch<SetStateAction<App_Modes>>,
	set_fullscreen: (status: boolean) => void,
}


export const Titlescreen_View = (props: Props) => {
	return (
		<div className="width_wrapper">
			<div className="title_screen">
				<div className="title_screen_node">
					<div className="canvas_holder">
						<div className="title_screen_internal">
							<h1>Wiergild</h1>
							<Button
								onClick={ () => { 
									props.set_app_mode('game');
									props.set_fullscreen(true);
								} }
							>
								{'Start Game...'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
