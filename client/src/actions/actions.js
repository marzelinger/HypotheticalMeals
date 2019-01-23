/*
 * action types, can move these into a seperate file. Actions describe what happened, not what the resulting change to the state is --> thats reducers.
 */

export const ADD_TODO = 'ADD_TODO'
export const TOGGLE_TODO = 'TOGGLE_TODO'
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'

/*
 * other constants
 */

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}

/*
 * action creators. These can be asynchronous and make api calls. 
 */

export function addTodo(text) {
  return { type: ADD_TODO, text }
}

export function toggleTodo(index) {
  return { type: TOGGLE_TODO, index }
}

export function setVisibilityFilter(filter) {
  return { type: SET_VISIBILITY_FILTER, filter }
}

// bound action creators examples, can dispatch the action with boundAddTodo(text). Will normally being using connect from react-redux
// const boundAddTodo = text => dispatch(addTodo(text))
// const boundCompleteTodo = index => dispatch(completeTodo(index))