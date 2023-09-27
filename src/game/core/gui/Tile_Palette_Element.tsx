import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ } from "../engine/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, New_Blit_Manager } from "../engine/Blit_Manager";
import { New_Tilemap_Manager, Tilemap_Manager_Data } from "../engine/Tilemap_Manager";
import { Point2D, Rectangle } from '../../interfaces';
import { zorder } from "../constants/zorder";


interface Props {
	asset_manager: Asset_Manager_Data,
	highlight: boolean,
	tile_name: string,
	asset_name: string,
	handle_click(): void, 
}


export class Tile_Palette_Element extends React.Component <Props> {
	ctx!: CanvasRenderingContext2D;
	canvas!: HTMLCanvasElement;
	_Blit_Manager!: Blit_Manager_Data;
	_Tilemap_Manager!: Tilemap_Manager_Data;
	default_canvas_size: Point2D;

/*----------------------- initialization and asset loading -----------------------*/
	constructor( props: Props ) {
		super( props );
		
		this.state = {
		};
		
		this.default_canvas_size = {x: 50, y: 50};
	}

	componentDidMount() {
		this.ctx = this.canvas!.getContext("2d")!;
		this.initialize_tilemap_manager(this.ctx);
		
		this.draw_canvas();
	}

	componentDidUpdate() {
		this.ctx = this.canvas!.getContext("2d")!;
		this.initialize_tilemap_manager(this.ctx);
		this.draw_canvas();
	}

	initialize_tilemap_manager = (ctx: CanvasRenderingContext2D) => {
		if( !this._Tilemap_Manager ){
			this._Blit_Manager = New_Blit_Manager(ctx, this.default_canvas_size, false);
			this._Tilemap_Manager = New_Tilemap_Manager({_AM: this.props.asset_manager, _BM: this._Blit_Manager});
		} else {
			Blit_Manager_ƒ.reset_context(this._Blit_Manager, ctx);
		}
	}


/*----------------------- draw ops -----------------------*/

	
	draw_canvas = () => {
		let { consts } = this.props.asset_manager;

		Blit_Manager_ƒ.fill_canvas_with_solid_color(this._Blit_Manager);

		if(  _.size(this.props.tile_name) > 0 ){
			Asset_Manager_ƒ.draw_all_assets_for_tile_type(
				this.props.asset_manager,
				this.props.tile_name,
				this._Blit_Manager,
				{
					x: Math.floor(this.default_canvas_size.x/2),
					y: Math.floor(this.default_canvas_size.y/2)
				},
			);
		}

		if( _.size(this.props.asset_name) > 0 ){
			Asset_Manager_ƒ.draw_image_for_asset_name({
				_AM:						this.props.asset_manager,
				asset_name:					this.props.asset_name,
				_BM:						this._Blit_Manager,
				pos:						{
					x: Math.floor(this.default_canvas_size.x/2),
					y: Math.floor(this.default_canvas_size.y)
				},
				zorder:						zorder.rocks,
				current_milliseconds:		0,
				opacity:					1.0,
				brightness:					1.0,
				horizontally_flipped:		false,
				vertically_flipped:			false,
			})
		}

		Blit_Manager_ƒ.draw_entire_frame(this._Blit_Manager);
	}
	
	handle_mouse_click = (e: React.MouseEvent<HTMLCanvasElement>) => {
		this.props.handle_click();
	}
	

	render() {
		return <div className={`tile_cell${ this.props.highlight ? ' active' : ''}`}>
			<canvas
				ref={(node) => {this.canvas = node!;}}
				width={this.default_canvas_size.x}
				height={this.default_canvas_size.y}
				style={ {
					width: this.default_canvas_size.x * 2,
					height: this.default_canvas_size.y * 2,
					imageRendering: 'pixelated',
				} }
			
				onClick={ this.handle_mouse_click }
			/>
		</div>;
	}
}