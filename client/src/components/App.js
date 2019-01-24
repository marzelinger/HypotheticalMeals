import React from 'react'
import Footer from './Footer'
import AddTodoContainer from '../containers/AddToDoContainer'
import VisibleTodoList from '../containers/VisibleTodoList'

const App = () => (
  <div>
    <AddTodoContainer />
    <VisibleTodoList />
    <Footer />
  </div>
)

export default App