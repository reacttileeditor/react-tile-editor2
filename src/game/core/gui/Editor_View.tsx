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

type Editor_Map_Generation_Types = 'true_random' | 'blob_regions';


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
				<Tooltip_Manager
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

export const Tile_Palette_Drawer = (props: {
	show_tile_palette_drawer: boolean,
	set_show_tile_palette_drawer: Dispatch<SetStateAction<boolean>>,
	selected_tile_type: Tile_Name,
	set_selected_tile_type: Dispatch<SetStateAction<Tile_Name>>,
	_Asset_Manager: () => Asset_Manager_Data,
}) => {



	const tile_type_list: Array<Tile_Name> = Asset_Manager_ƒ.yield_tile_name_list(props._Asset_Manager());

	return <Drawer
		open={props.show_tile_palette_drawer}
		onClose={() => props.set_show_tile_palette_drawer(false)}
		size={'25rem'}
		className="Unit_Palette_Drawer"
	>
		<Drawer.Header>
			<Drawer.Title>Tiles</Drawer.Title>
			<Drawer.Actions>

			</Drawer.Actions>
		</Drawer.Header>
		<Drawer.Body>
			<div className="unit-palette">
				{
					map( (tile_type)=>(
						<div
							className={`creature_instance ${tile_type == props.selected_tile_type ? 'selected' : ''}`}
							key={`${tile_type}`}
							onClick={(evt)=>{
								props.set_selected_tile_type(tile_type)
							}}
						>
							<Tile_Palette_Element
								asset_manager={props._Asset_Manager()}
								tile_name={tile_type}
								asset_list={[]}
								use_black_background={true}
								highlight={false}
								handle_click={ ()=>{} }
								canvas_size={ {x: 70, y: 70} }
							/>
						</div>
					),
					tile_type_list)
				}
			</div>
		</Drawer.Body>
	</Drawer>
}

export const Unit_Palette_Drawer = (props: {
	show_unit_palette_drawer: boolean,
	set_show_unit_palette_drawer: Dispatch<SetStateAction<boolean>>,
	selected_creature_type: Creature_Type_Name,
	set_selected_creature_type: Dispatch<SetStateAction<Creature_Type_Name>>,
	selected_creature_direction: Direction,
	set_selected_creature_direction: Dispatch<SetStateAction<Direction>>,
	selected_creature_team: number,
	set_selected_creature_team: Dispatch<SetStateAction<number>>,
	_Asset_Manager: () => Asset_Manager_Data,
}) => {


	const set_direction = (input: number) => {
		props.set_selected_creature_direction( Directions[input]);
	}



	const creature_list: Array<Creature_Type_Name> = Creature_ƒ.list_all_creature_types();

	return <Drawer
		open={props.show_unit_palette_drawer}
		onClose={() => props.set_show_unit_palette_drawer(false)}
		size={'25rem'}
		className="Unit_Palette_Drawer"
	>
		<Drawer.Header>
			<Drawer.Title>Units</Drawer.Title>
			<Drawer.Actions>

			</Drawer.Actions>
		</Drawer.Header>
		<Drawer.Body>
			<div className="team-selection">
				<Dropdown title={`Team #${props.selected_creature_team}`}>
					{
						map( (team_number)=>(
							<Dropdown.Item
								key={team_number}
								onSelect={ (eventKey: string, evt)=>{
									props.set_selected_creature_team(team_number)
								} }
								active={props.selected_creature_team == team_number}
							>Team #{team_number}</Dropdown.Item>
						),
						[1,2,3])
					}
				</Dropdown>
			</div>
			<div className="team-selection">
				<Slider
					min={0}
					max={Directions.length - 1}
					value={indexOf(props.selected_creature_direction, Directions)}
					className="team-slider"
					handleStyle={{
					borderRadius: 10,
					color: '#fff',
					fontSize: 12,
					width: 32,
					height: 22
					}}
					graduated
					tooltip={false}
					handleTitle={props.selected_creature_direction}
					onChange={set_direction}
				/>
			</div>
			<div className="unit-palette">
				{
					map( (creature_type)=>(
						<div
							className={`creature_instance ${creature_type == props.selected_creature_type ? 'selected' : ''}`}
							key={`${Creature_ƒ.get_delegate(creature_type).yield_creature_image()}`}
							onClick={(evt)=>{
								props.set_selected_creature_type(creature_type)
							}}
						>
							<Tile_Palette_Element
								asset_manager={props._Asset_Manager()}
								tile_name={''}
								asset_list={[{
									id: `${Creature_ƒ.get_delegate(creature_type).yield_creature_image()}`,
									zorder: zorder.rocks,
								}]}
								use_black_background={true}
								highlight={false}
								handle_click={ ()=>{} }
								canvas_size={ {x: 70, y: 70} }
								centering_offset={ {x: 0, y: -0.8} }
							/>
						</div>
					),
					creature_list)
				}
			</div>
		</Drawer.Body>
	</Drawer>
}



export const Save_File_Modal = (props: {
	show_save_dialog: boolean,
	set_show_save_dialog: Dispatch<SetStateAction<boolean>>,
	level_filename_list: Array<string>,
	builtin_level_filename_list: Array<string>,
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
			_.map(props.builtin_level_filename_list, (val, idx)=>(
				<List.Item
					key={idx}
					onClick={()=>{
						set_selected_file(val);
					}}
					className={ val == selected_file ? 'selected' : ''}
				>
					<span>
						<Whisper placement='top' speaker={<Tooltip>{"This file is built into the source code, and can neither be deleted nor overwritten."}</Tooltip>}>
							<Icon as={BsFileEarmarkLock2} className="file-icon"/>
						</Whisper>
						{val}
						</span>
				</List.Item>
			))

		}
		{
			_.map(props.level_filename_list, (val, idx)=>(
				<List.Item
					key={idx}
					onClick={()=>{set_selected_file(val)}}
					className={ val == selected_file ? 'selected' : ''}
				>
					<span><Icon as={BsFileEarmark} className="file-icon"/>{val}</span>
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
				disabled={
					selected_file == ''
					||
					includes(selected_file, props.builtin_level_filename_list)
				}
				onClick={ () => { 
					Tilemap_Manager_ƒ.save_level(props._Tilemap_Manager(), props._Asset_Manager(), props.set_Tilemap_Manager, selected_file, props.level_filename_list)
					props.set_show_save_dialog(false)
				}}
			>Save</Button>
		</div>
	</Modal>
}

export const Generate_Map_Modal = (props: {
	show_generate_map_dialog: boolean,
	set_show_generate_map_dialog: Dispatch<SetStateAction<boolean>>,
	_Asset_Manager: () => Asset_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}) => {
	const [generation_type, set_generation_type] = useState<Editor_Map_Generation_Types>('blob_regions');
	const [deletion_target, set_deletion_target] = useState<string>('');

	return <Modal
		open={props.show_generate_map_dialog}
		onClose={()=>props.set_show_generate_map_dialog(false)}
		className="Generate_Map_Modal"
	>
		<h3>Generate Map</h3>
		<div className="label"><p>This will replace all of the tile data for the current map with a new, randomly generated set of tiles.  The map bounds are whatever your current map is set to.</p> <p>There are multiple options for generation:</p></div>
	
		<RadioTileGroup
			defaultValue="blob_regions"
			value={generation_type}
			onChange={(value: string|number, event)=>{set_generation_type(value as unknown as Editor_Map_Generation_Types) }}
		>
			<RadioTile icon={<Icon as={GiPerspectiveDiceSixFacesOne} />} label="True Random" value="true_random">
				Generates a map by randomly filling each map tile with one of the possible known tile types.  The simplest and first thing we coded.
			</RadioTile>
			<RadioTile icon={<Icon as={GiSpatter} />} label="Blob Regions" value="blob_regions">
				Generates a bunch of contiguous geographic regions composed of a single tile type.
			</RadioTile>

		</RadioTileGroup>

		<div className="button-strip">
			<Button
				appearance="subtle"
				onClick={ () => { 
					props.set_show_generate_map_dialog(false)
				}}
			>Cancel</Button>
			<Button
				disabled={false}
				onClick={ () => {
					if(generation_type == 'true_random'){
						props.set_Tilemap_Manager(
							Map_Generation_ƒ.initialize_tiles_random(props._Tilemap_Manager(), props._Asset_Manager())
						);
					} else {
						props.set_Tilemap_Manager(
							Map_Generation_ƒ.initialize_tiles_blob(props._Tilemap_Manager(), props._Asset_Manager())
						);
					}
					props.set_show_generate_map_dialog(false);
				}}
			>Generate</Button>
		</div>
	</Modal>
}


export const Edit_Metadata_Modal = (props: {
	show_metadata_dialog: boolean,
	set_show_metadata_dialog: Dispatch<SetStateAction<boolean>>,
	level_metadata: Tilemap_Metadata,
	_Asset_Manager: () => Asset_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	set_Tilemap_Manager: (newVal: Tilemap_Manager_Data) => void,
}) => {
	const [origin_x, set_origin_x] = useState<number>(0);
	const [origin_y, set_origin_y] = useState<number>(0);

	const [grow_x, set_grow_x] = useState<number>(0);
	const [grow_x2, set_grow_x2] = useState<number>(0);
	const [grow_y, set_grow_y] = useState<number>(0);
	const [grow_y2, set_grow_y2] = useState<number>(0);


	useEffect(() => {
		reset_values();
	}, [props.level_metadata]);

	const reset_values = () => {
		set_origin_x(props.level_metadata.origin.x);
		set_origin_y(props.level_metadata.origin.y);
		set_grow_x(0);
		set_grow_x2(0);
		set_grow_y(0);
		set_grow_y2(0);
	}


	return <Modal
		open={props.show_metadata_dialog}
		onClose={()=>{
			reset_values();
			props.set_show_metadata_dialog(false);
		}}
		className="Save_File_Modal"
		//@ts-ignore
		onKeyDown={(evt)=>{
			evt.stopPropagation();
		}}
	>
		<h3>Edit Metadata</h3>
		<div className="label">This allows you to grow/shrink the map along the x/y axes.  Positive values add rows or columns, negative values remove them.</div>
		<div className="input-grid-sizes">
			<div className="spacer"/>
			<div className="input-pair">
				<Input
					value={grow_y}
					type="number"
					onChange={(value: string, event) => { set_grow_y(toNumber(value)) }}		
				/>
			</div>
			<div className="spacer"/>

			<div className="input-pair">
				<Input
					value={grow_x}
					type="number"
					onChange={(value: string, event) => { set_grow_x(toNumber(value)) }}		
				/>
			</div>
			<div className="image"/>
			<div className="input-pair">
				<Input
					value={grow_x2}
					type="number"
					onChange={(value: string, event) => { set_grow_x2(toNumber(value)) }}		
				/>
			</div>

			<div className="spacer"/>
			<div className="input-pair">
				<Input
					value={grow_y2}
					type="number"
					onChange={(value: string, event) => { set_grow_y2(toNumber(value)) }}		
				/>
			</div>
			<div className="spacer"/>
		</div>
		<div className="label">Origin was added to potentially allow "auto-adjusting" map script locations in the future, if rows are added/removed from the top or left side of the map.  We're leaving the bindings here since we may want to use it later.</div>
		<div className="input-strip">
			<div className="input-pair">
				<div className="label">Origin X:</div>
				<Input
					value={origin_x}
					type="number"
					disabled
					onChange={(value: string, event) => { set_origin_x(toNumber(value)) }}		
				/>
			</div>
			<div className="input-pair">
				<div className="label">Origin Y:</div>
				<Input
					value={origin_y}
					type="number"
					disabled
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
					props.set_Tilemap_Manager({
						...props._Tilemap_Manager(),
						metadata: Tilemap_Manager_ƒ.set_metadata(props._Tilemap_Manager(), {
							origin: {
								x: origin_x,
								y: origin_y,
							}
						}).metadata,
						tile_maps: Tilemap_Manager_ƒ.expand_tile_map(props._Tilemap_Manager(), {
							grow_x: grow_x,
							grow_x2: grow_x2,
							grow_y: grow_y,
							grow_y2: grow_y2,
						}).tile_maps
					});
					props.set_show_metadata_dialog(false)
				}}
			>Save</Button>
		</div>
	</Modal>
}



export type EditorTooltip_Data = {
	pos: Point2D,
	tile_pos: Point2D,
	tile_name: string,
};

export const Tooltip_Manager = (props: {
	cursor_pos: Point2D,
	_Asset_Manager: () => Asset_Manager_Data,
	_Blit_Manager: () => Blit_Manager_Data,
	_Tilemap_Manager: () => Tilemap_Manager_Data,
	render_ticktock: boolean,
	show_tooltip: boolean,
}) => {

	const show_tooltip = props.show_tooltip
		&& is_within_rectangle (
			Blit_Manager_ƒ.yield_absolute_coords_for_world_coords(
				props._Blit_Manager(),
				Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( props._Tilemap_Manager(), props._Asset_Manager(), props.cursor_pos)
			),
			Vals.default_canvas_rect
		);

	const get_tooltip_data = (_TM: Tilemap_Manager_Data, _AM: Asset_Manager_Data, _BM: Blit_Manager_Data): EditorTooltip_Data => ({
		pos: constrain_point_within_rect(
			Blit_Manager_ƒ.yield_absolute_coords_for_world_coords(
				_BM,
				Tilemap_Manager_ƒ.convert_tile_coords_to_pixel_coords( _TM, _AM, props.cursor_pos)
			),
			Vals.default_canvas_rect
		),
		tile_pos: props.cursor_pos, //Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords( _TM, _AM, _BM, props.cursor_pos ),
		tile_name: Tilemap_Manager_ƒ.get_tile_name_for_pos(
			_TM,
			props.cursor_pos, //Tilemap_Manager_ƒ.convert_pixel_coords_to_tile_coords( _TM, _AM, _BM, props.cursor_pos ),
			'terrain',
		),
	});


	return <div className={`map-tooltip-anchor`} style={{display: `${show_tooltip ? 'block' : 'none'}`}}>
		{
			<Map_Tooltip
				{...get_tooltip_data( props._Tilemap_Manager(), props._Asset_Manager(), props._Blit_Manager())}
			/>
		}
	</div>
}

const Map_Tooltip = (props: EditorTooltip_Data) => {



	return <div
		className="map-tooltip"
		style={{
			left: `${props.pos.x * 2}px`,
			top: `${props.pos.y * 2}px`
		}}
	>
		<div className="data-row">{`${props.tile_pos.x}, ${props.tile_pos.y}`}</div>
		<div className="data-row">{`${props.tile_name}`}</div>
	</div>
}
