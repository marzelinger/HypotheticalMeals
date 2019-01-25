 //import {createStore, applyMiddleware, compose} from 'redux';
 import rootReducer from "../reducers";
//import thunk from 'redux-thunk';
/* Redux DevTools for debugging application's state changes.
The extension provides power-ups for your Redux development workflow. Apart from Redux, it can be used with any other architectures which handle the state.
*/
// export default function store(initialState) {
//   return compose(
//     rootReducer,
//     initialState,
//     window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
//     applyMiddleware(thunk)
//   )(createStore);
// }




import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
//import rootReducer from "./reducers";

const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
     window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk)
);

export default store;
