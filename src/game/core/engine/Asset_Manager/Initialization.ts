import { Dispatch, SetStateAction } from "react";
import { Asset_Manager_Data, Asset_Manager_ƒ } from "./Asset_Manager";
import { filter, isString, map, size } from "lodash";
import { is_all_true, ƒ } from "../Utils";
import { concat, uniq } from "ramda";



var PATH_PREFIX = "./assets/"


export const Initialization = {

/*----------------------- initialization and asset loading -----------------------*/
	launch_app: (
		me: Asset_Manager_Data,
		do_once_app_ready: ()=>void,
		set_loaded_fraction: Dispatch<SetStateAction<number>>,
	) => {
		me.static_vals.image_data_list.map( ( value, index ) => {

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

			temp_image.onload = () => {
				me.static_vals.raw_image_list[ value.name ] = temp_image;
				

				me.static_vals.assets_meta[ value.name ] = {
					dim: {
						w: temp_image.naturalWidth,
						h: temp_image.naturalHeight
					},
					bounds: value.bounds,
					preprocessed: false,
				};

				Asset_Manager_ƒ.apply_magic_color_transparency(me, temp_image, value.name, do_once_app_ready, set_loaded_fraction );

				temp_image.onload = null;
			};
		});
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
			is_all_true(map(tile_type.variants, (variant)=>{

				const restriction_row_sizes = map(variant.restrictions, (row)=>(
					size(row)	
				))

				const claim_row_sizes = map(variant.restrictions, (row)=>(
					size(row)	
				))

				const winnowed = uniq(concat(restriction_row_sizes, claim_row_sizes))

				if( size(winnowed) > 1){
					//row sizes should all be the same, period.

					throw new Error( `MTP has mismatching row sizes.  Graphic Asset id: ${variant.graphics[0].id}` );


					return false;
				} else {
					max_mtp_width = Math.max(max_mtp_width, size(variant.restrictions[0]));
					max_mtp_height = Math.max(max_mtp_height, size(variant.restrictions));

					me.static_vals.multi_tile_pattern_metadata = {
						...me.static_vals.multi_tile_pattern_metadata,
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


}