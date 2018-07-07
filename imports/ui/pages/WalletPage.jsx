import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';

import WalletInfoComp from '../components/WalletInfoComp';
import NewRequestComp from '../components/NewRequestComp';
import ApproveRequestComp from '../components/ApproveRequestComp';

class WalletPage extends Component {
    constructor(props) {
        super(props);

        // this.state = {
        //     // Data
        //     balance: {},
        //     allBalances: [],
        //     pendTransPool: [],
        //     apprTransPool: [],
        //     apprFiltedTransPool: [],
        //     didMount: false,
        //
        //     // Request send flags
        //     requestSending: false,
        //     requestRemoving: false,
        //
        //     // Filter flags
        //     apprTransTypeFilter: -1,
        //
        //     // Request Type Notice
        //     requestNotice: null,
        //
        //     // SweetAlert
        //     alert: null
        // };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    render() {
        let currentUser = this.props.currentUser;
        let isAdmin = Roles.userIsInRole(currentUser, 'administrator');
        let isApprover = Roles.userIsInRole(currentUser, 'approver');
        let isUser = Roles.userIsInRole(currentUser, 'user');

        return (
            <div>
                {this.state.alert}

                <div className="container">
                    <header>
                        <h1>Wallet</h1>
                    </header>

                    <div className="row">
                        <div className="col-sm-12 col-md-4">
                            <WalletInfoComp/>
                        </div>
                        <div className="col-sm-12 col-md-8">
                            {isAdmin || isUser ?
                                <NewRequestComp/> : ''}

                            {isAdmin || isApprover ?
                                <ApproveRequestComp/> : ''}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    return {
        currentUser: Meteor.user()
    };
})(WalletPage);