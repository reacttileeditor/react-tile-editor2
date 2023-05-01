declare module 'perlin-simplex';

class SimplexNoise {
	constructor(Math?: {random: ()=>number});
	dot: (g: number, x: number, y: number) => number;
	dot3: (g: number, x: number, y: number, z: number) => number;
	noise: (xin: number, yin: number) => number;
};