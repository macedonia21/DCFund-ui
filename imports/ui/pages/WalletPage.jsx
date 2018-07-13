import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';

import WalletInfoComp from '../components/WalletInfoComp';
import NewRequestComp from '../components/NewRequestComp';
import ApproveRequestComp from '../components/ApproveRequestComp';
import SendMailComp from '../components/SendMailComp';

class WalletPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // SweetAlert
            alert: null,

            // Loading flags
            loadingBalance: true,

            // Data
            balance: {},
            allBalances: [],
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    componentDidMount() {
        this.fetchBalance();
    }

    componentDidUpdate() {
        if (this.state.loadingBalance) {
            this.fetchBalance();
        }
    }

    fetchBalance() {
        Meteor.call('balance.get', (err, res) => {
            if (err) {
                this.setState({balance: null});
            } else {
                if (res.myBalance) {
                    this.setState({balance: res.myBalance});
                }
                if (res.allBalances) {
                    this.setState({allBalances: res.allBalances});
                }
            }
            this.setState({loadingBalance: false});
        });
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
                            <WalletInfoComp balance={this.state.balance}
                                            allBalances={this.state.allBalances}
                                            loadingBalance={this.state.loadingBalance}/>
                        </div>
                        <div className="col-sm-12 col-md-8">
                            {isUser ?
                                <NewRequestComp balance={this.state.balance}
                                                allBalances={this.state.allBalances}/> : ''}

                            {isApprover ?
                                <ApproveRequestComp/> : ''}

                            {isAdmin ?
                                <SendMailComp/> : ''}
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