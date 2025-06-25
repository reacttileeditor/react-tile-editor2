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
			['400133', '010f40'],
			['50013f', '011250'],
			['5f014b', '01165f'],
			['6c0155', '01186c'],
			['86016a', '011e86'],
			['980178', '012298'],
			['b2088e', '082db2'],
			['c618a3', '1840c6'],
			['dd30b9', '3057dd'],
			['eb47c9', '476ceb'],
			['ff55db', '557aff'],
			['fb80e0', '809afb'],
			['ffa1eb', 'a1b6ff'],
			['ffbff1', 'bfccff'],
			['ffd2f5', 'd2dbff'],
			['ffe9fa', 'e9edff']
		],
	},
	'team3': {
		pairs: [
			['400133', '001f06'],
			['50013f', '002908'],
			['5f014b', '00330a'],
			['6c0155', '003d0b'],
			['86016a', '00540d'],
			['980178', '00680f'],
			['b2088e', '048815'],
			['c618a3', '0ba51d'],
			['dd30b9', '17c82c'],
			['eb47c9', '24de3b'],
			['ff55db', '2cff48'],
			['fb80e0', '4ff86b'],
			['ffa1eb', '72ff8c'],
			['ffbff1', '9affaf'],
			['ffd2f5', 'b7ffc6'],
			['ffe9fa', 'dbffe3']
		],
	},

}

type Color_Pair = [HEX, HEX];