import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import {DotLoader} from 'react-spinners';

import { Requests } from '../../api/blockchain';

import WithdrawListComp from '../components/WithdrawListComp';

class ApproveRequestComp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading flags
            loadingApprTrans: false,

            // Data
            apprTransPool: [],
            apprFiltedTransPool: [],

            // Request send flags
            requestSending: false,
            requestRemoving: false,

            // Filter flags
            apprTransTypeFilter: -1,

            // Request Type Notice
            requestNotice: null,

            // SweetAlert
            alert: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    filterApprTransPool(filterType) {
        let filteredPool = [];
        if (this.props.apprTransPool) {
            if (filterType > -1) {
                filteredPool = this.state.apprTransPool.slice(0).filter((trans) => {
                    return trans.txDCFs[0].type === filterType;
                });
            } else {
                filteredPool = this.state.apprTransPool.slice(0);
            }
        }
        this.setState({apprTransTypeFilter: filterType});
        return filteredPool;
    }

    confirmTrans(transaction, isApproved) {
        const requestData = {
            data: {
                'txId': transaction.id,
                'isApproved': isApproved
            }
        };

        Meteor.call('confirmRequest.post', requestData, (err, res) => {
            if (err) {
                NotificationManager.error('Request removed or block cannot created', 'Error', 3000);
            } else {
                if (isApproved) {
                    NotificationManager.success('Request is approved', 'Success', 3000);
                } else {
                    NotificationManager.success('Request is rejected', 'Success', 3000);
                }
            }
        });
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
        let apprTransPool = [];
        if (this.props.apprTransPool) {
            if (this.state.apprTransTypeFilter > -1) {
                apprTransPool = this.props.apprTransPool.slice(0).filter((trans) => {
                    return trans.txDCFs[0].type === this.state.apprTransTypeFilter;
                });
            } else {
                apprTransPool = this.props.apprTransPool.slice(0);
            }
        }
        let countApprTrans = apprTransPool.length;
        let filterType = 'All';
        switch (this.state.apprTransTypeFilter) {
            case -1:
                filterType = 'All';
                break;
            case 0:
                filterType = 'Deposit';
                break;
            case 1:
                filterType = 'Withdraw';
                break;
            case 2:
                filterType = 'Borrow';
                break;
            case 3:
                filterType = 'Pay';
                break;
        }
        let apprTransRender = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    No transaction found for approval
                </li>
            )
        });

        if (apprTransPool && apprTransPool.length > 0) {
            apprTransRender = apprTransPool.map((transaction) => {
                let txDCFs = transaction.txDCFs.map((txDCF) => {
                    let borrowingAmt = null;
                    const allBalances = this.state.allBalances;
                    if (allBalances) {
                        const walletBalance = allBalances.find((balance) => {
                            return balance.wallet === txDCF.wallet;
                        });
                        if (walletBalance) {
                            borrowingAmt = walletBalance.lend;
                        } else {
                            borrowingAmt = 0;
                        }
                    }
                    return (
                        <div key={txDCF.timestamp}>
                            <div>
                                <span className="lead"><b>{txDCF.amount} DCF</b>{
                                    txDCF.type === 2 && borrowingAmt !== null ?
                                        ' (borrowing ' + borrowingAmt + ' DCF)' : ''
                                }</span>
                            </div>
                            <div>
                                <small>from&nbsp;
                                    <Link to={`/address/${txDCF.wallet}`}>
                                        {txDCF.wallet}
                                    </Link>
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
                                     aria-label="Transaction approval">
                                    <button type="button" className="btn btn-default btn-success"
                                            onClick={() => {
                                                this.confirmTrans(transaction, true)
                                            }}>
                                        <span className="glyphicon glyphicon-ok" aria-hidden="true"/> Approve
                                    </button>
                                    <button type="button" className="btn btn-default btn-danger"
                                            onClick={() => {
                                                this.confirmTrans(transaction, false)
                                            }}>
                                        <span className="glyphicon glyphicon-remove" aria-hidden="true"/> Reject
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
                <ul className="nav nav-tabs" role="tablist">
                    <li role="presentation" className="active"><a href="#approve"
                                                                  aria-controls="home" role="tab"
                                                                  data-toggle="tab">Approve</a></li>
                    <li role="presentation"><a href="#withdraw" aria-controls="profile" role="tab"
                                               data-toggle="tab">Withdraw</a></li>
                </ul>
                <div className="tab-content">
                    <div role="tabpanel" className="tab-pane fade in active" id="approve">
                        <h3>
                            {countApprTrans <= 0 ? 'Approve requests' :
                                (countApprTrans === 1 ? 'Approve 1 request' :
                                    'Approve ' + countApprTrans + ' requests')
                            }
                        </h3>
                        <div className='container-fluid'>
                            <div className="loader-container">
                                <DotLoader
                                    color={'#86bc25'}
                                    loading={this.state.loadingApprTrans}
                                />
                            </div>

                            {this.state.loadingApprTrans ? '' :
                                <div>
                                    <div className="btn-group trans-filter-group">
                                        <button type="button"
                                                className="btn btn-default dropdown-toggle"
                                                data-toggle="dropdown" aria-haspopup="true"
                                                aria-expanded="false">
                                            Filter by Type: {filterType} <span
                                            className="caret"/>
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li><a href="#" onClick={() => {
                                                this.filterApprTransPool(-1);
                                            }}>All</a></li>
                                            <li><a href="#" onClick={() => {
                                                this.filterApprTransPool(0);
                                            }}>Deposit</a></li>
                                            <li><a href="#" onClick={() => {
                                                this.filterApprTransPool(2);
                                            }}>Borrow</a></li>
                                            <li><a href="#" onClick={() => {
                                                this.filterApprTransPool(3);
                                            }}>Pay</a></li>
                                        </ul>
                                    </div>
                                    <ul className="list-group">
                                        {apprTransRender}
                                    </ul>
                                </div>}
                        </div>
                    </div>
                    <div role="tabpanel" className="tab-pane fade" id="withdraw">
                        <WithdrawListComp/>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('requestsApprove');
    return {
        apprTransPool: Requests.find().fetch(),
        currentUser: Meteor.user()
    };
})(ApproveRequestComp);