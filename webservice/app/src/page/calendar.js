import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

import { Tabs, Tab, Button, Table } from 'react-bootstrap';
import moment from 'moment'

import { getEvents } from 'lib/newswatcher_api_calls'
import 'css/calendar.css'

export default class Calendar extends React.Component {
  constructor(props){
		super(props);
		this.state = {
      weekOffset: 0,
      currentlySelectedDate: moment().startOf('day'),
      data: null
		};
    this.momentDates = []

    this.loadData = this.loadData.bind(this)
    this.handleDatePickerClick = this.handleDatePickerClick.bind(this)
	}

  componentDidMount() {
    this.loadData()
  }

  loadData() {
    // load the data
    console.log('Making event request for: ' + this.state.currentlySelectedDate.format("YYYY-MM-DD"))
    getEvents(this.state.currentlySelectedDate.format("YYYY-MM-DD")).then(data => {
			this.setState({ data: data });
      console.log('Data:')
			console.log(data);
		})
  }

  handleDatePickerClick = index => e => {
    if(!this.state.currentlySelectedDate.isSame(this.momentDates[index])) {
      this.state.data = null
      this.setState({currentlySelectedDate: this.momentDates[index]}, this.loadData)
    }
  }

  renderDatePicker() {
    let dates = []
    for(let i = 0; i < 7; i++) {
      let dateStr = this.momentDates[i].format("DD MMM ddd")
      dates.push((
        <td key={'date_'+i}
            val={i}
            className={this.state.currentlySelectedDate.isSame(this.momentDates[i]) ? "active" : ""}
            onClick={this.handleDatePickerClick(i)}>
          {dateStr}
        </td>
      ))
    }

    return (
      <div>
        <table className='datepicker-table'>
          <tbody>

          <tr>
            <td onClick={() => this.setState({weekOffset: this.state.weekOffset-1})}>
              Prev
            </td>

            {dates}

            <td onClick={() => this.setState({weekOffset: this.state.weekOffset+1})}>
              Prev
            </td>
          </tr>

          </tbody>
        </table>
      </div>
    );
  }

  renderEarningsTab() {
    if(this.state.data == null) {
      return (
        <Tab eventKey={'tab_0'} key={'tab_0'} title='Earnings'>
          Loading...
        </Tab>
      );
    }
    else {
      let rows = []
      for(let i = 0; i < this.state.data['earnings'].length; i++){
        let row = this.state.data['earnings'][i]
        for(let key in row) {
          if(row[key] == null) {
            row[key] = '-'
          }
        }
        rows.push((
          <tr key={i}>
            <td>{row['symbol']}</td>
            <td>{row['company']}</td>
            <td>{row['earnings call time']}</td>
            <td>{row['eps estimate']}</td>
            <td>{row['eps reported']}</td>
            <td>{row['surprise']}</td>
          </tr>
        ))
      }
      return (
        <Tab eventKey={'tab_0'} key={'tab_0'} title='Earnings'>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Earnings Call Time</th>
                <th>EPS Estimate</th>
                <th>EPS Reported</th>
                <th>Surprise (%)</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </Table>
        </Tab>
      )
    }
  }

  renderStockSplitsTab() {
    if(this.state.data == null) {
      return ((
        <Tab eventKey={'tab_1'} key={'tab_1'} title='Stock Splits'>
          Loading...
        </Tab>
      ))
    }
    else {
      let rows = []
      for(let i = 0; i < this.state.data['stock splits'].length; i++) {
        let row = this.state.data['stock splits'][i]
        rows.push((
          <tr key={i}>
            <td>{row['symbol']}</td>
            <td>{row['company']}</td>
            <td>{row['payable on']}</td>
            <td>{row['optionable']}</td>
            <td>{row['ratio']}</td>
          </tr>
        ))
      }
      return (
        <Tab eventKey={'tab_1'} key={'tab_1'} title='Stock Splits'>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Payable On</th>
                <th>Optionable</th>
                <th>Ratio</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </Table>
        </Tab>
      )
    }
  }

  renderDividendsTab() {
    if(this.state.data == null) {
      return ((
        <Tab eventKey={'tab_2'} key={'tab_2'} title='Dividends'>
          Loading...
        </Tab>
      ))
    }
    else {
      let rows = []
      for(let i = 0; i < this.state.data['dividends'].length; i++) {
        let row = this.state.data['dividends'][i]
        rows.push((
          <tr key={i}>
            <td>{row['symbol']}</td>
            <td>{row['company']}</td>
            <td>{row['expected date']}</td>
            <td>{row['payment date']}</td>
            <td>{row['record date']}</td>
            <td>{row['dividend']}</td>
            <td>{row['indicated annual dividend']}</td>
            <td>{row['announcement date']}</td>
          </tr>
        ))
      }
      return (
        <Tab eventKey={'tab_2'} key={'tab_2'} title='Dividends'>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Expected Date</th>
                <th>Payment Date</th>
                <th>Record Date</th>
                <th>Dividend</th>
                <th>Indicated Annual Dividend</th>
                <th>Announcement Date</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </Table>
        </Tab>
      )
    }
  }


  renderEconomicTab() {
    if(this.state.data == null) {
      return ((
        <Tab eventKey={'tab_3'} key={'tab_3'} title='Economic'>
          Loading...
        </Tab>
      ))
    }
    else {
      let rows = []
      for(let i = 0; i < this.state.data['economic'].length; i++) {
        let row = this.state.data['economic'][i]
        rows.push((
          <tr key={i}>
            <td>{row['country']}</td>
            <td>{row['event']}</td>
            <td>{row['time']}</td>
            <td>{row['actual']}</td>
            <td>{row['consensus']}</td>
            <td>{row['previous']}</td>
            <td>{row['summary']}</td>
          </tr>
        ))
      }
      return (
        <Tab eventKey={'tab_3'} key={'tab_3'} title='Economic'>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Country</th>
                <th>Event</th>
                <th>Time</th>
                <th>Actual</th>
                <th>Consensus</th>
                <th>Previous</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </Table>
        </Tab>
      )
    }
  }

  render() {
    console.log('State:');
    console.log(this.state);

    this.momentDates = []
    for(let i = 0; i < 7; i++) {
      this.momentDates.push(moment().day(i+(7*this.state.weekOffset)).startOf('day'))
    }

    return (
      <div>
        {this.renderDatePicker()}
        <Tabs id="calendar_tabs" defaultActiveKey={'tab_0'}>
          {this.renderEarningsTab()}
          {this.renderStockSplitsTab()}
          {this.renderDividendsTab()}
          {this.renderEconomicTab()}
        </Tabs>
      </div>
    )
  }
}
