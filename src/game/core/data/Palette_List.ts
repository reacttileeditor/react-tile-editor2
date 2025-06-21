import convert from "color-convert";
import { HEX } from "color-convert";

export type Palette_Names = 'team1' | 'team2' | 'team3';


export type Palette_List = {
	[Property in Palette_Names as `${string & Property}`]: Palette_Data
};

export type Palette_Data = {
	pairs: Array<Color_Pair>,
};

export const palette_list: Palette_List = {
	'team1': {
		pairs: [
			['400133', '400a01'],
			['50013f', '500d01'],
			['5f014b', '5f0f01'],
			['6c0155', '6c1101'],
			['86016a', '861401'],
			['980178', '981701'],
			['b2088e', 'b22108'],
			['c618a3', 'c62f18'],
			['dd30b9', 'dd4830'],
			['eb47c9', 'eb5e47'],
			['ff55db', 'ff6e55'],
			['fb80e0', 'fb9380'],
			['ffa1eb', 'ffafa1'],
			['ffbff1', 'ffc9bf'],
			['ffd2f5', 'ffd9d2'],
			['ffe9fa', 'ffede9']
		],
	},
	'team2': {
		pairs: [
			['400133', '400a01'],
			['50013f', '500d01'],
			['5f014b', '5f0f01'],
			['6c0155', '6c1101'],
			['86016a', '861401'],
			['980178', '981701'],
			['b2088e', 'b22108'],
			['c618a3', 'c62f18'],
			['dd30b9', 'dd4830'],
			['eb47c9', 'eb5e47'],
			['ff55db', 'ff6e55'],
			['fb80e0', 'fb9380'],
			['ffa1eb', 'ffafa1'],
			['ffbff1', 'ffc9bf'],
			['ffd2f5', 'ffd9d2'],
			['ffe9fa', 'ffede9']
		],
	},
	'team3': {
		pairs: [
			['400133', '400a01'],
			['50013f', '500d01'],
			['5f014b', '5f0f01'],
			['6c0155', '6c1101'],
			['86016a', '861401'],
			['980178', '981701'],
			['b2088e', 'b22108'],
			['c618a3', 'c62f18'],
			['dd30b9', 'dd4830'],
			['eb47c9', 'eb5e47'],
			['ff55db', 'ff6e55'],
			['fb80e0', 'fb9380'],
			['ffa1eb', 'ffafa1'],
			['ffbff1', 'ffc9bf'],
			['ffd2f5', 'ffd9d2'],
			['ffe9fa', 'ffede9']
		],
	},

}

type Color_Pair = [HEX, HEX];