// import { combineReducers } from 'redux'
// import {
//   ADD_TODO,
//   TOGGLE_TODO,
//   SET_VISIBILITY_FILTER,
//   VisibilityFilters
// } from '../actions/actions'
// const { SHOW_ALL } = VisibilityFilters

// // design pattern: split up reducers to handle their own part of the initial state. Initial state is encompassed by the defaults of state in each individual reducer.

// function visibilityFilter(state = SHOW_ALL, action) {
//   switch (action.type) {
//     case SET_VISIBILITY_FILTER:
//       return action.filter
//     default:
//       return state
//   }
// }

// function todos(state = [], action) {
//   switch (action.type) {
//     case ADD_TODO:
//       return [
//         ...state,
//         {
//           text: action.text,
//           completed: false
//         }
//       ]
//     case TOGGLE_TODO:
//       return state.map((todo, index) => {
//         if (index === action.index) {
//           return Object.assign({}, todo, {
//             completed: !todo.completed
//           })
//         }
//         return todo
//       })
//     default:
//       return state
//   }
// }

// // All combineReducers() does is generate a function that calls your reducers with the slices of state selected according to their keys, and combines their results into a single object again
// const todoApp = combineReducers({
//   visibilityFilter,
//   todos
// })


// export default todoApp