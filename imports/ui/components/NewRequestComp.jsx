import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import {DotLoader} from 'react-spinners';

import {Requests} from '../../api/blockchain';

class NewRequestComp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading flags
            loadingPendTrans: false,

            // Data// Data
            balance: {},
            allBalances: [],
            pendTransPool: [],

            // Request send flags
            requestSending: false,
            requestRemoving: false,

            // Request Type Notice
            requestNotice: null,

            // SweetAlert
            alert: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    sendCoin() {
        const wallet = Meteor.user().profile.address;
        const walletKey = Meteor.user().profile.pubKey;
        const walletOwner = Meteor.user().profile.fullName;
        const amount = parseFloat(document.getElementById('amountInput').value);
        const month = parseInt(document.getElementById('monthInput').value);
        const year = parseInt(document.getElementById('yearInput').value);
        const type = parseInt(document.getElementById('typeInput').value);

        const requestData = {
            data: {
                'wallet': wallet,
                'walletKey': walletKey,
                'walletOwner': walletOwner,
                'amount': amount,
                'type': type,
                'month': month,
                'year': year
            }
        };

        this.setState({requestSending: true});

        Meteor.call('newRequest.post', requestData, (err, res) => {
            if (err) {
                NotificationManager.error(err.reason, 'Error', 3000);
            } else {
                NotificationManager.success('New request submitted', 'Success', 3000);
            }
            setTimeout(() => {
                this.setState({requestSending: false});
            }, 1000);
        });
    }

    removeTrans(transaction) {
        const txId = transaction.id;

        const requestData = {
            data: {
                'txId': txId
            }
        };

        this.setState({requestRemoving: true});

        Meteor.call('removeRequest.post', requestData, (err, res) => {
            if (err) {
                NotificationManager.error(err.message, 'Error', 3000);
            } else {
                NotificationManager.success('Your request removed', 'Success', 3000);
            }
            setTimeout(() => {
                this.setState({requestRemoving: false});
            }, 1000);
        });
    }

    onChangeRequestType() {
        let currentUser = this.props.currentUser;
        let isSuperUser = Roles.userIsInRole(currentUser, 'superuser');
        const type = parseInt(document.getElementById('typeInput').value);
        switch (type) {
            case 0:
                this.setState({requestNotice: null});
                break;
            case 2:
                let availableFund = 0;
                let borrowingAmt = 0;
                let borrowQuota = 0;
                let borrowNoticeContext = "Cannot borrow from fund.";
                if (this.props.balance) {
                    borrowingAmt = this.props.balance.lend;
                    borrowQuota = 20 - borrowingAmt;
                }
                if (this.props.allBalances && this.props.allBalances[0]) {
                    availableFund = this.props.allBalances[0].deposit - this.props.allBalances[0].lend;
                    if (availableFund > borrowQuota) {
                        borrowNoticeContext = "You can borrow up to " + borrowQuota + " DCF.";
                    } else if (borrowQuota > availableFund && availableFund > 0) {
                        borrowNoticeContext = "You can borrow up to " + availableFund + " DCF.";
                    }
                }

                if (!isSuperUser) {
                    this.setState({
                        requestNotice:
                            <div className="alert alert-info" role="alert">
                                <strong>{availableFund} DCF</strong> is available for lending. {borrowNoticeContext}
                            </div>
                    });
                }
                break;
            case 3:
                let borrowingAmount = 0;
                let borrowAmtNotice = "0 DCF";
                let payNoticeContext = "You don't need to pay.";
                if (this.props.balance) {
                    borrowingAmount = this.props.balance.lend;
                    if (borrowingAmount > 0) {
                        borrowAmtNotice = borrowingAmount + " DCF";
                        payNoticeContext = "Don't pay more than " + borrowingAmount + " DCF.";
                    }
                }
                this.setState({
                    requestNotice:
                        <div className="alert alert-info" role="alert">
                            You are borrowing <strong>{borrowAmtNotice}</strong>. {payNoticeContext}
                        </div>
                });
                break;
        }
    }

    timeAgo(time) {
        const units = [
            {name: "second", limit: 60, in_seconds: 1},
            {name: "minute", limit: 3600, in_seconds: 60},
            {name: "hour", limit: 86400, in_seconds: 3600},
            {name: "day", limit: 604800, in_seconds: 86400},
            {name: "week", limit: 2629743, in_seconds: 604800},
            {name: "month", limit: 31556926, in_seconds: 2629743},
            {name: "year", limit: null, in_seconds: 31556926}
        ];
        let diff = (new Date() - new Date(time)) / 1000;
        if (diff < 5) return "just now";

        let i = 0;
        let unit = "";
        while (unit = units[i++]) {
            if (diff < unit.limit || !unit.limit) {
                diff = parseInt(Math.floor(diff / unit.in_seconds));
                return diff + " " + unit.name + (diff > 1 ? "s" : "") + " ago";
            }
        }

        return "";
    }

    render() {
        let currentUser = this.props.currentUser;
        let isAdmin = Roles.userIsInRole(currentUser, 'administrator');
        let isApprover = Roles.userIsInRole(currentUser, 'approver');
        let isSuperUser = Roles.userIsInRole(currentUser, 'superuser');
        let isUser = Roles.userIsInRole(currentUser, 'user');
        let currentDate = new Date().getDate();
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        if (currentDate >= 27) {
            currentMonth++;
            if (currentMonth >= 12) {
                currentYear++;
            }
        }

        let pendTransPool = this.props.pendingRequests;
        let pendTransRender = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    No pending transaction found in the pool
                </li>
            )
        });

        if (pendTransPool && pendTransPool.length > 0) {
            pendTransRender = pendTransPool.map((transaction) => {
                let txDCFs = transaction.txDCFs.map((txDCF) => {
                    return (
                        <div key={txDCF.timestamp}>
                            <div>
                                <span className="lead"><b>{txDCF.amount} DCF</b></span>
                            </div>
                            <div>
                                <small>from&nbsp;
                                    <div className="overflow-text">
                                        <Link to={`/address/${txDCF.wallet}`}>
                                            {txDCF.wallet}
                                        </Link>
                                    </div>
                                </small>
                            </div>
                            <div>
                                <span>{txDCF.walletOwner}</span> {txDCF.type === 0 ?
                                'deposit' : (txDCF.type === 1 ? 'withdraw' :
                                    txDCF.type === 2 ? 'borrow' : 'pay')}s {this.timeAgo(txDCF.timestamp)}
                            </div>
                            <div>
                                <small>for period {txDCF.month}.{txDCF.year}</small>
                            </div>
                        </div>
                    );
                });

                return (
                    <li key={transaction.id} className={'list-group-item ' +
                    (transaction.txDCFs[0].type === 0 ? 'item-trans-deposit' :
                        (transaction.txDCFs[0].type === 1 ? 'item-trans-withdraw' :
                            (transaction.txDCFs[0].type === 2 ? 'item-trans-borrow' :
                                'item-trans-pay')))}>
                        <div className="row">
                            <div className="col-xs-9">
                                {txDCFs}
                            </div>
                            <div className="col-xs-3 text-right">
                                <div className="btn-group-vertical btn-group-sm" role="group"
                                     aria-label="Transaction pending">
                                    <button type="button" className="btn btn-default btn-danger"
                                            onClick={() => {
                                                this.removeTrans(transaction)
                                            }}>
                                        <span className="glyphicon glyphicon-trash" aria-hidden="true"/>
                                        <span className="hidden-xs">&nbsp;Remove</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                );
            });
        }

        return (
            <div>
                <h3>Create new request</h3>
                <div className='container-fluid'>
                    <form>
                        {this.state.requestNotice}
                        <div className="row">
                            <div className="col-xs-6 col-sm-6 col-md-3">
                                <div className="form-group">
                                    <label htmlFor="typeInput">Request type</label>
                                    <select className="form-control input-lg"
                                            id="typeInput"
                                            defaultValue='Deposit'
                                            onChange={() => {
                                                this.onChangeRequestType();
                                            }}>
                                        <option value="0">Deposit</option>
                                        <option value="2">Borrow</option>
                                        <option value="3">Pay</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-xs-6 col-sm-6 col-md-3">
                                <div className="form-group">
                                    <label htmlFor="amountInput">Amount (DCF)</label>
                                    <input type="number"
                                           className="form-control input-lg"
                                           id="amountInput"
                                           placeholder="Amount" min="0.1" max={isSuperUser ? "" : "20"}
                                           step="0.1"
                                           defaultValue="1"/>
                                </div>
                            </div>
                            <div className="col-xs-6 col-sm-6 col-md-3">
                                <div className="form-group">
                                    <label htmlFor="monthInput">Month</label>
                                    <select className="form-control input-lg"
                                            id="monthInput"
                                            defaultValue={currentMonth + 1}>
                                        <option>1</option>
                                        <option>2</option>
                                        <option>3</option>
                                        <option>4</option>
                                        <option>5</option>
                                        <option>6</option>
                                        <option>7</option>
                                        <option>8</option>
                                        <option>9</option>
                                        <option>10</option>
                                        <option>11</option>
                                        <option>12</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-xs-6 col-sm-6 col-md-3">
                                <div className="form-group">
                                    <label htmlFor="yearInput">Year</label>
                                    <select className="form-control input-lg"
                                            id="yearInput"
                                            defaultValue={currentYear}>
                                        <option>{currentYear - 1}</option>
                                        <option>{currentYear}</option>
                                        <option>{currentYear + 1}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button type="button" className="btn btn-success btn-lg"
                                onClick={() => {
                                    this.sendCoin();
                                }}
                                disabled={this.state.requestSending}>
                            {!this.state.requestSending ?
                                <div>
                                                <span className="glyphicon glyphicon-ok" aria-hidden="true">
                                                </span>&nbsp;
                                    Submit
                                </div> :
                                <div>Processing&nbsp;
                                    <div className="loader">
                                        <DotLoader
                                            size={18}
                                            color={'#ffffff'}
                                            loading={this.state.requestSending}
                                        /></div>
                                </div>}
                        </button>
                    </form>
                </div>

                <h3>Pending requests</h3>
                <div className='container-fluid'>
                    <div className="loader-container">
                        <DotLoader
                            color={'#86bc25'}
                            loading={this.state.loadingPendTrans}
                        />
                    </div>

                    {this.state.loadingPendTrans ? '' :
                        <div>
                            <form className="form-horizontal" role="form">
                                {pendTransRender}
                            </form>
                        </div>}
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('requests');
    return {
        pendingRequests: Requests.find().fetch(),
        currentUser: Meteor.user()
    };
})(NewRequestComp);