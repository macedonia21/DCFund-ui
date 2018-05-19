import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {NotificationManager} from 'react-notifications';
import {withHistory, Link} from 'react-router-dom';
import {Accounts} from 'meteor/accounts-base';

export default class SignupPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            passStrength: 'weak',
            passConfirmStrength: 'weak'
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const name = ReactDOM.findDOMNode(this.refs.inputUser).value.trim();
        const firstName = ReactDOM.findDOMNode(this.refs.inputFirstName).value.trim();
        const lastName = ReactDOM.findDOMNode(this.refs.inputLastName).value.trim();
        const email = ReactDOM.findDOMNode(this.refs.inputEmail).value.trim();
        const password = ReactDOM.findDOMNode(this.refs.inputPass).value.trim();
        const confirmPassword = ReactDOM.findDOMNode(this.refs.inputConfirmPass).value.trim();
        const isUser = true;

        if (password !== confirmPassword) {
            ReactDOM.findDOMNode(this.refs.inputPass).value = '';
            ReactDOM.findDOMNode(this.refs.inputConfirmPass).value = '';

            NotificationManager.error('Confirm password not correct', 'Error', 3000);
            return;
        }

        const userId = Accounts.createUser({
            email: email,
            username: name,
            firstName: firstName,
            lastName: lastName,
            password: password,
            isUser: isUser
        }, (err) => {
            if (err) {
                console.log(this.refs);
                ReactDOM.findDOMNode(this.refs.inputPass).value = '';
                ReactDOM.findDOMNode(this.refs.inputConfirmPass).value = '';

                NotificationManager.error(err.reason, 'Error', 3000);
            } else {
                // Clear form
                ReactDOM.findDOMNode(this.refs.inputUser).value = '';
                ReactDOM.findDOMNode(this.refs.inputFirstName).value = '';
                ReactDOM.findDOMNode(this.refs.inputLastName).value = '';
                ReactDOM.findDOMNode(this.refs.inputEmail).value = '';
                ReactDOM.findDOMNode(this.refs.inputPass).value = '';
                ReactDOM.findDOMNode(this.refs.inputConfirmPass).value = '';

                NotificationManager.success('Your account created, open wallet in few seconds', 'Success', 3000);
                setTimeout(() => {
                    this.props.history.push('/');
                }, 3000);
            }
        });
    }

    estimatePassStreng(ref) {
        var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

        let pass = '';
        if (ref === 'inputPass') {
            pass = ReactDOM.findDOMNode(this.refs.inputPass).value.trim();
        } else {
            pass = ReactDOM.findDOMNode(this.refs.inputConfirmPass).value.trim();
        }

        let result = '';
        if (strongRegex.test(pass)) {
            result = 'strong';
        } else if (mediumRegex.test(pass)) {
            result = 'medium';
        } else {
            result = 'weak';
        }
        if (ref === 'inputPass') {
            this.setState({passStrength: result});
        } else {
            this.setState({passConfirmStrength: result});
        }
    }

    render() {
        const passStrength = this.state.passStrength;
        const passConfirmStrength = this.state.passConfirmStrength;
        return (
            <div className="container">
                <form id="login-form" className="form center-block form-signup" onSubmit={this.handleSubmit}>
                    <h1 className="text-center">Sign up</h1>
                    <div className="form-group">
                        <input type="text" ref="inputUser" id="signup-username" className="form-control input-lg" placeholder="Username"
                               required/>
                    </div>
                    <div className="form-group">
                        <input type="text" ref="inputFirstName" id="signup-firstname" className="form-control input-lg"
                               placeholder="First name" required/>
                    </div>
                    <div className="form-group">
                        <input type="text" ref="inputLastName" id="signup-lastname" className="form-control input-lg"
                               placeholder="Last name" required/>
                    </div>
                    <div className="form-group">
                        <input type="email" ref="inputEmail" id="signup-email" className="form-control input-lg" placeholder="Email"
                               required/>
                    </div>
                    <div className="form-group inner-addon-lg right-addon">
                        {passStrength === 'weak' ? '' :
                            (passStrength === 'medium' ?
                                <i className="glyphicon glyphicon-exclamation-sign text-warning"></i> :
                                <i className="glyphicon glyphicon-ok-sign text-success"></i>)}
                        <input type="password" ref="inputPass" id="signup-password" className="form-control input-lg"
                               placeholder="Password" required
                                onChange={() => {
                                    this.estimatePassStreng('inputPass');
                                }}/>
                    </div>
                    <div className="form-group inner-addon-lg right-addon">
                        {passConfirmStrength === 'weak' ? '' :
                            (passConfirmStrength === 'medium' ?
                                <i className="glyphicon glyphicon-exclamation-sign text-warning"></i> :
                                <i className="glyphicon glyphicon-ok-sign text-success"></i>)}
                        <input type="password" ref="inputConfirmPass"  id="signup-confirm-password" className="form-control input-lg"
                               placeholder="Confirm password" required
                               onChange={() => {
                                   this.estimatePassStreng('inputConfirmPass');
                               }}/>
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
