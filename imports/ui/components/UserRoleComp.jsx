import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import * as _ from 'lodash';

export default class UserRoleComp extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const user = this.props.user;
        return (
            <div className="form-group">
                <div className="col-xs-4">
                    <b>{user.profile.fullName}</b>
                </div>
                <div className="col-xs-4">
                    {user.emails[0].address}
                </div>
                <div className="col-xs-1 text-center checkbox checkbox-success">
                    <input type="checkbox" checked={_.indexOf(user.roles, "admin") >= 0}
                           onChange={() => {this.props.onCheckboxChange(user._id, "admin")}}/>
                    <label><small>&nbsp;</small></label>
                </div>
                <div className="col-xs-1 text-center checkbox checkbox-success">
                    <input type="checkbox" checked={_.indexOf(user.roles, "approver") >= 0}
                           onChange={() => this.props.onCheckboxChange(user._id, "approver")}/>
                    <label><small>&nbsp;</small></label>
                </div>
                <div className="col-xs-1 text-center checkbox checkbox-success">
                    <input type="checkbox" checked={_.indexOf(user.roles, "superuser") >= 0}
                           onChange={() => {this.props.onCheckboxChange(user._id, "superuser")}}/>
                    <label><small>&nbsp;</small></label>
                </div>
                <div className="col-xs-1 text-center checkbox checkbox-success">
                    <input type="checkbox" checked={_.indexOf(user.roles, "user") >= 0}
                           onChange={() => {this.props.onCheckboxChange(user._id, "user")}}/>
                    <label><small>&nbsp;</small></label>
                </div>
            </div>
        );
    }
}