import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

import TradingViewWidget from 'react-tradingview-widget';

import {
  Accordion,
  Card } from 'react-bootstrap';
import {
  FormGroup,
  Input,
  Label } from 'reactstrap'

import { parseGetQuery } from 'lib/utils'
import "css/chart.css"


export default class Chart extends React.Component {

  renderNewChart(sym) {
    return (
        <TradingViewWidget
          symbol={sym}
          hide_side_toolbar={false}
          news={['headlines']}
          studies={['BB@tv-basicstudies','RSI@tv-basicstudies']}
          autosize />
    )
  }

  render() {
    const params = parseGetQuery(this.props.location.search)
    let sym = params.sym
    if(sym === undefined) {
      sym = 'aapl'
    }
    return (
      <div className='chart-widget'>
        {this.renderNewChart(sym)}
      </div>
    );
  }
}
