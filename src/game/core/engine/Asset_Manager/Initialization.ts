import { Dispatch, SetStateAction } from "react";
import { Asset_Manager_Data, Asset_Manager_ƒ, Image_Data } from "./Asset_Manager";
import { cloneDeep, filter, isArray, isObjectLike, isString, map, range, size } from "lodash";
import { is_all_true, log_image_from_canvas, modulo, ƒ } from "../Utils";
import { concat, keys, uniq } from "ramda";
import { Point2D } from "../../../interfaces";
import convert from "color-convert";
import { palette_list, Palette_Names } from "../../data/Palette_List";

var has_launched_app_already = false;

var PATH_PREFIX = "./assets/"


export const Initialization = {

/*----------------------- initialization and asset loading -----------------------*/
	launch_app: (
		me: Asset_Manager_Data,
		do_once_app_ready: ()=>void,
		set_loaded_fraction: Dispatch<SetStateAction<number>>,
	) => {
		console.error('launch app');
		if(!has_launched_app_already){
			map(me.static_vals.image_data_list, ( value, index ) => {

			var temp_image = new Image();
			var temp_url = PATH_PREFIX + value.url;
			
			temp_image.src = temp_url;

			temp_image.onerror = (evt: string|Event) => {
				if( isString(evt) ){ 
					throw new Error(evt)
				} else if (evt != null) {
					if( evt.target != null ){
						throw new Error( `Could not load image with URL: ${(evt.target as HTMLImageElement).src}` )
					}
				}
			}
			// temp_image.onload = () => {
			// 	console.log(`loading ${temp_url} ${temp_image.complete}`)
			// }

			if( me.static_vals.raw_image_list[ index ] == undefined ){
				temp_image.onload = () => {
					console.log(`loading ${temp_url} ${temp_image.complete}`)
					me.static_vals.raw_image_list[ index ] = temp_image;
					

					me.static_vals.assets_meta[ index ] = {
						dim: {
							w: temp_image.naturalWidth,
							h: temp_image.naturalHeight
						},
						bounds: value.bounds,
						preprocessed: false,
					};


					/*
						Here, we're updating some "read from the image" metadata; we want to know the maximum possible sprite size we could be drawing on the screen, so we can do viewport culling and such.  The key distinction for "does bounds exist as a value" is that some assets are whole images (for which bounds doesn't get defined, but it'd be the full width/height of the image file), and for other assets, it's a spritesheet, so we're just clipping out a smaller region of it.

						Regardless, we want to tally up a max size that we ever got.
					*/
					if( value.bounds != undefined ){
						Asset_Manager_ƒ.update_max_asset_sizes(me, {x: value.bounds.w, y: value.bounds.h});
					} else {
						Asset_Manager_ƒ.update_max_asset_sizes(me, {x: temp_image.naturalWidth, y: temp_image.naturalHeight});
					}


					Asset_Manager_ƒ.apply_magic_color_transparency(me, temp_image, index, do_once_app_ready, set_loaded_fraction );
					if( value.uses_palette_swap ){
						Asset_Manager_ƒ.prepare_alternate_palette_colors(
							me,
							value,
							temp_image,
							index
						);
					}

					temp_image.onload = null;
				};
			}
			});

			has_launched_app_already = true;
		}
	},

	update_max_asset_sizes: (
		me: Asset_Manager_Data,
		bounds: Point2D,
	): void => {
		const prior_max_width = me.static_vals.post_loading_metadata.max_asset_width;
		const prior_max_height = me.static_vals.post_loading_metadata.max_asset_height;
		const prior_max_dimension = me.static_vals.post_loading_metadata.max_asset_dimension;

		if(bounds.x > prior_max_width){
			me.static_vals.post_loading_metadata.max_asset_width = bounds.x;
		}
		if(bounds.y > prior_max_height){
			me.static_vals.post_loading_metadata.max_asset_height = bounds.y;
		}
		if(bounds.x > prior_max_dimension){
			me.static_vals.post_loading_metadata.max_asset_dimension = bounds.x;
		}
		if(bounds.y > prior_max_dimension){
			me.static_vals.post_loading_metadata.max_asset_dimension = bounds.y;
		}
	},

	launch_if_all_assets_are_loaded: (
		me: Asset_Manager_Data,
		do_once_app_ready: ()=>void,
		set_loaded_fraction: Dispatch<SetStateAction<number>>,
	) => {
		/*
			There's a big problem most canvas apps have, which is that the canvas will start doing its thing right away and start trying to render, even if you haven't loaded any of the images yet.  What we want to do is have it wait until all the images are done loading, so we're rolling a minimalist "asset manager" here.  The only way (I'm aware of) to tell if an image has loaded is the onload callback.  Thus, we register one of these on each and every image, before attempting to load it.

			Because we carefully wait to populate the values of `loadedAssets` until we're actually **in** the callback, we can just do a size comparison to determine if all of the loaded images are there.
		*/

		const raw_image_list___size = size( me.static_vals.raw_image_list );
		const image_data_list___size = size( me.static_vals.image_data_list );
		const preprocessed_image_list___size =  size(  filter( me.static_vals.assets_meta, (val)=> (val.preprocessed == true) ) );


		set_loaded_fraction( (image_data_list___size + preprocessed_image_list___size) / (raw_image_list___size * 2) );

		if( image_data_list___size == raw_image_list___size) {
			console.log( 'preprocessed:', preprocessed_image_list___size);

			if( preprocessed_image_list___size
				==
				raw_image_list___size
			){

				Asset_Manager_ƒ.do_unit_tests(me)

				do_once_app_ready();
			}
		}
	},

	/*----------------------- multi-tile-pattern preprocessing -----------------------*/
	do_unit_tests: (
		me: Asset_Manager_Data,
	)=>{
		Asset_Manager_ƒ.mtp_unit_tests(me)
	},

	mtp_unit_tests: (
		me: Asset_Manager_Data,
	): boolean => {
		const mtp_data = me.static_vals.multi_tile_types;

		let max_mtp_width = 0;
		let max_mtp_height = 0;

		const is_valid = is_all_true(map(mtp_data, (tile_type)=> (
			is_all_true(map(tile_type.patterns, (variant)=>{

				const restriction_row_sizes = map(variant.restrictions, (row)=>(
					size(row)	
				))

				const claim_row_sizes = map(variant.restrictions, (row)=>(
					size(row)	
				))

				const winnowed = uniq(concat(restriction_row_sizes, claim_row_sizes))

				if( size(winnowed) > 1){
					//row sizes should all be the same, period.

					throw new Error( `MTP has mismatching row sizes.  First graphic asset id: ${variant.graphics[0].asset_variants[0]}` );


					return false;
				} else {
					max_mtp_width = Math.max(max_mtp_width, size(variant.restrictions[0]));
					max_mtp_height = Math.max(max_mtp_height, size(variant.restrictions));

					me.static_vals.post_loading_metadata = {
						...me.static_vals.post_loading_metadata,
						max_mtp_width: max_mtp_width,
						max_mtp_height: max_mtp_height,
					};

					return true;
				}
			}))
		)))

		return is_valid;
	},



	/*----------------------- magic color processing -----------------------*/
	component_to_hex: (c: number): string => {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	},

	rgba_to_hex: (rgba: Uint8ClampedArray): string => {
		return "#" + Asset_Manager_ƒ.component_to_hex(rgba[0]) + Asset_Manager_ƒ.component_to_hex(rgba[1]) + Asset_Manager_ƒ.component_to_hex(rgba[2]) + Asset_Manager_ƒ.component_to_hex(rgba[3]);
	},


	apply_magic_color_transparency: (
		me: Asset_Manager_Data,
		temp_image: HTMLImageElement,
		image_name: string,
		do_once_app_ready: ()=>void,
		set_loaded_fraction: Dispatch<SetStateAction<number>>,
	): void => {

		const osb = document.createElement('canvas');
		osb.width = temp_image.naturalWidth;
		osb.height = temp_image.naturalHeight;
		const osb_ctx = (osb.getContext("2d") as CanvasRenderingContext2D);
		osb_ctx.drawImage(temp_image, 0, 0 );
		const image_data: globalThis.ImageData = osb_ctx.getImageData(0, 0, temp_image.naturalWidth, temp_image.naturalHeight);

		// map( range(temp_image.naturalWidth), (col_val,col_idx) => {
		// 	return 	map( range(temp_image.naturalHeight), (row_val,row_idx) => {
		// 		//const color = osb_ctx.getImageData(col_idx, row_idx, 1, 1).data;

		// 		if( Asset_Manager_ƒ.rgba_to_hex(color) == "#f9303d00"){
		// 			alert('magic color!')
		// 		}
		// 	})
		// })

		// map( image_data.data, (val,idx)=> {
			
		// })

		for (let i = 0; i < image_data.data.length; i += 4) {
			if(
				image_data.data[i + 0] == 249 &&
				image_data.data[i + 1] == 48 &&
				image_data.data[i + 2] == 61
			){
				image_data.data[i + 3] = 0;
			}
		}
		osb_ctx.putImageData(image_data, 0, 0);
		// const new_image = osb.toDataURL();

		// osb.remove()
		//return new_image;

		osb.toBlob((blob: Blob|null) => {
			if(blob != null){
				//const newImg = document.createElement("img");
				const url = URL.createObjectURL(blob);
			
				temp_image.onload = () => {
				// no longer need to read the blob so it's revoked
					URL.revokeObjectURL(url);
					temp_image.onload = null;
				};
			
				temp_image.src = url;

				me.static_vals.assets_meta[ image_name ] = {
					...me.static_vals.assets_meta[ image_name ],
					preprocessed: true,
				}
				Asset_Manager_ƒ.launch_if_all_assets_are_loaded(me, do_once_app_ready, set_loaded_fraction);

			}
		})


	},



	prepare_alternate_palette_colors: (
		me: Asset_Manager_Data,
		image_data: Image_Data,
		image_element: HTMLImageElement,
		image_name: string,
	)=>{
		console.log(`applying team color to ${image_data.url}`);
		
		map(keys(palette_list), (palette_name, index) => {
			const palette_key = palette_name

			const set_image = (new_image_element: HTMLImageElement) => {
				if( !isObjectLike( me.static_vals.raw_image_palette_swap_list[ image_name ] ) ){
					me.static_vals.raw_image_palette_swap_list[ image_name ] = {};
				}
		
				//me.static_vals.raw_image_list[ image_name ] = cloneDeep(new_image_element);

				me.static_vals.raw_image_palette_swap_list[ image_name ][palette_key] = new_image_element;
			}		

			Asset_Manager_ƒ.apply_palette_shift_conversion(image_element, palette_key, set_image);
		})
	},


	apply_palette_shift_conversion: (
		original_image: HTMLImageElement,
		palette: Palette_Names,
		set_image: (new_image_element: HTMLImageElement) => void,
	) => {

		/*----------------------- prepare an offscreen buffer -----------------------*/
		var new_image_element = new Image();



		const osb = document.createElement('canvas');
		osb.width = original_image.naturalWidth;
		osb.height = original_image.naturalHeight;
		const osb_ctx = (osb.getContext("2d") as CanvasRenderingContext2D);
		osb_ctx.drawImage(original_image, 0, 0 );

		const image_data: globalThis.ImageData = osb_ctx.getImageData(0, 0, original_image.naturalWidth, original_image.naturalHeight);

		/*----------------------- do the actual color conversion -----------------------*/
		Asset_Manager_ƒ.apply_individual_palette_HSL_shift(
			image_data,
			palette,
		);

		osb_ctx.putImageData(image_data, 0, 0);		

		/*----------------------- prepare an offscreen buffer -----------------------*/
		osb.toBlob((blob: Blob|null) => {
			if(blob != null){
				const url = URL.createObjectURL(blob);
				new_image_element.src = url;
			
				new_image_element.onload = () => {
				// no longer need to read the blob so it's revoked
					log_image_from_canvas(new_image_element);

					URL.revokeObjectURL(url);
					new_image_element.onload = null;
				};
			


				set_image(new_image_element)
			}
		})

	},

	apply_individual_palette_HSL_shift: (
		image_data: globalThis.ImageData,
		palette: Palette_Names,
	) => {
		//for now we're gonna do some maximal fuckery and just shift the colors.

		const pairs = palette_list[palette].pairs

		map( pairs, (pair, index)=>{
			const palette_trigger_color = convert.hex.rgb(pair[0])
			const final_color = convert.hex.rgb(pair[1]);

			for (let i = 0; i < image_data.data.length; i += 4) {
				if(
					image_data.data[i + 0] == palette_trigger_color[0] &&
					image_data.data[i + 1] == palette_trigger_color[1] &&
					image_data.data[i + 2] == palette_trigger_color[2]
				){
					image_data.data[i + 0] = final_color[0];
					image_data.data[i + 1] = final_color[1];
					image_data.data[i + 2] = final_color[2];
				}
				
			}
		})
	}
}

