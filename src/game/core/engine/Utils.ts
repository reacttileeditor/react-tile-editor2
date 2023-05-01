import _ from "lodash";
import Prando from 'prando';
import { Point2D, Rectangle } from '../../interfaces';
import { PRNG } from './prng';
import 'perlin-simplex';


/*----------------------- utility functions -----------------------*/
export const dice = (sides: number) => (
	Math.floor( Math.random() * sides ) + 1
)

export const dice_anchored_on_specific_random_seed = (sides: number, seed: Prando) => (
	Math.floor( seed.next() * sides ) + 1
)

export const is_even = (value : number) => (
	modulo(value, 2) == 0
)

export const modulo = (numerator: number, denominator: number): number => (
	/*
		This is a real modulo function; not a "remainder operation", which is what the % generally does.  They're equivalent for positive numbers, but anything involving negative operations (such as winding a proverbial clock, set to 1 o'clock, backwards by 3 hours) won't give the correct results if you're simply using the % operator.
	*/

	(numerator % denominator + denominator) % denominator
)

export const ƒ = {
	if: (test: boolean, true_case: unknown, false_case?:unknown) => {
		//because ternaries have awful legibility, but we need a "expression" rather than the "statement" provided by a builtin if() clause.  We need something terse that resolves to a value.
		if( test ){
			return lazy_evaluate(true_case);
		} else {
			if( !_.isUndefined(false_case) ){
				return lazy_evaluate(false_case);
			} else {
				return undefined;
			}
		}
	},
	dump: (expr: any):any => {
		console.log(expr);
		return expr;
	},
	tween: (thing_one: number, thing_two: number, proportion: number) => (
		thing_one*(proportion) + thing_two*(1.0-proportion)
	),
	tween_points: (thing_one: Point2D, thing_two: Point2D, proportion: number) => (
		{
			x: ƒ.tween(thing_one.x, thing_two.x, proportion),
			y: ƒ.tween(thing_one.y, thing_two.y, proportion)
		}
    ),
    round_point_to_nearest_pixel: (source: Point2D):Point2D => (
        {
            x: Math.round(source.x),
            y: Math.round(source.y),
        }
    ),
}

const lazy_evaluate = (param: unknown) => {
	if(typeof(param) == 'function'){
		return param();
	} else {
		return param;	
	}
}

export const convert_bitmask_to_array_of_individual_bit_values = (byteVal: any) => {
	var res = [] as Array<number>;
	
	while(byteVal){
		res.push(byteVal & 1);
		byteVal >>= 1;
	}

	return res;
}

//Initialize the simplex noise with a constant random value, vs the default
//random random value. This way, we'll always get the same noise.
//4: Chosen by fair dice roll. Guaranteed to be random.
const perlin = new SimplexNoise({random: new PRNG(4).float});

/// Returns a perlin-noise-based frameOffset at hex X/Y, useful for things like water.
/// maxFrameOffset: The most frames we can offset. Exclusive, so 3 would yield offsets of 0, 1, and 2.
/// hexX / hexY: The hex tile coordinates.
/// scale: Optional. A larger scale yields rougher noise. Defaults to 0.15, which seems nice?
export const waterCycleFrameOffset = (maxFrameOffset: number, hexX:number, hexY:number, scale=0.15) => 
	Math.floor((perlin.noise(
		scale * (hexX + hexY % 2 * 0.5),
		scale * hexY,
	) + 1) / 2 * maxFrameOffset)