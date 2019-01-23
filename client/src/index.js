// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import CommentBox from './CommentBox';
// import * as serviceWorker from './serviceWorker';

// ReactDOM.render(<CommentBox />, document.getElementById('root'));

// // If you want your app to work offline and load faster, you can change
// // unregister() to register() below. Note this comes with some pitfalls.
// // Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
import { createStore } from 'redux'
import todoApp from './reducers/reducers'
import {
    addTodo,
    toggleTodo,
    setVisibilityFilter,
    VisibilityFilters
  } from './actions/actions'
  const store = createStore(todoApp, window.STATE_FROM_SERVER)
  // Log the initial state
  console.log(store.getState())
  
  // Every time the state changes, log it
  // Note that subscribe() returns a function for unregistering the listener
  const unsubscribe = store.subscribe(() => console.log(store.getState()))
  
  // Dispatch some actions
  store.dispatch(addTodo('Learn about actions'))
  store.dispatch(addTodo('Learn about reducers'))
  store.dispatch(addTodo('Learn about store'))
  store.dispatch(toggleTodo(0))
  store.dispatch(toggleTodo(1))
  store.dispatch(setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED))
  
  // Stop listening to state updates
  unsubscribe()

