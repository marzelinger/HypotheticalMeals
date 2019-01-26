import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import visibilityFilterReducer from "./visibilityFilterReducer";
import todosReducer from "./todosReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducer,
  visibilityFilter: visibilityFilterReducer,
  todos: todosReducer
});