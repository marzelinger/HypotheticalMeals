
import React from 'react';
import PropTypes from 'prop-types';
import ProductLine from './ProductLine';

const ProductLineList = (props) => {
  const productLineNodes = props.data.map(prodLine => (
    <ProductLine
      user={prodLine.user}
      key={prodLine._id}
      id={prodLine._id}
      name={prodLine.name}
      skus={prodLine.skus}
      handleUpdateProductLine={props.handleUpdateProductLine}
      handleDeleteProductLine={props.handleDeleteProductLine}
    >
      { prodLine.name}
    </ProductLine>
  ));
  return (
    <div>
      { productLineNodes }
    </div>
  );
};

ProductLineList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    user: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    skus: PropTypes.array
  })),
  handleDeleteProductLine: PropTypes.func,
  handleUpdateProductLine: PropTypes.func,
};

ProductLineList.defaultProps = {
  data: [],
};

export default ProductLineList;