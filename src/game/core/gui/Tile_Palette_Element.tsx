import React, { useEffect, useState } from "react";
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


export const Tile_Palette_Element = (props: Props) => {
	const default_canvas_size: Point2D = {x: 50, y: 50};
	const [_Blit_Manager, set_Blit_Manager] = useState<Blit_Manager_Data|null>(null);
	const [_Tilemap_Manager, set_Tilemap_Manager] = useState<Tilemap_Manager_Data|null>(null);


/*----------------------- canvas element access -----------------------*/
	const canvasRef = React.useRef<HTMLCanvasElement>(null);


	const getCanvas =  (): HTMLCanvasElement | null => (canvasRef.current);
	const getContext = (): CanvasRenderingContext2D | null => {
		const canvas = getCanvas()
		if(canvas != null){
			return canvas.getContext('2d');
		} else {
			return null;
		}
	};

/*----------------------- initialization and asset loading -----------------------*/
	useEffect(() => {
		const ctx = getContext();
		if(ctx != null){
			initialize_tilemap_manager(ctx);

			draw_canvas();
		}
	}, [_Blit_Manager]);




	useEffect(() => {
		if(_Blit_Manager){
			set_Tilemap_Manager(New_Tilemap_Manager());
		}
	}, [_Blit_Manager]);

	const initialize_tilemap_manager = (ctx: CanvasRenderingContext2D) => {
		if( !_Tilemap_Manager ){
			set_Blit_Manager(New_Blit_Manager(ctx, default_canvas_size, false));
		} else {
			if(_Blit_Manager){
				Blit_Manager_ƒ.reset_context(_Blit_Manager, ctx);
			}
		}

	}



/*----------------------- draw ops -----------------------*/

	
	const draw_canvas = () => {
		if(_Blit_Manager != null){
			let { consts } = props.asset_manager;

			Blit_Manager_ƒ.fill_canvas_with_solid_color(_Blit_Manager);

			if(  _.size(props.tile_name) > 0 ){
				Asset_Manager_ƒ.draw_all_assets_for_tile_type(
					props.asset_manager,
					props.tile_name,
					_Blit_Manager,
					{
						x: Math.floor(default_canvas_size.x/2),
						y: Math.floor(default_canvas_size.y/2)
					},
				);
			}

			if( _.size(props.asset_name) > 0 ){
				Asset_Manager_ƒ.draw_image_for_asset_name({
					_AM:						props.asset_manager,
					asset_name:					props.asset_name,
					_BM:						_Blit_Manager,
					pos:						{
						x: Math.floor(default_canvas_size.x/2),
						y: Math.floor(default_canvas_size.y)
					},
					zorder:						zorder.rocks,
					current_milliseconds:		0,
					opacity:					1.0,
					rotate:						0,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
				})
			}

			Blit_Manager_ƒ.draw_entire_frame(_Blit_Manager);
		}
	}
	
	const handle_mouse_click = (e: React.MouseEvent<HTMLCanvasElement>) => {
		props.handle_click();
	}
	

	return <div className={`tile_cell${ props.highlight ? ' active' : ''}`}>
		<canvas
			ref={canvasRef}
			width={default_canvas_size.x}
			height={default_canvas_size.y}
			style={ {
				width: default_canvas_size.x * 2,
				height: default_canvas_size.y * 2,
				imageRendering: 'pixelated',
			} }
		
			onClick={ handle_mouse_click }
		/>
	</div>;
}