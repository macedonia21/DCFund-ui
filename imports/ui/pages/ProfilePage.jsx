import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Accounts} from 'meteor/accounts-base';
import {NotificationManager} from 'react-notifications';
import {withHistory} from 'react-router-dom';
import {withTracker} from 'meteor/react-meteor-data';
import {DotLoader} from 'react-spinners';
import reactHashAvatar from 'react-hash-avatar';
import renderHTML from 'react-render-html';

class ProfilePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            profileUpdate: false,
            profileUpdating: false,
            passwordUpdate: false,
            passwordUpdating: false,

            passStrength: 'invalid',
            passConfirmStrength: 'invalid'
        };

        this.logout = this.logout.bind(this);
    }

    handleChange(val) {
        return val;
    }

    estimatePassStreng(ref) {
        var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        var weakRegex = new RegExp("^(?=.{6,})");

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

    logout() {
        Meteor.logout((err) => {
            if (err) {
                NotificationManager.error(err.message, 'Error', 3000);
            } else {
                this.props.history.push('/login');
            }
        });
        this.props.history.push('/login');
    }

    updateProfile() {
        const firstName = document.getElementById('firstNameInput').value.toString();
        const lastName = document.getElementById('lastNameInput').value.toString();

        const updateData = {
            data: {
                'firstName': firstName,
                'lastName': lastName
            }
        };

        this.setState({profileUpdating: true});
        Meteor.call('userUpdateProfile.account', updateData, (err, res) => {
            if (err) {
                NotificationManager.error('Cannot update profile: ' + err.message, 'Error', 3000);
                this.setState({profileUpdating: false});
            } else {
                NotificationManager.success('Your profile is updated', 'Success', 3000);
                setTimeout(() => {
                    this.setState({
                        profileUpdate: false,
                        profileUpdating: false
                    });
                }, 1000);
            }
        });
    }

    changePassword() {
        const currentPass = document.getElementById('currentPassInput').value.toString();
        const newPass = document.getElementById('newPassInput').value.toString();
        const confirmPass = document.getElementById('confirmPassInput').value.toString();

        if (newPass === currentPass) {
            NotificationManager.error('Cannot change password: New password must different from current password', 'Error', 3000);
            return;
        }

        if (newPass !== confirmPass) {
            NotificationManager.error('Cannot change password: Confirm password not correct', 'Error', 3000);
            return;
        }

        this.setState({passwordUpdating: true});
        Accounts.changePassword(currentPass, newPass, (err) => {
            if (err) {
                NotificationManager.error('Cannot change password: ' + err.message, 'Error', 3000);
                this.setState({passwordUpdating: false});
            } else {
                NotificationManager.success('Your password is changed, logout in few seconds', 'Success', 3000);
                setTimeout(() => {
                    this.setState({
                        passwordUpdate: false,
                        passwordUpdating: false
                    });
                    this.logout();
                }, 3000);
            }
        });
    }

    render() {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);
        let firstName = '';
        let lastName = '';

        if (loggedIn) {
            firstName = currentUser.profile.firstName;
            lastName = currentUser.profile.lastName;
        }

        const passStrength = this.state.passStrength;
        const passConfirmStrength = this.state.passConfirmStrength;

        return (
            <div>
                <div className="container">
                    <header>
                        <h1>Profile</h1>
                    </header>

                    <div className="loader-container">
                        <DotLoader
                            color={'#86bc25'}
                            loading={!loggedIn}
                        />
                    </div>

                    {!loggedIn ? '' :
                        <div className="row">
                            <div className="col-sm-12 col-md-4">
                                <div className="text-center">
                                    <div className="avatar fade in">
                                        {renderHTML(reactHashAvatar(
                                            currentUser.profile.address +
                                            firstName + lastName,
                                            {size: 256, radius: '50%'})
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-8">
                                <form className="form-horizontal" role="form">
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Username:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="text"
                                                   value={currentUser.username} readOnly/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Address:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="text"
                                                   value={currentUser.profile.address} readOnly/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Email:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="text"
                                                   value={currentUser.emails[0].address} readOnly/>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">First name:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="text"
                                                   id="firstNameInput"
                                                   defaultValue={firstName}
                                                   readOnly={!this.state.profileUpdate}
                                                   disabled={this.state.profileUpdating}
                                                   onChange={() => {
                                                       this.handleChange(firstName);
                                                   }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Last name:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="text"
                                                   id="lastNameInput"
                                                   defaultValue={lastName}
                                                   readOnly={!this.state.profileUpdate}
                                                   disabled={this.state.profileUpdating}
                                                   onChange={() => {
                                                       this.handleChange(lastName);
                                                   }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group btn-toolbar" role="toolbar">
                                        <button type="button" className="btn btn-default btn-success"
                                                onClick={() => {
                                                    if (this.state.profileUpdate) {
                                                        this.updateProfile();
                                                    } else {
                                                        this.setState({profileUpdate: true});
                                                    }
                                                }}
                                                disabled={this.state.profileUpdating}>
                                            {!this.state.profileUpdating ?
                                                <div>
                                                    <span className="glyphicon glyphicon-pencil" aria-hidden="true">
                                                    </span>&nbsp;
                                                    Update profile
                                                </div> :
                                                <div>Processing&nbsp;
                                                    <div className="loader">
                                                        <DotLoader
                                                            size={14}
                                                            color={'#ffffff'}
                                                            loading={this.state.profileUpdating}
                                                        /></div>
                                                </div>}
                                        </button>
                                        {this.state.profileUpdate && !this.state.profileUpdating ?
                                            <button type="button" className="btn btn-default"
                                                    onClick={() => {
                                                        this.setState({profileUpdate: false});
                                                    }}
                                                    disabled={this.state.profileUpdating}>
                                                <span className="glyphicon glyphicon-remove" aria-hidden="true">
                                                    </span>&nbsp;
                                                Cancel
                                            </button> : ''}
                                    </div>
                                    {this.state.passwordUpdate ?
                                        <div>
                                            <div className="form-group">
                                                <label className="col-sm-4 control-label">Current password:</label>
                                                <div className="col-sm-8">
                                                    <input className="form-control"
                                                           type="password" id="currentPassInput"/>
                                                </div>
                                            </div>
                                            <div className="form-group inner-addon right-addon">
                                                <label className="col-sm-4 control-label">New password:</label>
                                                <div className="col-sm-8">
                                                    {passStrength === 'weak' ?
                                                        <i className="glyphicon glyphicon-certificate text-brand-error pad-right"></i> :
                                                        (passStrength === 'medium' ?
                                                            <i className="glyphicon glyphicon-certificate text-brand-warning pad-right"></i> :
                                                            (passStrength === 'strong' ?
                                                                <i className="glyphicon glyphicon-certificate text-brand-success pad-right"></i>:
                                                                ''))}
                                                    <input className="form-control" ref="inputPass"
                                                           type="password" id="newPassInput" required
                                                           onChange={() => {
                                                               this.estimatePassStreng('inputPass');
                                                           }}/>
                                                </div>
                                            </div>
                                            <div className="form-group inner-addon right-addon">
                                                <label className="col-sm-4 control-label">Confirm password:</label>
                                                <div className="col-sm-8">
                                                    <input className="form-control" ref="inputConfirmPass"
                                                           type="password" id="confirmPassInput" required/>
                                                </div>
                                            </div>
                                        </div> : ''}
                                    <div className="form-group btn-toolbar" role="toolbar">
                                        <button type="button" className="btn btn-default btn-success"
                                                onClick={() => {
                                                    if (this.state.passwordUpdate) {
                                                        this.changePassword();
                                                    } else {
                                                        this.setState({passwordUpdate: true});
                                                    }
                                                }}
                                                disabled={this.state.passwordUpdating}>
                                            {!this.state.passwordUpdating ?
                                                <div>
                                                    <span className="glyphicon glyphicon-lock" aria-hidden="true">
                                                    </span>&nbsp;
                                                    Change password
                                                </div> :
                                                <div>Processing&nbsp;
                                                    <div className="loader">
                                                        <DotLoader
                                                            size={14}
                                                            color={'#ffffff'}
                                                            loading={this.state.passwordUpdating}
                                                        /></div>
                                                </div>}
                                        </button>
                                        {this.state.passwordUpdate ?
                                            <button type="button" className="btn btn-default"
                                                    onClick={() => {
                                                        this.setState({passwordUpdate: false});
                                                    }}
                                                    disabled={this.state.passwordUpdating}>
                                                <span className="glyphicon glyphicon-remove" aria-hidden="true">
                                                    </span>&nbsp;
                                                Cancel
                                            </button> : ''}
                                    </div>
                                </form>
                            </div>
                        </div>}
                </div>
            </div>
        );
    };
}

export default withTracker(() => {
    return {
        currentUser: Meteor.user(),
    };
})(ProfilePage);