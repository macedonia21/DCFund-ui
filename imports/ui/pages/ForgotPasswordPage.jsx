import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Accounts} from 'meteor/accounts-base';
import {NotificationManager} from 'react-notifications';
import {withHistory, Link} from 'react-router-dom';
import {createContainer} from 'meteor/react-meteor-data';

export default class ForgotPasswordPage extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const email = ReactDOM.findDOMNode(this.refs.inputEmail).value.trim();

        Accounts.forgotPassword({email: email}, (err) => {
            document.getElementById('login-email').value = '';
            if (err) {
                if (err.message === 'User not found [403]') {
                    NotificationManager.error('This email does not exist', 'Error', 3000);
                } else {
                    NotificationManager.error('Something went wrong', 'Error', 3000);
                }
            } else {
                NotificationManager.success('Please check your email for instruction', 'Success', 3000);
            }
        });
    }

    render() {
        return (
            <div className="container">
                <form id="login-form" className="form center-block form-signin" onSubmit={this.handleSubmit}>
                    <h2 className="text-center">Forgot password</h2>
                    <div className="form-group">
                        <input type="email" ref="inputEmail" id="login-email" className="form-control input-lg"
                               placeholder="Email" required/>
                    </div>
                    <div className="form-group text-center">
                        <input type="submit" id="login-button" className="btn btn-success btn-lg btn-block"
                               value="Reset password"/>
                    </div>
                    <div className="form-group text-center">
                        <p className="text-center">Don't have an account? Sign up <Link to="/signup">here</Link></p>
                        <p className="text-center">or Login <Link to="/login">here</Link></p>
                        <p><small>Copyright © {new Date().getFullYear()} DCFund Wallet</small></p>
                    </div>
                </form>
            </div>
        );
    }
}
