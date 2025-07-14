import { Point2D } from "../../../interfaces";
import { Vals } from "../../constants/Constants";
import { Asset_Manager_Data } from "../../engine/Asset_Manager/Asset_Manager";
import { Blit_Manager_Data, Blit_Manager_ƒ } from "../../engine/Blit_Manager";
import { Tilemap_Manager_Data, Tilemap_Manager_ƒ } from "../../engine/Tilemap_Manager/Tilemap_Manager";
import { constrain_point_within_rect, is_within_rectangle } from "../../engine/Utils";



export type EditorTooltip_Data = {
	pos: Point2D,
	tile_pos: Point2D,
	tile_name: string,
};

export const Editor_Tooltip_Manager = (props: {
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
			left: `${ 100.0 * (props.pos.x / Vals.default_canvas_size.x) }%`,
			top: `${ 100.0 * (props.pos.y / Vals.default_canvas_size.y) }%`
		}}
	>
		<div className="data-row">{`${props.tile_pos.x}, ${props.tile_pos.y}`}</div>
		<div className="data-row">{`${props.tile_name}`}</div>
	</div>
}
