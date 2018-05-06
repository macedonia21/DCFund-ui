import React, {Component} from 'react';
import { withTracker } from 'meteor/react-meteor-data';

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
                    <ul>
                        <li>Account: {loggedIn ? currentUser.username : ''}</li>
                        <li>Name</li>
                        <li>Email</li>
                        <li>DCF Address: {loggedIn ? currentUser.profile.address : ''}</li>
                    </ul>
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