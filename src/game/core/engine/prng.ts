// Adapted from https://gist.github.com/blixt/f17b47c62508be59987b
// Thank you, blixt!

// NOTICE 2020-04-18
// Please see the comments below about why this is not a great PRNG.

// Read summary by @bryc here:
// https://github.com/bryc/code/blob/master/jshash/PRNGs.md

// Have a look at js-arbit which uses Alea:
// https://github.com/blixt/js-arbit

/**
 * Creates a pseudo-random value generator. The seed must be an integer.
 *
 * Uses an optimized version of the Park-Miller PRNG.
 * http://www.firstpr.com.au/dsp/rand31/
 */
export class PRNG {
	private seed: number
	
	constructor(seed: number) {
		this.seed = Math.abs(seed) % 2147483647
		this.int() //Digest the initial value, which is rarely random.
	}

	/**
	 * Returns a pseudo-random value between 1 and 2^32 - 2.
	 */
	int = ():number => {
		return this.seed = this.seed * 16807 % 2147483647;
	};


	/**
	 * Returns a pseudo-random floating point number in range [0, 1).
	 */
	float = (min=1, max?:number): number => {
		if (max === undefined) { max = min; min = 0 }
		const range = max - min;
		//We know that result of next() will be 1 to 2147483646 (inclusive).
		return ((this.int() - 1)/2147483646)*range + min;
	};
}