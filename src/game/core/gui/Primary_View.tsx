import React, { ErrorInfo, PropsWithChildren, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import _, { cloneDeep, isEmpty } from "lodash";

import { Canvas_View } from "./Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ, New_Asset_Manager } from "../engine/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, New_Blit_Manager } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { New_Tilemap_Manager, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager";
import { Game_View } from "./Game_View";
import { Editor_View } from "./Editor_View";
import { Point2D, Rectangle } from '../../interfaces';

import 'rsuite/dist/rsuite.min.css';
import { CustomProvider } from 'rsuite';
import "./Primary_View.scss";
import { Game_Manager_Data, New_Game_Manager } from "../engine/Game_Manager";

interface Props {
}

interface State {
	assets_loaded: boolean,
	is_edit_mode: boolean,
}


let _Blit_Manager: Blit_Manager_Data|null = ( null );
const set_Blit_Manager = (newVal: Blit_Manager_Data) => { _Blit_Manager = newVal;   }
const get_Blit_Manager = () => (_Blit_Manager as Blit_Manager_Data);

let _Tilemap_Manager: Tilemap_Manager_Data|null = ( null );
const set_Tilemap_Manager = (newVal: Tilemap_Manager_Data) => { _Tilemap_Manager = newVal;   }
const get_Tilemap_Manager = () => (_Tilemap_Manager as Tilemap_Manager_Data);

let _Game_Manager_Data: Game_Manager_Data|null = ( null );
const get_Game_Manager_Data = () => (_Game_Manager_Data as Game_Manager_Data);
const set_Game_Manager_Data = (newVal: Game_Manager_Data) => { _Game_Manager_Data = cloneDeep(newVal);}






export const Primary_View = () => {
	const _Asset_Manager: Asset_Manager_Data = New_Asset_Manager();
	const default_canvas_size: Point2D = {x: 567, y: 325};

	//const [_Blit_Manager, set_Blit_Manager] = useState<Blit_Manager_Data|null>(null);


	//const [_Tilemap_Manager, set_Tilemap_Manager] = useState<Tilemap_Manager_Data|null>(null);
	const [is_edit_mode, set_is_edit_mode] = useState<boolean>(true);
	const [assets_loaded, set_assets_loaded] = useState<boolean>(false);
	const [loaded_fraction, set_loaded_fraction] = useState<number>(0);
	const [context_connected, set_context_connected] = useState<boolean>(false);


	//let _Game_Manager_Data: Game_Manager_Data | undefined = undefined;
	const [game_manager_loaded, set_game_manager_loaded] = useState<boolean>(false);


	useEffect(() => {
		console.log('PRIMARY LAUNCH')
		Asset_Manager_ƒ.launch_app(
			_Asset_Manager,
			() => { set_assets_loaded(true); },
			set_loaded_fraction,
		);

			//might be a race condition on this one, we'll see.
		set_Tilemap_Manager(
			Tilemap_Manager_ƒ.initialize_tiles(New_Tilemap_Manager(), _Asset_Manager)
		);		



		return () => {
			console.log('PRIMARY CLEANUP')
		};		
	}, []);
	useEffect(() => {
		console.log('considering loading game manager');

		if(_Tilemap_Manager){
			console.log('loading game manager');

			set_Game_Manager_Data(New_Game_Manager({
				_Blit_Manager: () => _Blit_Manager as Blit_Manager_Data,
				_Asset_Manager: () => _Asset_Manager,
				_Tilemap_Manager: () => _Tilemap_Manager as Tilemap_Manager_Data,
				get_GM_instance: get_Game_Manager_Data,
			}));

			set_game_manager_loaded(true);
		}

	}, [_Tilemap_Manager]);


	const connect_context_to_blit_manager = (ctx: CanvasRenderingContext2D) => {
		console.log('connect_context_to_blit_manager')
		set_Blit_Manager(New_Blit_Manager(ctx, default_canvas_size, true));
		set_context_connected(true)
	}
		



	return (
		<CustomProvider theme="dark">
			<div
				className="master_node"
			>
				{
					<>
						<>{
							assets_loaded
							?
							<div
								className="master_flex_wrapper"
							>
								{
									is_edit_mode
									?
									<Editor_View
										is_edit_mode={is_edit_mode}
										set_is_edit_mode={set_is_edit_mode}
										assets_loaded={assets_loaded}
										context_connected={context_connected}
										dimensions={default_canvas_size}
										_Asset_Manager={() => (_Asset_Manager)}
										_Blit_Manager={get_Blit_Manager}
										set_Blit_Manager={set_Blit_Manager}
										_Tilemap_Manager={get_Tilemap_Manager}
										set_Tilemap_Manager={set_Tilemap_Manager}
										connect_context_to_blit_manager={connect_context_to_blit_manager}
									/>
									:
									<Game_View
										is_edit_mode={is_edit_mode}
										set_is_edit_mode={set_is_edit_mode}
										assets_loaded={assets_loaded}
										context_connected={context_connected}
										dimensions={default_canvas_size}
										_Asset_Manager={() => (_Asset_Manager)}
										_Blit_Manager={get_Blit_Manager}
										set_Blit_Manager={set_Blit_Manager}
										_Tilemap_Manager={get_Tilemap_Manager}
										set_Tilemap_Manager={set_Tilemap_Manager}
										get_Game_Manager_Data={get_Game_Manager_Data}
										set_Game_Manager_Data={set_Game_Manager_Data}
										game_manager_loaded={game_manager_loaded}
									
										connect_context_to_blit_manager={connect_context_to_blit_manager}
									/>
								}
								<div className="instructional_text">
									{
										is_edit_mode
										?
										<>Press <strong>Arrow Keys</strong> to scroll the map.<br/>
										Select tiles from the sidebar to place them on the map.</>
										:
										<>Press <strong>Arrow Keys</strong> to scroll the map.<br/>
										Select units by clicking on them.<br/>Select a destination for those units by clicking on the destination tile, or click back on the original tile to cancel a move.<br/>
										Once all units have orders, click <strong>Next Turn</strong>.</>
									}
								</div>
							</div>
							:
							<div
								className="master_flex_wrapper"
							>
								<div className="loading_screen">
									<div className="toolbar" />
									<div className="loading_node">
										<div className="canvas_holder">
											<div className="loading_screen">
												<div>{`Loading...  ${Math.round(loaded_fraction * 100)}%`}</div>
												<div className="loading_bar">
													<div className="loading_bar_fill" style={{width: `${Math.min(Math.round(loaded_fraction * 100), 100)}%`}} />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						}</>
					</>
				}
			</div>
		</CustomProvider>
	);
}
