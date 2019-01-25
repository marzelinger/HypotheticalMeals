import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';

export default class PageTable extends React.Component {
  render() {
    return (
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>
    );
  }

    // PageTable.propTypes = {
    //   data: PropTypes.arrayOf(PropTypes.shape({
    //     author: PropTypes.string,
    //     id: PropTypes.string,
    //     text: PropTypes.string,
    //     updatedAt: PropTypes.date,
    //   })),
    //   handleDeleteComment: PropTypes.func.isRequired,
    //   handleUpdateComment: PropTypes.func.isRequired
    // };

    // PageTable.defaultProps = {
    //   data: [],
    // };

}