import React from 'react';
import { Link } from 'react-router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';

import { connect } from 'react-redux';
import { saveAccessToken } from 'actions/userActions'

import 'css/login.css'


const mapStateToProps = state => ({});
const mapDispatchToProps = {
  saveAccessToken
};


class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      register: false,
      loading: false,
      registerResponse: null,
      emailError: "",
      loginError: ""
    }
  }

  resetState() {
    this.setState({register: false,
                   loading: false,
                   registerResponse: null,
                   emailError: "",
                   loginError: ""})
  }

  renderLoginForm() {
    return (
      <>
      <Formik
      initialValues={{ email: '', password: '' }}
      validate={values => {
        let errors = {};
        if (!values.email) {
          errors.email = 'Required';
        }
        if(!values.password) {
          errors.password = 'Required';
        }
        return errors;
      }}
      onSubmit={(values, actions) => {
        this.resetState()

        console.log("Verifying user: "+values.email+"..")
        this.setState({loading: true})

        let json = {
          email: values.email,
          password: values.password
        }
        return fetch("/api/verify-login", {
        	method: "post",
        	headers: {
          	'Content-Type': 'application/json'
        	},
        	body: JSON.stringify(json) })
      		.then(response => response.json())
          .then(data => {
            if(data.status == 200) {
              console.log("Login Successful")
              this.setState({loading: false})
              // TODO: Display alert
              // TODO: Save access_token to redux
              console.log(this)
              this.props.saveAccessToken(data)
              this.props.history.push('/');
            }
            else if(data.status == 401 || data.status == 404) {
              this.setState({loginError: "Invalid Credentials. Please try again.", loading: false})
            }
            else {
              console.log(data)
              this.setState({emailError: "An unknown error occurred. Please try again.", loading: false})
            }
          });
      }}
      render={props => (

        <form onSubmit={props.handleSubmit}>
          <input
            type="text"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.name}
            className="fadeIn second"
            placeholder="email"
            name="email"
          />
          {props.errors.login &&
            <div className="input-error">{props.errors.login}</div>}
          <input
            type="password"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.password}
            className="fadeIn third"
            placeholder="password"
            name="password"
          />
          {props.errors.password &&
            <div className="input-error">{props.errors.password}</div>}
          <button
            type="submit"
            className="fadeIn fourth submit">Login</button>
          {this.state.loginError &&
            <div className="input-error">{this.state.loginError}</div>}
        </form>
      )}/>

    <div id="formFooter">
      <a href="#">Forgot Password?</a>/
      <a href="#" onClick={() => this.setState({register: true})}>Register</a>
    </div>
    </>
    )
  }

  renderRegisterForm() {
    return (
      <>
      <Formik
      initialValues={{ email: '', password: '', password_confirm: '' }}
      validate={values => {
        let errors = {};
        if (!values.email) {
          errors.email = 'Required';
        }
        else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
          errors.email = 'Invalid email address';
        }
        if(!values.password) {
          errors.password = 'Required';
        }
        if(!values.password_confirm) {
          errors.password_confirm = 'Required';
        }
        if(values.password != values.password_confirm) {
          errors.password_confirm = 'Passwords do not match';
        }
        return errors;
      }}
      onSubmit={(values, actions) => {
        this.resetState()

        console.log("Registering "+values.email+"..")
        this.setState({loading: true})

        let json = {
          email: values.email,
          password: values.password
        }
        return fetch("/api/register-user", {
        	method: "post",
        	headers: {
          	'Content-Type': 'application/json'
        	},
        	body: JSON.stringify(json) })
      		.then(response => response.text())
      		.then(data => JSON.parse(data))
          .then(data => {
            if(data.status == 201) {
              console.log("successfuly created user: "+values.email)
              // TODO: Display alert
              location.reload();
            }
            else if(data.status == 409) {
              console.log(data)
              this.setState({emailError: "This email is already registered"})
            }
            else {
              console.log(data)
              this.setState({emailError: "An unknown error occurred. Please try again."})
            }

            this.setState({loading: false})
          });
      }}
      render={props => (

        <form onSubmit={props.handleSubmit}>
          <input
            type="text"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.email}
            className="fadeIn second"
            placeholder="email"
            name="email"
          />
          {(props.errors.email || this.state.emailError) &&
            <div className="input-error">{props.errors.email}{this.state.emailError}</div>}
          <input
            type="password"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.password}
            className="fadeIn fourth"
            placeholder="password"
            name="password"
          />
          {props.errors.password &&
            <div className="input-error">{props.errors.password}</div>}
          <input
            type="password"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.password_confirm}
            className="fadeIn fifth"
            placeholder="confirm password"
            name="password_confirm"
          />
          {props.errors.password_confirm &&
            <div className="input-error">{props.errors.password_confirm}</div>}
          <button
            type="submit"
            className="fadeIn sixth submit">Register</button>
        </form>
      )}
    />

      <div id="formFooter">
        <a href="#" onClick={() => this.setState({register: false})}>Login</a>
      </div>
      </>
    )
  }

  renderForm() {
    if(this.state.register) {
      return this.renderRegisterForm()
    }
    else {
      return this.renderLoginForm()
    }
  }

  render() {

    return (
      <div key={this.state.register} className="wrapper fadeInDown">
        <div id="formContent">

          <div className="fadeIn first">
            <h2>The Operator</h2>
          </div>
          {this.renderForm()}
        </div>
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Login)
