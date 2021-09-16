import React from 'react';
import { Link } from 'react-router';
import { Redirect } from 'react-router-dom'

export default class LoginLayout extends React.Component {
  /* This is the upper level LoginLayout. Needed because of the way we render the rest of the site.
     If we don't layout this way (a layout page and a main page) we either get the not-found page rendered (where this is the main file) or the topnav rendered where page/login is the main file

      This is a temporary fix, I'm sure theres a in React Router but for now this will work */

  render() {
    return (<div></div>)
  }
}
