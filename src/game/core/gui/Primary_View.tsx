import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

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


export class Primary_View extends React.Component <Props, State> {
	_Asset_Manager: Asset_Manager_Data;
	_Blit_Manager!: Blit_Manager_Data;
	_Tilemap_Manager!: Tilemap_Manager_Data;
	default_canvas_size: Point2D;

/*----------------------- initialization and asset loading -----------------------*/

	constructor( props: Props ) {
		super( props );
		
		this.state = {
			assets_loaded: false,
			is_edit_mode: true,
		};
		
		this._Asset_Manager = New_Asset_Manager();
		Asset_Manager_ƒ.launch_app(
			this._Asset_Manager,
			() => { this.setState({assets_loaded: true}); }
		);
		
		this.default_canvas_size = {x: 567, y: 325};
	}

	initialize_tilemap_manager = (ctx: CanvasRenderingContext2D) => {
		if( !this._Tilemap_Manager ){
			this._Blit_Manager = New_Blit_Manager(ctx, this.default_canvas_size, true);
			this._Tilemap_Manager = New_Tilemap_Manager({_AM: this._Asset_Manager, _BM: this._Blit_Manager});
		} else {
			Blit_Manager_ƒ.reset_context(this._Blit_Manager, ctx);
		}
	}

	render() {
		return (
		<div
			className="master_node"
		>
			<button
				onClick={ () => { this.setState({is_edit_mode: !this.state.is_edit_mode}); } }
			>
				{this.state.is_edit_mode ? 'Toggle to Game' : 'Toggle to Editor'}
			</button>
			<div
				className="master_flex_wrapper"
			>
				{
					this.state.is_edit_mode
					?
					<Editor_View
						assets_loaded={this.state.assets_loaded}
						dimensions={this.default_canvas_size}
						_Asset_Manager={this._Asset_Manager}
						_Blit_Manager={this._Blit_Manager}
						_Tilemap_Manager={this._Tilemap_Manager}
						initialize_tilemap_manager={this.initialize_tilemap_manager}
					/>
					:
					<Game_View
						assets_loaded={this.state.assets_loaded}
						dimensions={this.default_canvas_size}
						_Asset_Manager={this._Asset_Manager}
						_Blit_Manager={this._Blit_Manager}
						_Tilemap_Manager={this._Tilemap_Manager}
						initialize_tilemap_manager={this.initialize_tilemap_manager}
					/>
				}
				<div className="instructional_text">
					{
						this.state.is_edit_mode
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
		</div>
		);
	}

}
