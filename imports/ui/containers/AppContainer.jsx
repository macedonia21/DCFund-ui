import React, {Component} from 'react';
import {withHistory} from 'react-router-dom';

import MainContainer from './MainContainer';

export default class AppContainer extends Component {
    constructor(props) {
        super(props);
        this.state = this.getMeteorData();
        this.logout = this.logout.bind(this);
    }

    getMeteorData() {
        return {
            isAuthenticated: Meteor.userId() !== null,
        };
    }

    componentWillMount() {
        if (!this.state.isAuthenticated) {
            this.props.history.push('/login');
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.state.isAuthenticated) {
            this.props.history.push('/login');
        }
    }

    logout(e) {
        e.preventDefault();
        Meteor.logout((err) => {
            if (err) {
                console.log(err.reason);
            } else {
                this.props.history.push('/login');
            }
        });
        this.props.history.push('/login');
    }

    render() {
        return (
            <div>
                <header>
                    <nav className="navbar navbar-default navbar-static-top navbar-fixed-top">
                        <div className="container">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle" data-toggle="collapse"
                                        data-target="#myNavbar">
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                    <span className="icon-bar"></span>
                                </button>
                                <a className="navbar-brand" href="/">DCFund Wallet</a>
                            </div>
                            <div className="collapse navbar-collapse" id="myNavbar">
                                <ul className="nav navbar-nav">
                                    <li>
                                        <p className="navbar-text">Network: Testnet</p>
                                    </li>
                                </ul>
                                <ul className="nav navbar-nav navbar-right">
                                    <li><a href="/block">
                                        <span className="glyphicon glyphicon-link" aria-hidden="true"></span> Blockchain
                                    </a></li>
                                    <li><a href="/profile">
                                        <span className="glyphicon glyphicon-user" aria-hidden="true"></span> Profile
                                    </a></li>
                                    <li><a href="#" onClick={this.logout}>
                                        <span className="glyphicon glyphicon-off" aria-hidden="true"></span> Logout
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                </header>
                <main role="main" className="container">
                    <MainContainer/>
                </main>
                <footer className="footer">
                    <div className="container">
                        <span className="text-muted">
                            Copyright © {new Date().getFullYear()} DCFund Wallet <i>Alpha</i>
                        </span>
                    </div>
                </footer>
            </div>
        );
    }
}
