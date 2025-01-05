import _ from "lodash";
import Prando from 'prando';
import { Point2D, Rectangle } from '../../interfaces';
import { useEffect, useRef } from "react";
import { map, reduce } from "ramda";



/*----------------------- utility functions -----------------------*/
export const dice = (sides: number) => (
	Math.floor( Math.random() * sides ) + 1
)

export const dice_weighted = (sides: number, easing_func: (val: number)=>number ) => (
	Math.floor( easing_func(Math.random()) * sides ) + 1
)

export const dice_anchored_on_specific_random_seed = (sides: number, seed: Prando) => (
	Math.floor( seed.next() * sides ) + 1
)

export const is_even = (value : number) => (
	modulo(value, 2) == 0
)

export const is_odd = (value : number) => (
	modulo(value, 2) == 1
)

export const is_all_true = (things: Array<boolean>): boolean => (
	reduce(
		(acc: boolean, item: boolean)=>(acc && item),
		true,
		things
	)
);

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

export const useInterval = (callback: Function, delay: number) => {
	//https://overreacted.io/making-setinterval-declarative-with-react-hooks/
	const savedCallback = useRef<Function>( ()=>{} );
  
	// Remember the latest callback.
	useEffect(() => {
	  savedCallback.current = callback;
	}, [callback]);
  
	// Set up the interval.
	useEffect(() => {
	  function tick() {
		savedCallback.current();
	  }
	  if (delay !== null) {
		let id = setInterval(tick, delay);
		return () => clearInterval(id);
	  }
	}, [delay]);
  }


export const angle_between = (p: {source: Point2D, dest: Point2D}): number => (
	Math.atan2( p.dest.y - p.source.y , p.dest.x - p.source.x )
)


export const is_within_rectangle = (point: Point2D, rect: Rectangle): boolean => (
	point.x > rect.x &&
	point.x < rect.x + rect.w &&
	point.y > rect.y &&
	point.y < rect.y + rect.h
);

export const radianss_to_degrees = (rad: number) => (rad * 180.0) / Math.PI;
export const degrees_to_radians = (deg: number) => (deg * Math.PI) / 180.0;

//  saving this for posterity; it doesn't work for the intended purpose, since it recieves a type of `whatever | undefined`, and we can't do just `whatever` without being verbose, which is the entire thing we're trying to avoid.
// export const fallback_to = <T extends unknown>(param: T, default_val: T ): T => (
// 	param !== undefined ? param as T : default_val
// );

export const add_points = (a: Point2D, b: Point2D): Point2D => (
	{
		x: a.x + b.x,
		y: a.y + b.y
	}
);



/*
	For stuff like random tile animations, we want a solution that will allow us to generate a series of random number sequences which act as "shuffles" of a preformed deck of possibilities.   I.e. if there are 5 animations in a set `[1,2,3,4,5]`, then we want results like `[2,3,5,4,1]` or `[5,1,3,2,4]`.

	The number of possibile permutations of a given set is just the factorial of the size of the set.  It quickly gets obscenely big, even for surprisingly small (single-digit!) integers, so we don't want to precalculate it.   However, there is fortunately a way to look up one of these permutations, deterministically, without having to precalculate all prior permutations in the set (which would be equivalent to having to precalculate all of them)

	https://stackoverflow.com/questions/18681165/shuffle-an-array-as-many-as-possible/18887324#18887324

*/

export const factorial = (n: number): number => {
	return	n <= 0
			?
			1
			:
			n * factorial(n - 1);
}

export const get_nth_permutation_of_deck = <T>(permutation_number: number, original_array: Array<T>): Array<T> => {
	var temporary_array = original_array.slice(); //Create a copy
	var length = original_array.length;
	var permuted_array = [];
	var pick; 
	
	do {
		pick = permutation_number % length; //mod operator
		permuted_array.push(temporary_array.splice(pick,1)[0]); //Remove item number pick from the old array and onto the new
		permutation_number = (permutation_number - pick)/length;
		length--;
	} while (length >= 1)

	return permuted_array;  
}

export const reorder_array = (original_array: Array<string>, new_order: Array<number>) : Array<string> => {
	return map((val)=>(original_array[val]), new_order)
 }