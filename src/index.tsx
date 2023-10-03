import React from 'react';
import ReactDOM from 'react-dom/client';
import { Primary_View } from "./game/core/gui/Primary_View";

//import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(
	<React.StrictMode>
		<Primary_View />
	</React.StrictMode>
);

document.addEventListener("contextmenu", function (e){
    e.preventDefault();
}, false);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
