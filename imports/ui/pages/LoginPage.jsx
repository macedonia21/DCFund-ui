import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withHistory, Link} from 'react-router-dom';
import {createContainer} from 'meteor/react-meteor-data';
import Particles from 'react-particles-js';

export default class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        let email = document.getElementById('login-email').value;
        let password = document.getElementById('login-password').value;
        Meteor.loginWithPassword(email, password, (err) => {
            if (err) {
                document.getElementById('login-email').value = '';
                document.getElementById('login-password').value = '';

                NotificationManager.error('Account or password not valid', 'Error', 3000);
            } else {
                this.props.history.push('/');
            }
        });
    }

    render() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const particleCount = Math.round((width * height) / 10000) + 10;
        return (
            <div className="container">
                <form id="login-form" className="form center-block form-signin" onSubmit={this.handleSubmit}>
                    <h2 className="text-center">Login</h2>
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
                        <p className="text-center"><Link to="/forgot-password">Forgot your password?</Link></p>
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
