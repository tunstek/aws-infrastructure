import React from 'react';
import { connect } from 'react-redux';
import { updateUserDoc } from 'actions/userActions'
import TradingViewWidget from 'react-tradingview-widget';
import { Tabs, Tab, Button, ButtonToolbar, Container, Row, Col, Modal } from 'react-bootstrap';

import 'css/symbol.css'

const mapStateToProps = state => ({
  userDoc: state.userState.userDoc
});

const mapDispatchToProps = {
  updateUserDoc
};

class Symbol extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      modalOpen: false,
      addGroupRowShown: false,
    }
    this.sym = this.props.match.params.sym.toUpperCase()

    this.groupNameSelect = React.createRef();
    this.groupNameInput = React.createRef();

    this.handleAddGroupClick = this.handleAddGroupClick.bind(this);
    this.addToWatchlist = this.addToWatchlist.bind(this);
  }

  componentDidMount() {
    // Symbol info script
    const info_script = document.createElement("script");
    info_script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    info_script.type = 'text/javascript'
    info_script.async = true;
    info_script.innerHTML = `{
      "symbol": "`+this.sym+`",
      "width": "100%",
      "locale": "en",
      "colorTheme": "light",
      "isTransparent": false,
      "largeChartUrl": "http://localhost"
    }`
    document.getElementById('symbol-info-container').appendChild(info_script);

    // Symbol Fundamentals
    const financials_script = document.createElement("script");
    financials_script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js'
    financials_script.type = 'text/javascript'
    financials_script.async = true;
    financials_script.innerHTML = `{
      "symbol": "`+this.sym+`",
      "colorTheme": "light",
      "isTransparent": false,
      "largeChartUrl": "http://localhost",
      "displayMode": "regular",
      "width": "100%",
      "height": "600",
      "locale": "en"
    }`
    document.getElementById('financials-container').appendChild(financials_script);

    // Symbol Profile
    const profile_script = document.createElement("script");
    profile_script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js'
    profile_script.type = 'text/javascript'
    profile_script.async = true;
    profile_script.innerHTML = `{
      "symbol": "`+this.sym+`",
      "colorTheme": "light",
      "isTransparent": false,
      "largeChartUrl": "http://localhost",
      "displayMode": "regular",
      "width": "100%",
      "height": "350",
      "locale": "en"
    }`
    document.getElementById('profile-container').appendChild(profile_script);
  }

  renderChart() {
    return (
        <TradingViewWidget
          symbol={this.sym}
          hide_side_toolbar={false}
          news={['headlines']}
          studies={['BB@tv-basicstudies','RSI@tv-basicstudies']}
          autosize />
    )
  }


  renderButtons() {
    var inWatchList = false;

    if(inWatchList) {
      var watchButtonText = "Remove from Watchlist"
      var watchButtonVariant = "danger";
    }
    else {
      var watchButtonText = "Add to Watchlist"
      var watchButtonVariant = "primary";
    }

    return (
      <div>
        <Container>
          <Row>
            <Col xs={6} className="d-flex align-items-center justify-content-center button-container">
              <Button
                variant={watchButtonVariant}
                size="lg"
                onClick={()=>this.setState({modalOpen: true})}>
                {watchButtonText}
              </Button>

            </Col>
            <Col xs={6} className="d-flex align-items-center justify-content-center button-container">
              <Button
                variant="success"
                size="lg">
                Long
              </Button>
              <Button
                variant="danger"
                size="lg">
                Short
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  handleAddGroupClick() {
    let groupName = this.groupNameInput.current.value
    let newDoc = this.props.userDoc
    newDoc["watchlist"].push({"name":groupName, "symbols":[this.sym]})
    this.props.updateUserDoc(newDoc)
  }

  renderGroupRow() {
    if(this.state.addGroupRowShown) {
      return(
        <Row className="row-centered" id="add-group-row">
          <Col className="col-centered" xs={6} md={6}>
            <input ref={this.groupNameInput} type="text" id="group-name-input" name="group-name" placeholder="Group Name"/>
          </Col>
          <Col className="col-centered" xs={6} md={6}>
            <Button variant="secondary" onClick={this.handleAddGroupClick}>
              Add new Group
            </Button>
          </Col>
        </Row>
      );
    }
  }

  addToWatchlist() {
    let selectedGroup = this.groupNameSelect.current.selectedOptions[0].value
    let newUserDoc = this.props.userDoc
    let newWatchlist = newUserDoc['watchlist']
    for(let i = 0; i < newWatchlist.length; i++) {
      if(newWatchlist[i].name == selectedGroup) {
        newWatchlist[i].symbols.push(this.sym);
      }
    }
    newUserDoc['watchlist'] = newWatchlist;
    this.props.updateUserDoc(newUserDoc)
  }

  renderModal() {
    console.log(this.props)

    let selectOptions = []
    if(this.props.userDoc != null) {
      for(let i = 0; i < this.props.userDoc.watchlist.length; i++) {
        let groupName = this.props.userDoc.watchlist[i].name
        selectOptions.push((
          <option key={groupName} value={groupName}>{groupName}</option>
        ))
      }
    }
    else {
      selectOptions.push((
        <option key="Login">Please Login</option>
      ))
    }

    return (
      <Modal show={this.state.modalOpen} onHide={()=>this.setState({modalOpen: false})}>
        <Modal.Header closeButton>
          <Modal.Title>Select the watchlist group to add to:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row className="row-centered">
              <Col className="col-centered" xs={6} md={6}>
                <select ref={this.groupNameSelect}>
                  {selectOptions}
                </select>
              </Col>
              <Col className="col-centered" xs={6} md={6}>
                <Button variant="primary" onClick={this.addToWatchlist}>
                  Select
                </Button>
                <Button variant="primary" onClick={()=>this.setState({addGroupRowShown: true})}>
                  +
                </Button>
              </Col>
            </Row>
            {this.renderGroupRow()}
          </Container>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>this.setState({modalOpen: false})}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {

    return (
      <div>
      <div className="tradingview-widget-container info-container">
        <div id='symbol-info-container' className="tradingview-widget-container__widget"></div>
      </div>

      {this.renderModal()}

      {this.renderButtons()}

      <Tabs className='tabs-container' id="sym_tabs" defaultActiveKey={'financial-tab'}>
        <Tab eventKey='chart-tab' title='Chart'>
          <div className='chart-container'>
            {this.renderChart()}
          </div>
        </Tab>
        <Tab eventKey='financial-tab' title='Financials'>
          <div className='fun-container'>
            <div id='financials-container' className="tradingview-widget-container">
              <div className="tradingview-widget-container__widget"></div>
            </div>
          </div>
        </Tab>
        <Tab eventKey='profile-tab' title='Profile'>
          <div className='profile-container'>
            <div id='profile-container' className="tradingview-widget-container">
              <div className="tradingview-widget-container__widget"></div>
            </div>
          </div>
        </Tab>
      </Tabs>

      </div>
    )
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Symbol)
