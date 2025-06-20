

export type Palette_Names = 'team1' | 'team2' | 'team3';


export type Palette_List = {
	[Property in Palette_Names as `${string & Property}`]: Palette_Data
};

export type Palette_Data = {
	val: number,
};

export const palette_list: Palette_List = {
	'team1': {
		val: 20,
	},
	'team2': {
		val: 100,
	},
	'team3': {
		val: 200
	},

}