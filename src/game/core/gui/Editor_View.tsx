import React, { Dispatch, KeyboardEventHandler, SetStateAction, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import _, { isNil, isString, toNumber } from "lodash";

import { Canvas_View, Mouse_Button_State } from "./Canvas_View";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "../engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../engine/Blit_Manager";
import { Tile_Palette_Element } from "./Tile_Palette_Element";
import { Tilemap_Metadata, Tilemap_Manager_Data, Tilemap_Manager_ƒ, Directions, Direction } from "../engine/Tilemap_Manager/Tilemap_Manager";

import { Point2D, Rectangle } from '../../interfaces';
import { zorder } from "../constants/zorder";
import { constrain_point_within_rect, is_within_rectangle, useInterval } from "../engine/Utils";
import { Button, Divider, Drawer, Dropdown, IconButton, Input, List, Modal, RadioTile, RadioTileGroup, Slider, Tooltip, Whisper } from "rsuite";
import { Icon, Page, Trash, Global, PeoplesCostomize, Copy } from "@rsuite/icons";
import { BsFileEarmarkLock2, BsFileEarmark, BsClipboard2Plus } from "react-icons/bs";
import { GiPerspectiveDiceSixFacesOne, GiSpatter } from "react-icons/gi";


import "./Editor_View.scss";
import { Standard_Input_ƒ } from "./Standard_Input_Handling";
import { Creature_Type_Name, Creature_ƒ } from "../../objects_core/Creature/Creature";
import { Game_Manager_ƒ } from "../engine/Game_Manager/Game_Manager";
import { includes, indexOf, map } from "ramda";
import { Map_Generation_ƒ } from "../engine/Map_Generation";
import { Tile_Name } from "../data/Tile_Types";
import { Vals } from "../constants/Constants";
import { Load_File_Modal } from "./Editor_Components/Load_File_Modal";
import { Save_File_Modal } from "./Editor_Components/Save_File_Modal";
import { Edit_Metadata_Modal } from "./Editor_Components/Edit_Metadata_Modal";
import { Generate_Map_Modal } from "./Editor_Components/Generate_Map_Modal";
import { Tile_Palette_Drawer } from "./Editor_Components/Tile_Palette_Drawer";
import { Unit_Palette_Drawer } from "./Editor_Components/Unit_Palette_Drawer";
import { Editor_Tooltip_Manager } from "./Editor_Components/Editor_Tooltip_Manager";


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

type Editor_Tool_Types = 'tiles' | 'unitAdd' | 'unitDelete';



export const Editor_View = (props: Editor_View_Props) => {

	const [render_loop_interval, set_render_loop_interval] = useState<number|null>(null);
	const [screen_pixel_cursor_pos, set_screen_pixel_cursor_pos] = useState<Point2D>({ x: 50, y: 50 });
	const [tile_cursor_pos, set_tile_cursor_pos] = useState<Point2D>({ x: 0, y: 0 });
	const [render_tick, set_render_tick] = useState<number>(0);

	const [show_load_dialog, set_show_load_dialog] = useState<boolean>(false);
	const [show_save_dialog, set_show_save_dialog] = useState<boolean>(false);
	const [show_generate_map_dialog, set_show_generate_map_dialog] = useState<boolean>(false);
	const [show_metadata_dialog, set_show_metadata_dialog] = useState<boolean>(false);
	const [level_filename_list, set_level_filename_list] = useState<Array<string>>([]);
	const [builtin_level_filename_list, set_builtin_level_filename_list] = useState<Array<string>>([]);

	const [show_unit_palette_drawer, set_show_unit_palette_drawer] = useState<boolean>(false);
	const [selected_creature_type, set_selected_creature_type] = useState<Creature_Type_Name>('hermit');
	const [selected_creature_direction, set_selected_creature_direction] = useState<Direction>('south_east');
	const [selected_creature_team, set_selected_creature_team] = useState<number>(1);
	const [selected_tool, set_selected_tool] = useState<Editor_Tool_Types>('tiles');

	const [show_tile_palette_drawer, set_show_tile_palette_drawer] = useState<boolean>(false);
	const [selected_tile_type, set_selected_tile_type] = useState<Tile_Name>('grass');


	/*----------------------- draw interval routines -----------------------*/

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
			//console.log('EDITOR RENDER TICK')
			Standard_Input_ƒ.move_viewport_based_on_mouse_position(
				screen_pixel_cursor_pos,
				props._Blit_Manager(),
				props.set_Blit_Manager,
				props._Tilemap_Manager(),
				props._Asset_Manager(),
			);


			set_render_tick(render_tick + 1);
		}

		// Your custom logic here
	}, 16.666 );	
		

	useEffect(() => {

		return () => {
			if( render_loop_interval ){
				console.log('EDITOR CLEANUP')

				window.clearInterval(render_loop_interval as number);
				set_render_loop_interval(null);
			}
		};
	}, [render_loop_interval]);



	/*----------------------- core drawing routines -----------------------*/

	const render_canvas = () => {
		if(
			props.assets_loaded
			&&
			render_loop_interval == null
			&&
			props._Tilemap_Manager != null
			
		){
		Tilemap_Manager_ƒ.do_one_frame_of_rendering(
			props._Tilemap_Manager(),
			props._Asset_Manager(),
			props._Blit_Manager(),
			props.set_Blit_Manager,
			props.set_Tilemap_Manager,
			true,
			tile_cursor_pos
		);
		draw_cursor();
		}
	}


	/*----------------------- cursor stuff -----------------------*/
	const draw_cursor = () => {
		//const pos = this._Tilemap_Manager.convert_tile_coords_to_pixel_coords(0,4); 
		//console.log(cursor_pos);

		Asset_Manager_ƒ.draw_image_for_asset_name({
			_AM:						props._Asset_Manager(),
			asset_name:					'cursor',
			_BM:						props._Blit_Manager(),
			pos:						Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( props._Tilemap_Manager(), props._Asset_Manager(), tile_cursor_pos ),
			zorder:						zorder.rocks,
			current_milliseconds:		0,
			opacity:					1.0,
			rotate:						0,
			brightness:					1.0,
			horizontally_flipped:		false,
			vertically_flipped:			false,
		})
	}
	
	
	/*----------------------- I/O routines -----------------------*/
	const handle_canvas_click = (pos: Point2D, buttons_pressed: Mouse_Button_State) => {
		console.log('canvas click editor')

		if(selected_tool == 'tiles'){
			props.set_Tilemap_Manager(
				Tilemap_Manager_ƒ.modify_tile_status(
					props._Tilemap_Manager(),
					props._Asset_Manager(),
					Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager(), pos),
					selected_tile_type,
					'terrain'
				)
			);
		} else if (selected_tool == 'unitAdd'){
			props.set_Tilemap_Manager(
				Tilemap_Manager_ƒ.add_creature_at_pos(props._Tilemap_Manager(), {
					type_name: selected_creature_type,
					pos: Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager(), pos),
					direction: selected_creature_direction,
					team: selected_creature_team,
				})
			);
		} else if (selected_tool == 'unitDelete'){
			props.set_Tilemap_Manager(
				Tilemap_Manager_ƒ.remove_creature_at_pos(
					props._Tilemap_Manager(),
					Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager(), pos)
				)
			);
		}
	}

	const editor_handle_canvas_mouse_move = (pos: Point2D, buttons_pressed: Mouse_Button_State) => {
		Standard_Input_ƒ.handle_canvas_mouse_move(
			pos,
			buttons_pressed,
			props._Tilemap_Manager(),
			props._Asset_Manager(),
			props._Blit_Manager(),
			update_mouse_pos,
			props.set_Blit_Manager,
			handle_canvas_click
		)
	}

	const update_mouse_pos = (pos: Point2D): void => {
		const new_tile_pos = Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords(props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager(), pos)

		set_screen_pixel_cursor_pos(
			pos
		);

		set_tile_cursor_pos(
			new_tile_pos
		);
	}

	const editor_handle_canvas_keys_down = (keys: Array<string>) => {
		Standard_Input_ƒ.handle_canvas_keys_down(
			keys,
			props._Blit_Manager(),
			props.set_Blit_Manager,
			props._Tilemap_Manager(),
			props._Asset_Manager(),
		);
	}



	return <div className="editor_screen">
		<div className="toolbar">
			<Button
				onClick={ () => { props.set_is_edit_mode( !props.is_edit_mode ); } }
			>
				{'Toggle to Game'}
			</Button>
			<Whisper placement='top' speaker={<Tooltip>{
				(()=>{
					if( props._Tilemap_Manager().level_name == ''){
						return "Can't save until we know which file we'd save to.  Try 'Load…' or 'Save As…' first."
					} else if ( includes(props._Tilemap_Manager().level_name, builtin_level_filename_list) ){
						return "Can't save this file because we can't overwrite a built-in level.  Try using 'Save As…' and specifying a different name."
					} else {
						return `This will save to: "${props._Tilemap_Manager().level_name}"`
					}
				})()
			}</Tooltip>}>
				<span>
					<Button
						disabled={
							props._Tilemap_Manager().level_name == ''
							||
							includes(props._Tilemap_Manager().level_name, builtin_level_filename_list)
						}
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
					Tilemap_Manager_ƒ.load_builtin_level_name_list(set_builtin_level_filename_list);
					Tilemap_Manager_ƒ.load_levelname_list(set_level_filename_list);
				} }
			>
				{'Save As...'}
			</Button>
			<Whisper placement='top' speaker={<Tooltip>{"Copy Level to Clipboard"}</Tooltip>}>
				<IconButton
					icon={<Icon as={BsClipboard2Plus} />}
					onClick={()=>{
						Tilemap_Manager_ƒ.export_level_to_clipboard(props._Tilemap_Manager(), props._Asset_Manager());
					}}
				/>
			</Whisper>
			<Button
				onClick={ () => { 
					set_show_load_dialog(true);
					Tilemap_Manager_ƒ.load_builtin_level_name_list(set_builtin_level_filename_list);
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
			</Button>
			<Button
				onClick={ () => { 
					set_show_generate_map_dialog(true);
				} }
			>
				{'Generate Map...'}
			</Button>
			<Divider vertical />
			<IconButton
				icon={<Icon as={Global} />}
				appearance={ selected_tool == 'tiles' ? 'primary' : 'default'} 
				onClick={()=>{
					set_show_tile_palette_drawer(true);
					set_selected_tool('tiles') ;
				}}
			>Terrain</IconButton>
			<IconButton
				icon={<Icon as={PeoplesCostomize} />}
				onClick={()=>{
					set_show_unit_palette_drawer(true);
					set_selected_tool('unitAdd') 
				}}
				appearance={ selected_tool == 'unitAdd' ? 'primary' : 'default'} 
			>Add Units</IconButton>
			<IconButton
				icon={<Icon as={PeoplesCostomize} />}
				onClick={()=>{
					set_selected_tool('unitDelete') 
				}}
				appearance={ selected_tool == 'unitDelete' ? 'primary' : 'default'} 
			>Remove Units</IconButton>
		</div>
		<div className="editor_node">
			<Load_File_Modal
				show_load_dialog={show_load_dialog}
				set_show_load_dialog={set_show_load_dialog}
				level_filename_list={level_filename_list}
				builtin_level_filename_list={builtin_level_filename_list}
				_Asset_Manager={props._Asset_Manager}
				_Tilemap_Manager={props._Tilemap_Manager}
				set_Tilemap_Manager={props.set_Tilemap_Manager}
			/>
			<Save_File_Modal
				show_save_dialog={show_save_dialog}
				set_show_save_dialog={set_show_save_dialog}
				level_filename_list={level_filename_list}
				builtin_level_filename_list={builtin_level_filename_list}
				_Asset_Manager={props._Asset_Manager}
				_Tilemap_Manager={props._Tilemap_Manager}
				set_Tilemap_Manager={props.set_Tilemap_Manager}
			/>
			<Generate_Map_Modal
				show_generate_map_dialog={show_generate_map_dialog}
				set_show_generate_map_dialog={set_show_generate_map_dialog}
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
			<Unit_Palette_Drawer
				show_unit_palette_drawer={show_unit_palette_drawer}
				set_show_unit_palette_drawer={set_show_unit_palette_drawer}
				selected_creature_type={selected_creature_type}
				set_selected_creature_type={set_selected_creature_type}
				selected_creature_direction={selected_creature_direction}
				set_selected_creature_direction={set_selected_creature_direction}
				selected_creature_team={selected_creature_team}
				set_selected_creature_team={set_selected_creature_team}
				_Asset_Manager={props._Asset_Manager}
			/>
			<Tile_Palette_Drawer
				show_tile_palette_drawer={show_tile_palette_drawer}
				set_show_tile_palette_drawer={set_show_tile_palette_drawer}
				selected_tile_type={selected_tile_type}
				set_selected_tile_type={set_selected_tile_type}
				_Asset_Manager={props._Asset_Manager}
			/>
			<Canvas_View
				assets_loaded={props.assets_loaded}
				connect_context_to_blit_manager={props.connect_context_to_blit_manager}
				_Tilemap_Manager={props._Tilemap_Manager()}
				dimensions={props.dimensions}
				handle_canvas_click={handle_canvas_click}
				handle_canvas_keys_down={editor_handle_canvas_keys_down}
				handle_canvas_mouse_move={editor_handle_canvas_mouse_move}
			/>
			{
				render_tick > 0
				&&
				<Editor_Tooltip_Manager
					cursor_pos={tile_cursor_pos}
					show_tooltip={true}
					_Asset_Manager={props._Asset_Manager}
					_Blit_Manager={props._Blit_Manager}
					_Tilemap_Manager={props._Tilemap_Manager}
					render_ticktock={render_tick % 1 == 1}
				/>
			}

		</div>
	</div>;
}








