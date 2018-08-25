import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';

import WalletInfoComp from '../components/WalletInfoComp';
import NewRequestComp from '../components/NewRequestComp';
import ApproveRequestComp from '../components/ApproveRequestComp';
import AdminBoardComp from '../components/AdminBoardComp';

import ModalComp from '../components/ModalComp';

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

            // Modal
            classShowHideHelp: 'modal fade bs-example-modal-lg display-none'
        };

        this.forceRefresh = this.forceRefresh.bind(this);
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

    forceRefresh() {
        this.setState({
            loadingBalance: true
        });
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

    handleCloseHelp() {
        this.setState({classShowHideHelp: 'modal fade bs-example-modal-lg display-none'});
    }

    handleShowHelp() {
        this.setState({classShowHideHelp: 'modal fade bs-example-modal-lg in display-block'});
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
                        <h1>Wallet&nbsp;
                            <small>
                            <span className="glyphicon glyphicon-question-sign"
                                  onClick={() => {
                                      this.handleShowHelp();
                                  }}
                                  aria-hidden="true"/>
                            </small>
                        </h1>
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
                                <ApproveRequestComp
                                    balance={this.state.balance}
                                    refresh={this.forceRefresh}/> : ''}

                            {isAdmin ?
                                <AdminBoardComp/> : ''}
                        </div>
                    </div>

                    <ModalComp classShowHideHelp={this.state.classShowHideHelp} handleClose={() => {
                        this.handleCloseHelp()
                    }}/>
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