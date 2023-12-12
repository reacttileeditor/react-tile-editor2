import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import _, { isString, toNumber } from "lodash";

import { Canvas_View, MouseButtonState } from "./Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../engine/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { MetaData, Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../engine/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { zorder } from "../constants/zorder";
import { useInterval } from "../engine/Utils";
import { Button, Input, List, Modal, Tooltip, Whisper } from "rsuite";
import { Icon, Page, Trash } from "@rsuite/icons";

import "./Editor_View.scss";


interface Editor_View_Props {
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	set_Blit_Manager: (newVal: Blit_Manager_Data) => void,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
	assets_loaded: boolean,
	context_connected:  boolean,
	connect_context_to_blit_manager: (ctx: CanvasRenderingContext2D) => void,
	dimensions: Point2D,
	is_edit_mode: boolean,	
	set_is_edit_mode: Dispatch<SetStateAction<boolean>>,
}





export const Editor_View = (props: Editor_View_Props) => {

	const [render_loop_interval, set_render_loop_interval] = useState<number|null>(null);
	const [selected_tile_type, set_selected_tile_type] = useState<string>('');
	const [cursor_pos, set_cursor_pos] = useState<Point2D>({ x: 0, y: 0 });
	const [render_tick, set_render_tick] = useState<number>(0);

	const [show_load_dialog, set_show_load_dialog] = useState<boolean>(false);
	const [show_save_dialog, set_show_save_dialog] = useState<boolean>(false);
	const [show_metadata_dialog, set_show_metadata_dialog] = useState<boolean>(false);
	const [level_filename_list, set_level_filename_list] = useState<Array<string>>([]);

	useEffect(() => {
		if(render_tick > 0){
		render_canvas();
		}
	}, [render_tick]);

	useInterval(() => {
		if(
			props.assets_loaded
			&&
			render_loop_interval == null
			&&
			props.context_connected
			
		){
			console.log('EDITOR RENDER TICK')
			const bm = props._Blit_Manager();
			set_render_tick(render_tick + 1);
		}

		// Your custom logic here
	}, 16.666 );	
		
	useEffect(() => {

	}, [props.assets_loaded, props._Tilemap_Manager(), props._Blit_Manager()]);

	useEffect(() => {

		return () => {
			if( render_loop_interval ){
				console.log('EDITOR CLEANUP')

				window.clearInterval(render_loop_interval as number);
				set_render_loop_interval(null);
			}
		};
	}, [render_loop_interval]);

	/*----------------------- cursor stuff -----------------------*/
	const draw_cursor = () => {
		//const pos = this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(0,4); 
		//console.log(cursor_pos);

		Asset_Manager_ƒ.draw_image_for_asset_name({
			_AM:						props._Asset_Manager(),
			asset_name:					'cursor',
			_BM:						props._Blit_Manager(),
			pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( props._Tilemap_Manager(), props._Asset_Manager(), cursor_pos ),
			zorder:						zorder.rocks,
			current_milliseconds:		0,
			opacity:					1.0,
			rotate:						0,
			brightness:					1.0,
			horizontally_flipped:		false,
			vertically_flipped:			false,
		})
	}


	/*----------------------- core drawing routines -----------------------*/
	const start_render_loop = () => {
		// if( !render_loop_interval ){
		// 	set_render_loop_interval( window.setInterval( () => {set_render_tick(render_tick + 1), console.log(render_tick)}, 16.666 ) );
		// }

	
	}

	const render_canvas = () => {
		if(
			props.assets_loaded
			&&
			render_loop_interval == null
			&&
			props._Tilemap_Manager != null
			
		){
		Tilemap_Manager_ƒ.do_one_frame_of_rendering( props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager(), props.set_Blit_Manager );
		draw_cursor();
		}
	}

	
	/*----------------------- I/O routines -----------------------*/
	const handle_canvas_click = (pos: Point2D, buttons_pressed: MouseButtonState) => {
		console.log('canvas click editor')
		props.set_Tilemap_Manager(
			Tilemap_Manager_ƒ.modify_tile_status(
				props._Tilemap_Manager(),
				props._Asset_Manager(),
				Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager(), pos),
				selected_tile_type,
				'terrain'
			)
		);
	}

	const handle_canvas_mouse_move = (pos: Point2D, buttons_pressed: MouseButtonState) => {
		const new_tile_pos = Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager(), pos)
	
		//console.log(`pos ${pos.x},${pos.y} | ${new_tile_pos.x},${new_tile_pos.y}`)

		set_cursor_pos(
			new_tile_pos
		);

		if( buttons_pressed.left == true ){
			handle_canvas_click(pos, buttons_pressed);
		}
		
	}

	const handle_canvas_keys_down = (keys: Array<string>) => {
		let move = { x: 0, y: 0};

		if( _.includes(keys, 'ArrowDown') ){
			move.y += 40;
		}

		if( _.includes(keys, 'ArrowUp') ){
			move.y -= 40;
		}

		if( _.includes(keys, 'ArrowLeft') ){
			move.x -= 40;
		}

		if( _.includes(keys, 'ArrowRight') ){
			move.x += 40;
		}

		props.set_Blit_Manager(
			Blit_Manager_ƒ.adjust_viewport_pos(props._Blit_Manager(), move.x, move.y)
		)
	}



	return <div className="editor_screen">
		<div className="toolbar">
			<Button
				onClick={ () => { props.set_is_edit_mode( !props.is_edit_mode ); } }
			>
				{'Toggle to Game'}
			</Button>
			<Whisper placement='top' speaker={<Tooltip>{props._Tilemap_Manager().level_name == '' ? "Can't quicksave until we know which file we'd save to.  Try 'Load…' or 'Save As…' first." : `This will save to: "${props._Tilemap_Manager().level_name}"`}</Tooltip>}>
				<span>
					<Button
						disabled={props._Tilemap_Manager().level_name == ''}
						onClick={ () => {  
							Tilemap_Manager_ƒ.save_level(props._Tilemap_Manager(), props._Asset_Manager(), props.set_Tilemap_Manager, props._Tilemap_Manager().level_name, level_filename_list);
						} }
					>
						{`Save`}
					</Button>
				</span>
			</Whisper>
			<Button
				onClick={ () => { 
					set_show_save_dialog(true);
					Tilemap_Manager_ƒ.load_levelname_list(set_level_filename_list);
				} }
			>
				{'Save As...'}
			</Button>
			<Button
				onClick={ () => { 
					set_show_load_dialog(true);
					Tilemap_Manager_ƒ.load_levelname_list(set_level_filename_list);
				} }
			>
				{'Load...'}
			</Button>
			<Button
				onClick={ () => { 
					set_show_metadata_dialog(true);
				} }
			>
				{'Edit Metadata...'}
			</Button>			<Button
				onClick={ () => {
					props.set_Tilemap_Manager(
						Tilemap_Manager_ƒ.initialize_tiles(props._Tilemap_Manager(), props._Asset_Manager())
					);
				} }
			>
				{'Generate Map'}
			</Button>
		</div>
		<div className="editor_node">
			<Load_File_Modal
				show_load_dialog={show_load_dialog}
				set_show_load_dialog={set_show_load_dialog}
				level_filename_list={level_filename_list}
				_Asset_Manager={props._Asset_Manager}
				_Tilemap_Manager={props._Tilemap_Manager}
				set_Tilemap_Manager={props.set_Tilemap_Manager}
			/>
			<Save_File_Modal
				show_save_dialog={show_save_dialog}
				set_show_save_dialog={set_show_save_dialog}
				level_filename_list={level_filename_list}
				_Asset_Manager={props._Asset_Manager}
				_Tilemap_Manager={props._Tilemap_Manager}
				set_Tilemap_Manager={props.set_Tilemap_Manager}
			/>
			<Edit_Metadata_Modal
				show_metadata_dialog={show_metadata_dialog}
				set_show_metadata_dialog={set_show_metadata_dialog}
				_Asset_Manager={props._Asset_Manager}
				level_metadata={props._Tilemap_Manager().metadata}
				_Tilemap_Manager={props._Tilemap_Manager}
				set_Tilemap_Manager={props.set_Tilemap_Manager}
			/>
			<Canvas_View
				assets_loaded={props.assets_loaded}
				connect_context_to_blit_manager={props.connect_context_to_blit_manager}
				_Tilemap_Manager={props._Tilemap_Manager()}
				dimensions={props.dimensions}
				handle_canvas_click={handle_canvas_click}
				handle_canvas_keys_down={handle_canvas_keys_down}
				handle_canvas_mouse_move={handle_canvas_mouse_move}
			/>
			<div className="tile_palette">
			{
				props.assets_loaded
				&&
				Asset_Manager_ƒ.yield_tile_name_list(props._Asset_Manager()).map( (value, index) => {
					return	<Tile_Palette_Element
								asset_manager={props._Asset_Manager()}
								tile_name={value}
								asset_name={''}
								key={value}
								highlight={ selected_tile_type == value }
								handle_click={ () => set_selected_tile_type( value ) }
							/>
				})
			}
			</div>
		</div>
	</div>;
}


export const Load_File_Modal = (props: {
	show_load_dialog: boolean,
	set_show_load_dialog: Dispatch<SetStateAction<boolean>>,
	level_filename_list: Array<string>,
	_Asset_Manager: () => Asset_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}) => {
	const [selected_file, set_selected_file] = useState<string>('');
	const [deletion_target, set_deletion_target] = useState<string>('');

	return <Modal
		open={props.show_load_dialog}
		onClose={()=>props.set_show_load_dialog(false)}
		className="Load_File_Modal"
	>
		<h3>Load</h3>
		<div className="label">Select level to load:</div>
		<List
			hover
		>
		{
			_.map(props.level_filename_list, (val, idx)=>(
				<List.Item
					key={idx}
					onClick={()=>{set_selected_file(val)}}
					className={ val == selected_file ? 'selected' : ''}
				>
					<span><Icon as={Page} className="file-icon"/>{val}</span>
					<Icon
						as={Trash} className="delete-icon"
						onClick={(evt)=>{
							evt.preventDefault();
							evt.stopPropagation();
							set_deletion_target(val);
						}}
					/>
				</List.Item>
			))

		}
		</List>
		{
			deletion_target != ''
			&&
			<div className="delete-confirm">
				<div>{`Are you sure you want to delete the file named "${deletion_target}"?`}</div>
				<div className="button-strip">
					<Button
						appearance="subtle"
						onClick={ () => { 
							set_deletion_target('');
						}}
					>Cancel</Button>
					<Button
						onClick={ () => { 
							Tilemap_Manager_ƒ.delete_level(props._Tilemap_Manager(), props._Asset_Manager(), props.set_Tilemap_Manager, deletion_target, props.level_filename_list);
							set_deletion_target('');
							props.set_show_load_dialog(false);
						}}
					>Delete</Button>
				</div>
			</div>
		}
		<div className="button-strip">
			<Button
				appearance="subtle"
				onClick={ () => { 
					props.set_show_load_dialog(false)
				}}
			>Cancel</Button>
			<Button
				disabled={selected_file == ''}
				onClick={ () => { 
					Tilemap_Manager_ƒ.load_level(props._Tilemap_Manager(), props._Asset_Manager(), props.set_Tilemap_Manager, selected_file);
					props.set_show_load_dialog(false);
				}}
			>Load</Button>
		</div>
	</Modal>
}

export const Save_File_Modal = (props: {
	show_save_dialog: boolean,
	set_show_save_dialog: Dispatch<SetStateAction<boolean>>,
	level_filename_list: Array<string>,
	_Asset_Manager: () => Asset_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}) => {
	const [selected_file, set_selected_file] = useState<string>('');
	const [deletion_target, set_deletion_target] = useState<string>('');

	return <Modal
		open={props.show_save_dialog}
		onClose={()=>props.set_show_save_dialog(false)}
		className="Save_File_Modal"
	>
		<h3>Save</h3>
		<div className="label">Existing Levels:</div>
		<List
			hover
		>
		{
			_.map(props.level_filename_list, (val, idx)=>(
				<List.Item
					key={idx}
					onClick={()=>{set_selected_file(val)}}
					className={ val == selected_file ? 'selected' : ''}
				>
					<span><Icon as={Page} className="file-icon"/>{val}</span>
					<Icon
						as={Trash} className="delete-icon"
						onClick={(evt)=>{
							evt.preventDefault();
							evt.stopPropagation();
							set_deletion_target(val);
						}}
					/>
				</List.Item>
			))

		}
		</List>
		{
			deletion_target != ''
			&&
			<div className="delete-confirm">
				<div>{`Are you sure you want to delete the file named "${deletion_target}"?`}</div>
				<div className="button-strip">
					<Button
						appearance="subtle"
						onClick={ () => { 
							set_deletion_target('');
						}}
					>Cancel</Button>
					<Button
						onClick={ () => { 
							Tilemap_Manager_ƒ.delete_level(props._Tilemap_Manager(), props._Asset_Manager(), props.set_Tilemap_Manager, deletion_target, props.level_filename_list);
							set_deletion_target('');
							props.set_show_save_dialog(false);
						}}
					>Delete</Button>
				</div>
			</div>
		}
		<div className="label">File Name:</div>
   		<Input
			value={selected_file}
			onChange={(value: string, event) => { set_selected_file(value) }}		
		/>
		<div className="button-strip">
			<Button
				appearance="subtle"
				onClick={ () => { 
					props.set_show_save_dialog(false)
				}}
			>Cancel</Button>
			<Button
				disabled={selected_file == ''}
				onClick={ () => { 
					Tilemap_Manager_ƒ.save_level(props._Tilemap_Manager(), props._Asset_Manager(), props.set_Tilemap_Manager, selected_file, props.level_filename_list)
					props.set_show_save_dialog(false)
				}}
			>Save</Button>
		</div>
	</Modal>
}

export const Edit_Metadata_Modal = (props: {
	show_metadata_dialog: boolean,
	set_show_metadata_dialog: Dispatch<SetStateAction<boolean>>,
	level_metadata: MetaData,
	_Asset_Manager: () => Asset_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}) => {
	const [map_width, set_map_width] = useState<number>(0);
	const [map_height, set_map_height] = useState<number>(0);
	const [origin_x, set_origin_x] = useState<number>(0);
	const [origin_y, set_origin_y] = useState<number>(0);

	useEffect(() => {
		reset_values();
	}, [props.level_metadata]);

	const reset_values = () => {
		set_map_width(props.level_metadata.row_length);
		set_map_height(props.level_metadata.col_height);
		set_origin_x(props.level_metadata.origin.x);
		set_origin_y(props.level_metadata.origin.y);
	}


	return <Modal
		open={props.show_metadata_dialog}
		onClose={()=>{
			reset_values();
			props.set_show_metadata_dialog(false);
		}}
		className="Save_File_Modal"
	>
		<h3>Edit Metadata</h3>
		<div className="label">Warning: don't use this dialog right now; the edits will be destructive and cause undefined behavior.  The values will be set, but the tilemap manager doesn't know how to gracefully handle them getting rug-pulled underneath it.</div>
		<div className="input-strip">
			<div className="input-pair">
				<div className="label">Map Width:</div>
				<Input
					value={map_width}
					type="number"
					onChange={(value: string, event) => { set_map_width(toNumber(value)) }}		
				/>
			</div>
			<div className="input-pair">
				<div className="label">Map Height:</div>
				<Input
					value={map_height}
					type="number"
					onChange={(value: string, event) => { set_map_height(toNumber(value)) }}		
				/>
			</div>
		</div>
		<div className="input-strip">
			<div className="input-pair">
				<div className="label">Origin X:</div>
				<Input
					value={origin_x}
					type="number"
					onChange={(value: string, event) => { set_origin_x(toNumber(value)) }}		
				/>
			</div>
			<div className="input-pair">
				<div className="label">Origin Y:</div>
				<Input
					value={origin_y}
					type="number"
					onChange={(value: string, event) => { set_origin_y(toNumber(value)) }}		
				/>
			</div>
		</div>
		<div className="button-strip">
			<Button
				appearance="subtle"
				onClick={ () => { 
					reset_values();
					props.set_show_metadata_dialog(false);
				}}
			>Cancel</Button>
			<Button
				disabled={false}
				onClick={ () => { 
					props.set_Tilemap_Manager(
						Tilemap_Manager_ƒ.set_metadata(props._Tilemap_Manager(), {
							row_length: map_width,
							col_height: map_height,
							origin: {
								x: origin_x,
								y: origin_y,
							}
						})
					)
					props.set_show_metadata_dialog(false)
				}}
			>Save</Button>
		</div>
	</Modal>
}

