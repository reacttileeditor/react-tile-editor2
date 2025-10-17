import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import _, { map } from "lodash";

import { Asset_Manager_Data, Asset_Manager_ƒ } from "../engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ, New_Blit_Manager } from "../engine/Blit_Manager";
import { Asset_Blit_List, New_Tilemap_Manager, Tilemap_Manager_Data } from "../engine/Tilemap_Manager/Tilemap_Manager";
import { Point2D, Rectangle } from '../../interfaces';
import { zorder } from "../constants/zorder";
import { useInterval, ƒ } from "../engine/Utils";
import { Palette_Names } from "../data/Palette_List";


interface Props {
	asset_manager: Asset_Manager_Data,
	highlight: boolean,
	tile_name: string,
	asset_list: Asset_Blit_List,
	handle_click(): void,
	canvas_size: Point2D,
	use_black_background: boolean,
	centering_offset?: Point2D,
	palette?: Palette_Names,
}


export const Tile_Palette_Element = (props: Props) => {
	const default_canvas_size: Point2D = {x: 50, y: 50};
	const [_Blit_Manager, set_Blit_Manager] = useState<Blit_Manager_Data|null>(null);
	const [_Tilemap_Manager, set_Tilemap_Manager] = useState<Tilemap_Manager_Data|null>(null);

	const [render_tick, set_render_tick] = useState<number>(0);
	const [initialized, set_initialized] = useState<boolean>(false);
	const [render_loop_interval, set_render_loop_interval] = useState<number|null>(null);

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
			set_initialized(true);

			//draw_canvas();
		}
	}, [_Blit_Manager, props.asset_list]);


	useEffect(() => {
		if(render_tick > 0 && _Blit_Manager != null){
			draw_canvas(_Blit_Manager);
		}
	}, [render_tick]);

	useInterval(() => {
		if(
			initialized
			&&
			render_loop_interval == null
			
		){
			set_render_tick(render_tick + 1);
		}

		// Your custom logic here
	}, 16.666 );	



	useEffect(() => {
		if(_Blit_Manager){
			set_Tilemap_Manager(New_Tilemap_Manager());
		}
	}, [_Blit_Manager]);

	const initialize_tilemap_manager = (ctx: CanvasRenderingContext2D) => {
		if( !_Tilemap_Manager ){
			set_Blit_Manager(New_Blit_Manager(ctx, props.canvas_size, false));
		} else {
			if(_Blit_Manager){
				Blit_Manager_ƒ.reset_context(_Blit_Manager, ctx);
			}
		}

	}



/*----------------------- draw ops -----------------------*/

	
	const draw_canvas = (_BM: Blit_Manager_Data) => {
		if(_BM != null && _Tilemap_Manager != null){
			let { consts } = props.asset_manager;

			const centering_offset = props.centering_offset ? props.centering_offset : {x: 0, y: 0}; 

			if(props.use_black_background){
				Blit_Manager_ƒ.fill_canvas_with_solid_color(_BM, "#000000");
			} else {
				Blit_Manager_ƒ.fill_canvas_with_solid_color(_BM, "#00000000");

			}

			if(  _.size(props.tile_name) > 0 ){
				let asset_data_array = Asset_Manager_ƒ.get_tile_graphics_data(props.asset_manager, props.tile_name);
				map(asset_data_array, (asset_item)=>{
					const derandomized_asset = Asset_Manager_ƒ.convert_tile_variants_to_single_assets(
						props.asset_manager,
						asset_item,
						_Tilemap_Manager.tile_RNGs.terrain
					);

					Asset_Manager_ƒ.draw_image_for_asset_name({
						_AM:						props.asset_manager,
						asset_name:					derandomized_asset.id,
						_BM:						_BM,
						pos:						{
							x: Math.floor(props.canvas_size.x/(2 + centering_offset.x)),
							y: Math.floor(props.canvas_size.y/(2 + centering_offset.y))
						},
						zorder:						derandomized_asset.zorder,
						current_milliseconds:		_BM.time_tracker.current_millisecond,
						opacity:					1.0,
						rotate:						0,
						scale:						1.0,
						brightness:					1.0,
						horizontally_flipped:		false,
						vertically_flipped:			false,
					})
				})
			}

			map(props.asset_list, (asset)=>{
				Asset_Manager_ƒ.draw_image_for_asset_name({
					_AM:						props.asset_manager,
					asset_name:					asset.id,
					_BM:						_BM,
					pos:						{
						x: Math.floor(props.canvas_size.x/(2 + centering_offset.x)),
						y: Math.floor(props.canvas_size.y/(2 + centering_offset.y))
				},
					zorder:						asset.zorder,
					current_milliseconds:		_BM.time_tracker.current_millisecond,
					opacity:					1.0,
					rotate:						0,
					scale:						1.0,
					brightness:					1.0,
					horizontally_flipped:		false,
					vertically_flipped:			false,
					palette: 					props.palette,
				})
			})




			set_Blit_Manager(
				Blit_Manager_ƒ.draw_entire_frame(_BM)
			);

			_Tilemap_Manager.tile_RNGs.terrain.reset();			
		}
	}
	
	const handle_mouse_click = (e: React.MouseEvent<HTMLCanvasElement>) => {
		props.handle_click();
	}
	

	return <div className={`tile_cell${ props.highlight ? ' active' : ''}`}>
		<canvas
			ref={canvasRef}
			width={props.canvas_size.x}
			height={props.canvas_size.y}
			style={ {
//				width: props.canvas_size.x * 2,
//				height: props.canvas_size.y * 2,
				imageRendering: 'pixelated',
			} }
		
			onClick={ handle_mouse_click }
		/>
	</div>;
}