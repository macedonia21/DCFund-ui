import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withHistory, Link} from 'react-router-dom';
import {Accounts} from 'meteor/accounts-base';

export default class SignupPage extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const name = document.getElementById("signup-username").value;
        const firstName = document.getElementById("signup-firstname").value;
        const lastName = document.getElementById("signup-lastname").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const isUser = true;
        this.setState({error: ""});
        const userId = Accounts.createUser({
            email: email,
            username: name,
            firstName: firstName,
            lastName: lastName,
            password: password,
            isUser: isUser
        }, (err) => {
            if (err) {
                NotificationManager.error(err.reason, 'Error', 3000);
            } else {
                NotificationManager.success('Your account created, open wallet in few seconds', 'Success', 3000);
                setTimeout(() => {
                    this.props.history.push('/');
                }, 3000);
            }
        });
    }

    render() {
        return (
            <div className="container">
                <form id="login-form" className="form center-block form-signup" onSubmit={this.handleSubmit}>
                    <h1 className="text-center">Sign up</h1>
                    <div className="form-group">
                        <input type="text" id="signup-username" className="form-control input-lg" placeholder="Username"
                               required/>
                    </div>
                    <div className="form-group">
                        <input type="text" id="signup-firstname" className="form-control input-lg"
                               placeholder="First name" required/>
                    </div>
                    <div className="form-group">
                        <input type="text" id="signup-lastname" className="form-control input-lg"
                               placeholder="Last name" required/>
                    </div>
                    <div className="form-group">
                        <input type="email" id="signup-email" className="form-control input-lg" placeholder="Email"
                               required/>
                    </div>
                    <div className="form-group">
                        <input type="password" id="signup-password" className="form-control input-lg"
                               placeholder="Password" required/>
                    </div>
                    <div className="form-group">
                        <input type="submit" id="login-button" className="btn btn-lg btn-success btn-block"
                               value="Sign Up"/>
                    </div>
                    <div className="form-group">
                        <p className="text-center">Already have an account? Login <Link to="/login">here</Link></p>
                    </div>
                </form>
            </div>
        );
    }
}
