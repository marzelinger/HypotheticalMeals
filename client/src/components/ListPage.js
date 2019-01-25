import React from 'react';
import Filter from './Filter';
import PropTypes from 'prop-types';


class ListPage extends React.Component {
  handleClick = buttonName => {
    this.props.clickHandler(buttonName);
  };

  render() {
    return (
        <div classname="list-page">
            <div className="title">
                <h1>Ingredients</h1>
            </div>
            <div classname="filter-bar">
                <Filter></Filter>
            </div>
        </div>
    );
  }
}

ListPage.propTypes = {
  clickHandler: PropTypes.func,
};

export default ListPage
