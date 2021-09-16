import React from 'react';
import { Link } from 'react-router';
import { Table, Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { TiArrowUpThick } from "react-icons/ti";
import { TiArrowDownThick } from "react-icons/ti";
import Pagination from 'components/pagination'
import { connect } from 'react-redux';
import { updateUserDoc } from 'actions/userActions'


const mapStateToProps = state => ({
  userDoc: state.userState.userDoc,
  loading: state.userState.loading
});
const mapDispatchToProps = {
  updateUserDoc
};

class Welcome extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
    };
  }

  onSetCurrentPage(value) {
    this.setState({currentPage: value});
  }

  renderCurrentPositions() {
    return (
      <div>
      <h3>Current Positions</h3>
        <Table bordered hover>
            <thead>
              <tr>
              <th>Symbol</th>
              <th>Position</th>
              <th>Initial Price</th>
              <th>Current Price</th>
              <th>Duration</th>
              <th>% Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="/symbol/msft">MSFT</a></td>
                <td>Short</td>
                <td>$87.36</td>
                <td>$86.78</td>
                <td>2 Hours</td>
                <td>1.3% <TiArrowDownThick color='green'/></td>
              </tr>
              <tr>
                <td><a href="/symbol/aapl">AAPL</a></td>
                <td>Long</td>
                <td>$132.34</td>
                <td>$148.26</td>
                <td>1 Day 12 Hours</td>
                <td>11.9% <TiArrowUpThick color='green'/></td>
              </tr>
              <tr>
                <td>BIRG</td>
                <td>Short</td>
                <td>$12.43</td>
                <td>$13.65</td>
                <td>2 days 4 Hours</td>
                <td>1.1% <TiArrowUpThick color='red'/></td>
              </tr>
              <tr>
                <td>AIBG</td>
                <td>Long</td>
                <td>$19.23</td>
                <td>$17.25</td>
                <td>2 days 8 Hours</td>
                <td>2.7% <TiArrowDownThick color='red'/></td>
              </tr>
            </tbody>
          </Table>
          <Container>
          <Row className="justify-content-md-center">
            <Col md="auto">
              <Pagination activePage={Number(this.state.currentPage)} totalPages={5} onChange={value => this.onSetCurrentPage(value)} />
            </Col>
          </Row>
          </Container>
        </div>
    )
  }

  handleClick = (e, data, target) => {
    let sym = data.name;
    let listName = data.listName;
    let newUserDoc = this.props.userDoc;
    let newWatchlist = newUserDoc['watchlist']

    if (data.action === 'remove') {
      for(let i = 0; i < newWatchlist.length; i++) {
        if(newWatchlist[i].name == listName) {
          newWatchlist[i].symbols = newWatchlist[i].symbols.filter(item => item !== sym);
        }
      }
      newUserDoc['watchlist'] = newWatchlist;
      this.props.updateUserDoc(newUserDoc)
    }
    else if(data.action === 'remove_group') {
      newWatchlist = newWatchlist.filter((item) => item.name !== listName);
      newUserDoc['watchlist'] = newWatchlist;
      this.props.updateUserDoc(newUserDoc)
    }
  }
  renderWatchlist() {
    // Make scrollable

    console.log(this.props)

    if(this.props.userDoc == null) {
      return (
        <div>
          <h3>Watchlist</h3>
          Loading Watchlist...
        </div>
      )
    }
    else {
      var tabs = [];
      let watchlist = this.props.userDoc['watchlist'];
      for(let i = 0; i < watchlist.length; i++) {
        let name = watchlist[i]['name'];
        let symbols = watchlist[i]['symbols'];
        let rows = []
        for(let j = 0; j < symbols.length; j++) {
          rows.push((
            <ContextMenuTrigger id="watchlist_context"
              name={symbols[j]}
              listName={name}
              collect={(props) => ({name: props.name, listName: props.listName})}
              renderTag="tr"
              key={'tab_'+i+'_entry_'+j}>
              <td><a href={"/symbol/"+symbols[j]}>{symbols[j]}</a></td>
              <td>$86.78</td>
            </ContextMenuTrigger>

          ))
        }
        tabs.push((
          <Tab eventKey={'tab_'+i} key={'tab_'+i} title={name}>
          <Table bordered hover>
            <thead>
              <tr>
              <th>Symbol</th>
              <th>Current Price</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </Table>
          </Tab>
        ));
      }

      return (
        <div>
          <h3>Watchlist</h3>
          <Tabs id="watchlist_tabs" defaultActiveKey={'tab_0'}>
            {tabs}
          </Tabs>
          <ContextMenu id="watchlist_context">
            <MenuItem onClick={this.handleClick} data={{ action: 'remove' }}>Remove</MenuItem>
            <MenuItem onClick={this.handleClick} data={{ action: 'remove_group' }}>Remove Group</MenuItem>
          </ContextMenu>
        </div>
      )
    }
  }


  render() {
    return (
      <div>
        {this.renderCurrentPositions()}
        {this.renderWatchlist()}
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Welcome)
