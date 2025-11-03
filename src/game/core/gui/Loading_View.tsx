import "./Primary_View.scss";

interface Props {
	loaded_fraction: number;
}


export const Loading_View = (props: Props) => {
	return (
		<div className="width_wrapper">
			<div className="loading_screen">
				<div className="loading_node">
					<div className="canvas_holder">
						<div className="loading_screen_internal">
							<div>{`Loading...  ${Math.round(props.loaded_fraction * 100)}%`}</div>
							<div className="loading_bar">
								<div className="loading_bar_fill" style={{width: `${Math.min(Math.round(props.loaded_fraction * 100), 100)}%`}} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
