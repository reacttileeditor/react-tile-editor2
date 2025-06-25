import { Dispatch, SetStateAction, useState } from "react";
import { Asset_Manager_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { Button, List, Modal, Tooltip, Whisper } from "rsuite";
import { Icon, Trash } from "@rsuite/icons";
import { BsFileEarmark, BsFileEarmarkLock2 } from "react-icons/bs";
import { includes } from "ramda";
import { map } from "lodash";
import { IconType } from "react-icons";

export const Load_File_Modal = (props: {
	show_load_dialog: boolean,
	set_show_load_dialog: Dispatch<SetStateAction<boolean>>,
	level_filename_list: Array<string>,
	builtin_level_filename_list: Array<string>,
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
			map(props.builtin_level_filename_list, (val, idx)=>(
				<List.Item
					key={idx}
					onClick={()=>{
						set_selected_file(val);
					}}
					className={ val == selected_file ? 'selected' : ''}
				>
					<span>
						<Whisper placement='top' speaker={<Tooltip>{"This file is built into the source code, and can neither be deleted nor overwritten."}</Tooltip>}>
							<Icon as={BsFileEarmarkLock2 as React.ElementType} className="file-icon"/>
						</Whisper>
						{val}
						</span>
				</List.Item>
			))

		}
		{
			map(props.level_filename_list, (val, idx)=>(
				<List.Item
					key={idx}
					onClick={()=>{
						set_selected_file(val)
					}}
					className={ val == selected_file ? 'selected' : ''}
				>
					<span><Icon as={BsFileEarmark as React.ElementType} className="file-icon"/>{val}</span> 
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
					if( includes(selected_file, props.builtin_level_filename_list) ){
						Tilemap_Manager_ƒ.load_builtin_level(props.set_Tilemap_Manager, selected_file);
					} else {
						Tilemap_Manager_ƒ.load_level(props._Tilemap_Manager(), props._Asset_Manager(), props.set_Tilemap_Manager, selected_file);
					}
					props.set_show_load_dialog(false);
				}}
			>Load</Button>
		</div>
	</Modal>
}
