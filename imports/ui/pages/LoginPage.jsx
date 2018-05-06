import React, {Component} from 'react'
import {withHistory, Link} from 'react-router-dom'
import {createContainer} from 'meteor/react-meteor-data'

export default class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: ''
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        let email = document.getElementById('login-email').value;
        let password = document.getElementById('login-password').value;
        Meteor.loginWithPassword(email, password, (err) => {
            if (err) {
                this.setState({
                    error: err.reason
                });
            } else {
                this.props.history.push('/');
            }
        });
    }

    render() {
        const error = this.state.error;
        return (
            <div className="container">
                <form id="login-form" className="form center-block form-signin" onSubmit={this.handleSubmit}>
                    <h1 className="text-center">Login</h1>
                    {error.length > 0 ? <div className="alert alert-danger fade in">{error}</div> : ''}
                    <div className="form-group">
                        <input type="text" id="login-email" className="form-control input-lg"
                               placeholder="Username or Email" required/>
                    </div>
                    <div className="form-group">
                        <input type="password" id="login-password" className="form-control input-lg"
                               placeholder="Password" required/>
                    </div>
                    <div className="form-group text-center">
                        <input type="submit" id="login-button" className="btn btn-success btn-lg btn-block"
                               value="Login"/>
                    </div>
                    <div className="form-group text-center">
                        <p className="text-center">Don't have an account? Sign up <Link to="/signup">here</Link></p>
                    </div>
                </form>
            </div>
        );
    }
}
