import React from 'react';
import { slide as Menu } from 'react-burger-menu'

export default class Siderbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    }
  }

  showSettings (event) {
    event.preventDefault();
  }

  render () {
    return (
      <Menu isOpen={this.state.isOpen}>
        <a id="home" className="menu-item" href="/">Home</a>
        <a id="about" className="menu-item" href="/about">About</a>
        <a id="contact" className="menu-item" href="/contact">Contact</a>
        <a onClick={ this.showSettings } className="menu-item--small" href="">Settings</a>
      </Menu>
    );
  }
}
