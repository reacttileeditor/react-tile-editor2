import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import _, { isEmpty } from "lodash";

import { Canvas_View } from "./Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ, New_Asset_Manager } from "../engine/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, New_Blit_Manager } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { New_Tilemap_Manager, Tilemap_Manager_Data } from "../engine/Tilemap_Manager";
import { Game_View } from "./Game_View";
import { Editor_View } from "./Editor_View";
import { Point2D, Rectangle } from '../../interfaces';

import "./Primary_View.scss";

interface Props {
}

interface State {
	assets_loaded: boolean,
	is_edit_mode: boolean,
}




export const Primary_View = () => {
	const _Asset_Manager: Asset_Manager_Data = New_Asset_Manager();
	let _Blit_Manager!: Blit_Manager_Data;
	let _Tilemap_Manager!: Tilemap_Manager_Data;
	const default_canvas_size: Point2D = {x: 567, y: 325};

	const [is_edit_mode, set_is_edit_mode] = useState<boolean>(true);
	const [assets_loaded, set_assets_loaded] = useState<boolean>(false);




	useEffect(() => {
		console.log('PRIMARY LAUNCH')
		Asset_Manager_ƒ.launch_app(
			_Asset_Manager,
			() => { set_assets_loaded(true); }
		);
		
	}, []);

	useEffect(() => {

		return () => {
			console.log('PRIMARY CLEANUP')

		};
	}, []);


	const initialize_tilemap_manager = (ctx: CanvasRenderingContext2D) => {
		if( !_Tilemap_Manager ){
			_Blit_Manager = New_Blit_Manager(ctx, default_canvas_size, true);
			_Tilemap_Manager = New_Tilemap_Manager({_AM: _Asset_Manager, _BM: _Blit_Manager});
		} else {
			Blit_Manager_ƒ.reset_context(_Blit_Manager, ctx);
		}
	}





	return (
		<div
			className="master_node"
		>
			{
				// assets_loaded
				// &&
				// !isEmpty(_Asset_Manager)
				// &&
				// !isEmpty(_Blit_Manager)
				// &&
				// !isEmpty(_Tilemap_Manager)
				// &&
				<>
					<button
						onClick={ () => { set_is_edit_mode( !is_edit_mode ); } }
					>
						{is_edit_mode ? 'Toggle to Game' : 'Toggle to Editor'}
					</button>
					<div
						className="master_flex_wrapper"
					>
						{
							is_edit_mode
							?
							<Editor_View
								assets_loaded={assets_loaded}
								dimensions={default_canvas_size}
								_Asset_Manager={_Asset_Manager}
								_Blit_Manager={_Blit_Manager}
								_Tilemap_Manager={_Tilemap_Manager}
								initialize_tilemap_manager={initialize_tilemap_manager}
							/>
							:
							<Game_View
								assets_loaded={assets_loaded}
								dimensions={default_canvas_size}
								_Asset_Manager={_Asset_Manager}
								_Blit_Manager={_Blit_Manager}
								_Tilemap_Manager={_Tilemap_Manager}
								initialize_tilemap_manager={initialize_tilemap_manager}
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
				</>
			}
		</div>
	);
}
