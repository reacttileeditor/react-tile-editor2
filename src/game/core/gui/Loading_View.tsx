import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

import { Asset_Manager_Data } from "../engine/Asset_Manager";
import * as Utils from "../engine/Utils";


interface Loading_View_Props {
	current_assets_loaded_count: number,
	total_asset_count: number,
	assets_loaded: boolean,
	dimensions: Point2D,
}




import { Point2D, Rectangle } from '../../interfaces';


export class Loading_View extends React.Component <Loading_View_Props> {
	ctx!: CanvasRenderingContext2D;
	render_loop_interval: number|undefined;
	canvas!: HTMLCanvasElement;

/*----------------------- initialization and asset loading -----------------------*/
	constructor( props: Loading_View_Props ) {
		super( props );
	}

	componentDidMount() {
		this.ctx = this.canvas!.getContext("2d")!;
	}

	componentDidUpdate(prevProps: Readonly<Loading_View_Props>, prevState: Readonly<{}>, snapshot?: any): void {
		this.draw();
	}

	draw ()  {
		this.ctx.save();

		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
	


		this.ctx.imageSmoothingEnabled = false;
		this.ctx.font = '16px pixel, sans-serif';
		this.ctx.textAlign = 'center';

		this.ctx.translate(
			this.ctx.canvas.width / 2,
			this.ctx.canvas.height / 2,
		);

		this.ctx.fillStyle = "#ffffff";
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText(`Loading assets: ${this.props.current_assets_loaded_count} / ${this.props.total_asset_count}`, 0, 0);
		this.ctx.restore();		
	}

/*----------------------- react render -----------------------*/

	render() {
		return <div className="canvas_holder">
			<canvas
				ref={(node) => {this.canvas = node!;}}
				width={this.props.dimensions.x}
				height={this.props.dimensions.y}

			/>
		</div>;
	}
}
