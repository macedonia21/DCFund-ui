import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {NotificationManager} from 'react-notifications';
import {withHistory, Link} from 'react-router-dom';
import {Accounts} from 'meteor/accounts-base';
import Particles from 'react-particles-js';

export default class SignupPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            passStrength: 'invalid',
            passConfirmStrength: 'invalid'
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
        const isUser = true

        if (password.length < 6) {
            ReactDOM.findDOMNode(this.refs.inputPass).value = '';
            ReactDOM.findDOMNode(this.refs.inputConfirmPass).value = '';
            this.setState({passStrength: 'invalid'});

            NotificationManager.error('Password must have at least 6 characters', 'Error', 3000);
            return;
        }

        if (password !== confirmPassword) {
            ReactDOM.findDOMNode(this.refs.inputPass).value = '';
            ReactDOM.findDOMNode(this.refs.inputConfirmPass).value = '';
            this.setState({passStrength: 'invalid'});

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
                this.setState({passStrength: 'invalid'});

                NotificationManager.error(err.reason, 'Error', 3000);
            } else {
                // Clear form
                ReactDOM.findDOMNode(this.refs.inputUser).value = '';
                ReactDOM.findDOMNode(this.refs.inputFirstName).value = '';
                ReactDOM.findDOMNode(this.refs.inputLastName).value = '';
                ReactDOM.findDOMNode(this.refs.inputEmail).value = '';
                ReactDOM.findDOMNode(this.refs.inputPass).value = '';
                ReactDOM.findDOMNode(this.refs.inputConfirmPass).value = '';
                this.setState({passStrength: 'invalid'});

                NotificationManager.success('Your account created, open wallet in few seconds', 'Success', 3000);
                setTimeout(() => {
                    this.props.history.push('/');
                }, 3000);
            }
        });
    }

    estimatePassStreng(ref) {
        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        const mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        const weakRegex = new RegExp("^(?=.{6,})");

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
        } else if (weakRegex.test(pass)) {
            result = 'weak';
        } else {
            result = 'invalid';
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
        const width = window.innerWidth;
        const height = window.innerHeight;
        const particleCount = Math.round((width * height) / 10000) + 10;
        return (
            <div className="container">
                <form id="login-form" className="form center-block form-signup" onSubmit={this.handleSubmit}>
                    <h2 className="text-center">Sign up</h2>
                    <div className="form-group">
                        <input type="text" ref="inputUser" id="signup-username" className="form-control input-lg"
                               placeholder="Username"
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
                        <input type="email" ref="inputEmail" id="signup-email" className="form-control input-lg"
                               placeholder="Email"
                               required/>
                    </div>
                    <div className="form-group inner-addon-lg right-addon">
                        {passStrength === 'weak' ?
                            <i className="glyphicon glyphicon-certificate text-brand-error"/> :
                            (passStrength === 'medium' ?
                                <i className="glyphicon glyphicon-certificate text-brand-warning"/> :
                                (passStrength === 'strong' ?
                                    <i className="glyphicon glyphicon-certificate text-brand-success"/> :
                                    ''))}
                        <input type="password" ref="inputPass" id="signup-password" className="form-control input-lg"
                               placeholder="Password" required
                               onChange={() => {
                                   this.estimatePassStreng('inputPass');
                               }}/>
                    </div>
                    <div className="form-group inner-addon-lg right-addon">
                        <input type="password" ref="inputConfirmPass" id="signup-confirm-password"
                               className="form-control input-lg"
                               placeholder="Confirm password" required/>
                    </div>
                    <div className="form-group text-center">
                        <input type="submit" id="login-button" className="btn btn-lg btn-success btn-block"
                               value="Sign Up"/>
                    </div>
                    <div className="form-group text-center">
                        <p className="text-center">Already have an account? Login <Link to="/login">here</Link></p>
                        <p>
                            <small>Copyright © {new Date().getFullYear()} DCFund Wallet</small>
                        </p>
                    </div>
                </form>
                <Particles className="particles-js" canvasClassName="particles-js-canvas-el"
                    params={{
                        particles: {
                            number: {
                                value: particleCount,
                                density: {
                                    enable: true,
                                    value_area: 600
                                }
                            },
                            color: {
                                value: "#86bc25"
                            },
                            size: {
                                value: 3,
                                random: true
                            },
                            opacity: {
                                value: 1
                            },
                            line_linked: {
                                distance: 150,
                                color: "#86bc25",
                                opacity: 0.8,
                                width: 1
                            },
                            move: {
                                speed: 8
                            }
                        }
                    }}
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                />
            </div>
        );
    }
}
