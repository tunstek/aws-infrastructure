import React from 'react';
import { Pagination as RbPagination } from 'react-bootstrap';


export default class Pagination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: props.activePage,
    }
  }

  renderPaginationItems() {
    let items = [];
    let active = this.state.activePage;
    let totalPages = this.props.totalPages;

    if(active < 1) {
      active = 1;
    }
    if(active > totalPages) {
      active = totalPages;
    }

    items.push(
      <RbPagination.Prev key={0} disabled={active==1} onClick={() => this.setState({activePage:active-1})}/>
    )
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <RbPagination.Item key={number} active={number == active} onClick={() => this.setState({activePage:number})}>
          {number}
        </RbPagination.Item>,
      );
    }
    items.push(
      <RbPagination.Next key={totalPages+1} disabled={active==totalPages} onClick={() => this.setState({activePage:active+1})}/>
    )

    return items
  }

  render () {
    return (
      <RbPagination>{this.renderPaginationItems()}</RbPagination>
    );
  }
}
