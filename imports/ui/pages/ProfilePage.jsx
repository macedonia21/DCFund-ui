import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {DotLoader} from 'react-spinners';
import reactHashAvatar from 'react-hash-avatar';
import renderHTML from 'react-render-html';

class ProfilePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

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
                                        {renderHTML(reactHashAvatar(currentUser.profile.address, {size: 256, radius: '50%'}))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-8">
                                <form className="form-horizontal" role="form">
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Username:</label>
                                        <div className="col-sm-8">
                                            <p className="form-control-static">{currentUser.username}</p>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Address:</label>
                                        <div className="col-sm-8">
                                            <p className="form-control-static">{currentUser.profile.address}</p>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Email:</label>
                                        <div className="col-sm-8">
                                            <p className="form-control-static">{currentUser.emails[0].address}</p>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">First name:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="text"
                                                   value={currentUser.profile.firstName} disabled/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Last name:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="text"
                                                   value={currentUser.profile.lastName} disabled/>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Current password:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="password" value="11111122333"
                                                   disabled/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">New password:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="password" value="11111122333"
                                                   disabled/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="col-sm-4 control-label">Confirm password:</label>
                                        <div className="col-sm-8">
                                            <input className="form-control" type="password" value="11111122333"
                                                   disabled/>
                                        </div>
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