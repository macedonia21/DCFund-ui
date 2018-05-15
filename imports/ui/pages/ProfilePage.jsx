import React, {Component} from 'react';
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
            passwordUpdating: false
        };

        this.logout = this.logout.bind(this);
    }

    handleChange(val) {
        return val;
    }

    logout() {
        Meteor.logout((err) => {
            if (err) {
                console.log(err.reason);
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

        this.setState({
            profileUpdate: false,
            profileUpdating: true
        });
        Meteor.call('userUpdateProfile.account', updateData, (err, res) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log('Profile updated');
            }
            setTimeout(() => {
                this.setState({profileUpdating: false});
            }, 1000);

        });
    }

    changePassword() {
        const currentPass = document.getElementById('currentPassInput').value.toString();
        const newPass = document.getElementById('newPassInput').value.toString();
        const confirmPass = document.getElementById('confirmPassInput').value.toString();

        const updateData = {
            data: {
                'newPass': newPass
            }
        };

        this.setState({passwordUpdating: true});
        Meteor.call('userChangePassword.account', updateData, (err, res) => {
            if (err) {
                console.log(err.message);
            } else {
                console.log('Password changed');
            }
            setTimeout(() => {
                this.setState({passwordUpdating: false});
            }, 1000);
        });

        this.logout();
    }

    render() {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);
        let firstName = '';
        let lastName = '';

        if (loggedIn) {
            console.log('reset name');
            firstName = currentUser.profile.firstName;
            lastName = currentUser.profile.lastName;
        }

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
                                    <div className="avatar">
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
                                                    }
                                                    this.setState({profileUpdate: !this.state.profileUpdate});
                                                }}
                                                disabled={this.state.profileUpdating}>
                                            {!this.state.profileUpdating ? 'Update profile' :
                                                <DotLoader
                                                    size={20}
                                                    color={'#ffffff'}
                                                    loading={this.state.profileUpdating}
                                                />}
                                        </button>
                                        {this.state.profileUpdate ?
                                            <button type="button" className="btn btn-default"
                                                    onClick={() => {
                                                        this.setState({profileUpdate: false});
                                                    }}
                                                    disabled={this.state.profileUpdating}>
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
                                            <div className="form-group">
                                                <label className="col-sm-4 control-label">New password:</label>
                                                <div className="col-sm-8">
                                                    <input className="form-control"
                                                           type="password" id="newPassInput"/>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="col-sm-4 control-label">Confirm password:</label>
                                                <div className="col-sm-8">
                                                    <input className="form-control"
                                                           type="password" id="confirmPassInput"/>
                                                </div>
                                            </div>
                                        </div> : ''}
                                    <div className="form-group btn-toolbar" role="toolbar">
                                        <button type="button" className="btn btn-default btn-success"
                                                onClick={() => {
                                                    if (this.state.passwordUpdate) {
                                                        this.changePassword();
                                                    }
                                                    this.setState({passwordUpdate: !this.state.passwordUpdate});
                                                }}
                                                disabled={this.state.passwordUpdating}>
                                            {!this.state.passwordUpdating ? 'Change password' :
                                            <DotLoader
                                                size={20}
                                                color={'#ffffff'}
                                                loading={this.state.passwordUpdating}
                                            />}
                                        </button>
                                        {this.state.passwordUpdate ?
                                            <button type="button" className="btn btn-default"
                                                    onClick={() => {
                                                        this.setState({passwordUpdate: false});
                                                    }}>
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