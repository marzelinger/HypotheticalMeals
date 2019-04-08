
import React from 'react';
import PropTypes from 'prop-types';
import ProductLine from './ProductLine';

const ProductLineList = (props) => {
  const LineNodes = props.data.map(line => (
    <ProductLine
      user = {props.user}
      line = {line}
      key={line._id}
      id={line._id}
      name={line.name}
      skus={line.skus}
      handleDetailViewSubmit = {props.handleDetailViewSubmit}
      handleUpdateProdLine={props.handleUpdateProdLine}
      handleDeleteProdLine={props.handleDeleteProdLine}
      prod_lines = {props.data.map((item) => {
        return {
          value: item._id, 
          label: item.name
        }
      })}
    >
      { line.name}
    </ProductLine>
  ));
  return (
    <div>
      { LineNodes }
    </div>
  );
};

ProductLineList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    skus: PropTypes.array
  })),
  handleDeleteProdLine: PropTypes.func,
  handleUpdateProdLine: PropTypes.func,
};

ProductLineList.defaultProps = {
  data: [],
};

export default ProductLineList;