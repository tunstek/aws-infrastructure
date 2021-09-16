import React from 'react';
import { Link } from 'react-router';

import 'css/screener.css'

export default class Screener extends React.Component {
  componentDidMount() {
    // screener script
    const screener_script = document.createElement("script");
    screener_script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    screener_script.type = 'text/javascript'
    screener_script.async = true;
    screener_script.innerHTML = `{
      "width": "100%",
      "height": "100%",
      "defaultColumn": "overview",
      "defaultScreen": "most_capitalized",
      "market": "america",
      "showToolbar": true,
      "colorTheme": "light",
      "locale": "en",
      "largeChartUrl": "http://localhost"
    }`
    document.getElementById('screener-container').appendChild(screener_script);
  }

  render() {
    return (
      <div>
        <div className="tradingview-widget-container" id='screener-container' className='screener-container'>
          <div className="tradingview-widget-container__widget"></div>
        </div>
      </div>
    );
  }
}
