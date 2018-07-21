import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Accounts} from 'meteor/accounts-base';
import {NotificationManager} from 'react-notifications';
import {withHistory} from 'react-router-dom';
import {createContainer} from 'meteor/react-meteor-data';

export default class ResetPasswordPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            passStrength: 'invalid'
        };
        this.handleSubmit = this.handleSubmit.bind(this);
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

    handleSubmit(e) {
        e.preventDefault();
        let password = ReactDOM.findDOMNode(this.refs.inputPass).value.trim();
        let passwordConfirm = ReactDOM.findDOMNode(this.refs.inputConfirm).value.trim();

        ReactDOM.findDOMNode(this.refs.inputPass).value = '';
        ReactDOM.findDOMNode(this.refs.inputConfirm).value = '';
        this.setState({passStrength: 'invalid'});

        if (password !== passwordConfirm) {
            NotificationManager.error('Cannot change password: Confirm password not correct', 'Error', 3000);
            return;
        }

        Accounts.resetPassword(this.props.match.params.token, password, (err) => {
            if (err) {
                NotificationManager.error('Something went wrong', 'Error', 3000);
            } else {
                NotificationManager.success('Your password has been changed, please login again', 'Success', 3000);
                setTimeout(() => {
                    this.props.history.push('/login');
                }, 3000);
            }
        });
    }

    render() {
        const passStrength = this.state.passStrength;
        return (
            <div className="container">
                <form id="login-form" className="form center-block form-signin" onSubmit={this.handleSubmit}>
                    <h2 className="text-center">Reset password</h2>
                    <div className="form-group inner-addon-lg right-addon">
                        {passStrength === 'weak' ?
                            <i className="glyphicon glyphicon-certificate text-brand-error"/> :
                            (passStrength === 'medium' ?
                                <i className="glyphicon glyphicon-certificate text-brand-warning"/> :
                                (passStrength === 'strong' ?
                                    <i className="glyphicon glyphicon-certificate text-brand-success"/> :
                                    ''))}
                        <input type="password" ref="inputPass" id="reset-pass" className="form-control input-lg"
                               placeholder="Password" required
                               onChange={() => {
                                   this.estimatePassStreng('inputPass');
                               }}/>
                    </div>
                    <div className="form-group">
                        <input type="password" ref="inputConfirm" id="reset-confirm-pass"
                               className="form-control input-lg"
                               placeholder="Confirm password" required/>
                    </div>
                    <div className="form-group text-center">
                        <input type="submit" id="login-button" className="btn btn-success btn-lg btn-block"
                               value="Reset"/>
                    </div>
                </form>
            </div>
        );
    }
}
