const _ = require('lodash');
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getUserDoc } from 'actions/userActions'
import ScrollUpButton from "react-scroll-up-button";
import { FaAngleUp } from "react-icons/fa";

import Router from 'init/router'
import Topnav from 'components/topnav'
import 'css/main.css'

class ScrollUp extends React.Component {
  render() {
    return (
      <div>
        scroll
      </div>
    )
  }
}

const mapStateToProps = state => ({
  access_token: state.userState.access_token,
  userDoc: state.userState.userDoc
});

const mapDispatchToProps = {
  getUserDoc
};

class AppLayout extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      sidePaneOpen: false, // Indicates if the side pane is open
    }
    this.toggleSideBar = this.toggleSideBar.bind(this);
  }
  static propTypes = {
    location: PropTypes.object.isRequired
  }

  componentDidMount() {
    // Fetch redux data for the rest of the app
    this.props.getUserDoc();
  }

  toggleSideBar() {
    this.setState({sidePaneOpen: !this.state.sidePaneOpen});
  }

  render() {
    return (
      <div>
        <Topnav/>
        <main>
        </main>
        <ScrollUpButton
          ContainerClassName="scroll-up-container"
          TransitionClassName="scroll-up-transition"
          EasingType="easeInQuad"
          StopPosition={0}
          ShowAtPosition={150}
          AnimationDuration={500} >
          <FaAngleUp size={40} />
        </ScrollUpButton>
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(AppLayout)
