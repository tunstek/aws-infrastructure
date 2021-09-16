import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import LoginLayout from 'layout/login-layout'
import AppLayout from 'layout/app'

import Login from 'page/login'
import Welcome from 'page/welcome'
import Chart from 'page/chart'
import News from 'page/news'
import Calendar from 'page/calendar'
import Symbol from 'page/symbol'
import Screener from 'page/screener'
import NotFound from 'page/not-found'


export default class Router extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path='/login' component={LoginLayout}/>
          <Route path='/' component={AppLayout}/>
        </Switch>
        <Switch>
          <Route exact path='/' component={Welcome}/>
          <Route exact path='/login' component={Login}/>
          <Route exact path='/charts' component={Chart}/>
          <Route exact path='/news' component={News}/>
          <Route exact path='/calendar' component={Calendar}/>
          <Route exact path='/screener' component={Screener}/>
          <Route path='/symbol/:sym' component={Symbol}/>
          <Route component={NotFound}/>
        </Switch>
      </BrowserRouter>
    );
  }
}
