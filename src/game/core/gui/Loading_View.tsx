import { Loading_Metadata } from "./Primary_View";
import "./Primary_View.scss";

interface Props {
	loading_metadata: Loading_Metadata;
}


export const Loading_View = (props: Props) => {
	const loaded_fraction = props.loading_metadata.assets_loaded / props.loading_metadata.assets_total;
	const preprocessed_fraction = props.loading_metadata.assets_preprocessed / props.loading_metadata.assets_total;

	return (
		<div className="width_wrapper">
			<div className="loading_screen">
				<div className="loading_node">
					<div className="canvas_holder">
						<div className="loading_screen_internal">
							<div>{`Loading...  ${Math.round( loaded_fraction * 100)}%`}</div>
							<div className="loading_bar">
								<div className="loading_bar_fill" style={{width: `${Math.min(Math.round(loaded_fraction * 100), 100)}%`}} />
							</div>
							<div>{`Preprocessing...  ${Math.round( preprocessed_fraction * 100)}%`}</div>
							<div className="loading_bar">
								<div className="loading_bar_fill" style={{width: `${Math.min(Math.round(preprocessed_fraction * 100), 100)}%`}} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
