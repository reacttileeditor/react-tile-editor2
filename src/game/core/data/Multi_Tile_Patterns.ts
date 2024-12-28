import { Point2D } from "../../interfaces";
import { zorder } from "../constants/zorder";
import { Static_Values, Tile_Item } from "../engine/Asset_Manager/Asset_Manager";
import { Tile_Name } from "./Tile_Types";



type MTP_Restrictions = Array<Array<RegExp>>;

export type Multi_Tile_Pattern = {
	name: Tile_Name,

	patterns: Array<MTP_Variant_Item>,
};

interface MTP_Variant_Item {
	restrictions: MTP_Restrictions,
	claims: Array<Array<boolean>>,
	graphics: Array<MTP_Graphic_Item>,
};

export type MTP_Graphic_Item = {
	asset_variants: Array<string>,
	zorder: number,
	anchor: Point2D,
};

export type MTP_Anchor_Data = {
	location: Point2D,
	graphic: string,
	zorder: number,
}

/*
	`name` needs to match the particular tile type we're replacing.

	`restrictions` lines are variable-length, but are all flush-left when being processed.

	`anchor` represents the tile where the actual graphic will be placed.
*/
export const multi_tile_types: Array<Multi_Tile_Pattern> = [
	{
		name: "menhir-big",
		patterns: [{
			restrictions:	[
				[/.*/,	/.*/,	/.*/,		/.*/],
					[/.*/, /menhir-big/,	/.*/, /.*/],
				[/.*/,	/menhir-big/,	/menhir-big/,	/.*/],
					[/.*/, /menhir-big/,	/.*/, /.*/],
				[/.*/,	/.*/,	/.*/,		/.*/],
			],
			claims:	[
				[false,	false,	false,	false],
					[false, true,	false,	false],
				[false,	true,	true,	false],
					[false,	true,	false,	false],
				[false,	false,	false,	false],
			],
			graphics: [{
				asset_variants: [
					'menhir2_mtp_1',
					'menhir_big_mtp_4',
				],
				zorder: zorder.rocks,
				anchor: {x: 1, y: 2},
			},{
				asset_variants: [
					'menhir2_mtp_1b',
				],
				zorder: zorder.grass,
				anchor: {x: 1, y: 2},
			}],
		},{
			restrictions:	[
				[/.*/,	/.*/,	/.*/,		/.*/],
					[/.*/, /menhir-big/,	/.*/, /.*/],
				[/.*/,	/menhir-big/,	/menhir-big/,	/.*/],
					[/.*/,	/.*/,	/.*/, /.*/],
				[/.*/,	/.*/,	/.*/,		/.*/],
			],
			claims:	[
				[false,	false,	false,	false],
					[false, true,	false,	false],
				[false,	true,	true,	false],
					[false,	false,	false,	false],
				[false,	false,	false,	false],
			],
			graphics: [{
				asset_variants: [
					'menhir2_mtp_2',
				],
				zorder: zorder.rocks,
				anchor: {x: 1, y: 2},
			},{
				asset_variants: [
					'menhir2_mtp_2b',
				],
				zorder: zorder.grass,
				anchor: {x: 1, y: 2},
			}],
		},{
			restrictions:	[
				[/.*/,	/.*/,	/.*/,		/.*/],
					[/.*/,	/menhir-big/,	/.*/,	/.*/],
				[/.*/, /menhir-big/,	/.*/,	/.*/]
			],
			claims:	[
				[false,	false,	false,	false],
					[false,	true,	false,	false],
				[false,	true,	false,	false],
			],
			graphics: [{
				asset_variants: [
					'menhir2_mtp_3',
				],
				zorder: zorder.rocks,
				anchor: {x: 1, y: 2},
			},{
				asset_variants: [
					'menhir2_mtp_3b',
				],
				zorder: zorder.grass,
				anchor: {x: 1, y: 2},
			}],
		}],
	}
];

