import { Point2D } from "../../interfaces";
import { zorder } from "../constants/zorder";
import { StaticValues, TileItem } from "../engine/Asset_Manager";
import { TileName } from "./Tile_Types";



type MTP_Restrictions = Array<Array<RegExp>>;

type Multi_Tile_Pattern = {
	name: TileName,

	variants: Array<MTP_Variant_Item>,
};

interface MTP_Variant_Item {
	graphics: Array<MTP_Graphic_Item>,
};

type MTP_Graphic_Item = {
	id: string,
	zorder: number,
	restrictions: MTP_Restrictions,
	anchor: Point2D,
};


/*
	`name` needs to match the particular tile type we're replacing.
*/
export const multi_tile_types: Array<Multi_Tile_Pattern> = [
	{
		name: "menhir2",
		variants: [{
			graphics: [{
				id: 'multi-tile-pattern-test1',
				zorder: zorder.rocks,
				restrictions:	[
						[/.*/,	/.*/,	/.*/],
					[/.*/,	/.*/,	/menhir2/,	/.*/],
						[/.*/,	/menhir2/,	/.*/]
				],
				anchor: {x: 1, y: 2},
			}],
		}],
	}
];

