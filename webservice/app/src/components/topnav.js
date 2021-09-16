import React from 'react';
import { connect } from 'react-redux';
import { NavLink as RRNavLink } from 'react-router-dom'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem } from 'reactstrap';
  import { FaRegUser } from 'react-icons/fa';

import 'css/topnav.css'


const mapStateToProps = state => ({
  userDoc: state.userState.userDoc
});


class Topnav extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      //user: null,
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  renderUserDropDown() {
    let dropDownMenu;
    if(this.props.userDoc != null) {
      // user is logged in
      dropDownMenu = (
        <DropdownMenu right>
          <DropdownItem>
            {this.props.userDoc.username}
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem>
            Logout
          </DropdownItem>
        </DropdownMenu>
      )
    }
    else {
      // user is not logged in
      dropDownMenu = (
        <DropdownMenu right>
          <a target="_blank" href={process.env.CP_API_ROOT}>
          <DropdownItem>
            Login
          </DropdownItem>
          </a>
        </DropdownMenu>
      )
    }
    return (
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav caret>
          <FaRegUser style={{paddingBottom: 2+'px'}}/>
        </DropdownToggle>
        {dropDownMenu}
      </UncontrolledDropdown>
    )
  }
  render() {
    return (
      <div>
        <Navbar color="light" light expand="md" className='navbar'>
          <NavbarBrand tag={RRNavLink} exact to="/">{process.env.APP_NAME}</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink tag={RRNavLink} exact to="/" activeClassName="active-link">Home</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} to="/symbol/aapl" activeClassName="active-link">Symbol</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} exact to="/charts" activeClassName="active-link">Charts</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} exact to="/news" activeClassName="active-link">News</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} exact to="/calendar" activeClassName="active-link">Calendar</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} exact to="/screener" activeClassName="active-link">Screener</NavLink>
              </NavItem>
              {this.renderUserDropDown()}
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Topnav)
