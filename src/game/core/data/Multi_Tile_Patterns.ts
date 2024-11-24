import { Point2D } from "../../interfaces";
import { zorder } from "../constants/zorder";
import { StaticValues, TileItem } from "../engine/Asset_Manager";
import { TileName } from "./Tile_Types";



type MTP_Restrictions = Array<Array<RegExp>>;

export type Multi_Tile_Pattern = {
	name: TileName,

	variants: Array<MTP_Variant_Item>,
};

interface MTP_Variant_Item {
	graphics: MTP_Graphic_Item,
};

type MTP_Graphic_Item = {
	id: string,
	zorder: number,
	restrictions: MTP_Restrictions,
	claims: Array<Array<boolean>>,
	anchor: Point2D,
};

export type MTP_Anchor_Data = {
	location: Point2D,
	graphic: string,
}

/*
	`name` needs to match the particular tile type we're replacing.

	`restrictions` lines are variable-length, but are all flush-left when being processed.

	`anchor` represents the tile where the actual graphic will be placed.
*/
export const multi_tile_types: Array<Multi_Tile_Pattern> = [
	{
		name: "menhir2",
		variants: [{
			graphics: {
				id: 'menhir2_mtp_1',
				zorder: zorder.rocks,
				restrictions:	[
					[/.*/,	/.*/,	/.*/,		/.*/],
						[/.*/, /menhir2/,	/.*/, /.*/],
					[/.*/,	/menhir2/,	/menhir2/,	/.*/],
						[/.*/, /menhir2/,	/.*/, /.*/],
					[/.*/,	/.*/,	/.*/,		/.*/],
		],
				claims:	[
					[false,	false,	false,	false],
						[false, true,	false,	false],
					[false,	true,	true,	false],
						[false,	true,	false,	false],
					[false,	false,	false,	false],
				],
				anchor: {x: 1, y: 3},
			},
		},{
			graphics: {
				id: 'multi-tile-pattern-test2',
				zorder: zorder.rocks,
				restrictions:	[
					[/.*/,	/.*/,	/.*/,		/.*/],
						[/.*/, /menhir2/,	/.*/, /.*/],
					[/.*/,	/.*/,	/menhir2/,	/.*/],
						[/.*/, /menhir2/,	/.*/, /.*/],
					[/.*/,	/.*/,	/.*/,		/.*/],
		],
				claims:	[
					[false,	false,	false,	false],
						[false, true,	false,	false],
					[false,	false,	true,	false],
						[false,	true,	false,	false],
					[false,	false,	false,	false],
				],
				anchor: {x: 1, y: 3},
			},
		},{
			graphics: {
				id: 'multi-tile-pattern-test1',
				zorder: zorder.rocks,
				restrictions:	[
					[/.*/,	/.*/,	/.*/,		/.*/],
						[/.*/,	/menhir2/,	/.*/,	/.*/],
					[/.*/, /menhir2/,	/.*/,	/.*/]
				],
				claims:	[
					[false,	false,	false,	false],
						[false,	true,	false,	false],
					[false,	true,	false,	false],
				],
				anchor: {x: 1, y: 2},
			},
		}],
	}
];

