import React, { ErrorInfo, PropsWithChildren, useEffect, useRef, useState } from "react";

import "./Error_Boundary.scss";


type ErrorBoundaryState = {
	hasError: boolean,
	errorText: string,
}

export class ErrorBoundary extends React.Component<
	PropsWithChildren<Record<string, unknown>>,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = {
		hasError: false,
		errorText: ''
	}
  
	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// Update state so the next render will show the fallback UI.
		return {
			hasError: true,
			errorText: error.message
		};
	}
  
	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// You can also log the error to an error reporting service
	  	//logErrorToMyService(error, errorInfo);
	}
  
	render() {
		if (this.state.hasError) {
			return <p className="error-boundary">{this.state.errorText}</p>;
		}

		return this.props.children; 
	}
}