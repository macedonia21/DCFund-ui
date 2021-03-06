import React, {Component} from 'react';
import {ec} from 'elliptic';
import {NotificationManager} from 'react-notifications';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import {DotLoader} from 'react-spinners';
import SweetAlert from 'react-bootstrap-sweetalert';
import QRCode from 'qrcode-react';

class WalletPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading flags
            loadingBalance: true,
            loadingPendTrans: true,
            loadingApprTrans: true,

            // Data
            balance: {},
            allBalances: [],
            pendTransPool: [],
            apprTransPool: [],
            apprFiltedTransPool: [],
            didMount: false,

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

    componentDidMount() {
        this.setState({didMount: true});
    }

    componentDidUpdate() {
        if (this.state.loadingBalance) {
            this.fetchBalance();
        }
        if (this.state.loadingPendTrans) {
            this.fetchTransPoolData();
        }
        if (this.state.loadingApprTrans) {
            this.fetchApprTransPool();
        }
    }

    fetchApprTransPool() {
        Meteor.call('transactionPool.get', true, (err, res) => {
            if (err) {
                this.setState({apprTransPool: null});
            } else {
                this.setState({apprTransPool: res});
                this.filterApprTransPool(this.state.apprTransTypeFilter);
            }
            this.setState({loadingApprTrans: false});
        });
    }

    filterApprTransPool(filterType) {
        if (this.state.apprTransPool) {
            if (filterType > -1) {
                const filteredPool = this.state.apprTransPool.slice(0).filter((trans) => {
                    return trans.txDCFs[0].type === filterType;
                });
                this.setState({
                    apprFiltedTransPool: filteredPool
                });
            } else {
                this.setState({apprFiltedTransPool: this.state.apprTransPool.slice(0)});
            }
        }
        this.setState({apprTransTypeFilter: filterType});
    }

    fetchTransPoolData() {
        Meteor.call('transactionPool.get', false, (err, res) => {
            if (err) {
                this.setState({pendTransPool: null});
            } else {
                this.setState({pendTransPool: res});
            }
            this.setState({loadingPendTrans: false});
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

    toHexString(byteArray) {
        return Array.from(byteArray, (byte) => {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }

    signTransaction(transaction) {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

        if (loggedIn) {
            const dataToSign = transaction.id;
            const priKey = currentUser.profile.priKey;
            const EC = new ec('secp256k1');
            const key = EC.keyFromPrivate(priKey, 'hex');
            const signature = this.toHexString(key.sign(dataToSign).toDER());

            return signature;
        }

        return null;
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
        // this.setState({
        //     alert: (
        //         <SweetAlert
        //             title="Request"
        //
        //             input
        //             inputType="number"
        //             placeholder="Amount"
        //             defaultValue="10"
        //             validationMsg="You must enter your password!"
        //
        //             confirmBtnText="Submit"
        //             confirmBtnBsStyle="success"
        //             onConfirm={this.hideAlert.bind(this)}
        //
        //             showCancel
        //             onCancel={this.hideAlert.bind(this)}>
        //             You are borrowing 10 DCF.<br/>Don't pay more than 10 DCF.
        //         </SweetAlert>
        //     )
        // });
        Meteor.call('newRequest.post', requestData, (err) => {
            if (err) {
                NotificationManager.error(err.reason, 'Error', 3000);
                setTimeout(() => {
                    this.setState({requestSending: false});
                }, 1000);
            } else {
                NotificationManager.success('New request submitted', 'Success', 3000);
                this.setState({loadingPendTrans: true});
                setTimeout(() => {
                    this.setState({requestSending: false});
                }, 1000);
            }
        });
    }

    removeTrans(transaction) {
        const txId = transaction.id;
        const signature = this.signTransaction(transaction);

        const requestData = {
            data: {
                'txId': txId,
                'signature': signature
            }
        };

        Meteor.call('removeRequest.post', requestData, (err, res) => {
            if (err) {
                NotificationManager.error(err.message, 'Error', 3000);
            } else {
                NotificationManager.success('Your request removed', 'Success', 3000);
                this.setState({loadingPendTrans: true});
            }
        });
    }

    confirmTrans(transaction, isApproved) {
        transaction.signature = this.signTransaction(transaction);

        const requestData = {
            data: {
                'txId': transaction.id,
                'signature': transaction.signature,
                'isApproved': isApproved
            }
        };

        Meteor.call('confirmRequest.post', requestData, (err, res) => {
            if (err) {
                NotificationManager.error('Request removed or block cannot created', 'Error', 3000);
                this.setState({loadingApprTrans: true});
            } else {
                if (isApproved) {
                    NotificationManager.success('Request is approved', 'Success', 3000);
                } else {
                    NotificationManager.success('Request is rejected', 'Success', 3000);
                }
                this.setState({
                    loadingApprTrans: true,
                    loadingBalance: true
                });
            }
        });
    }

    onChangeRequestType() {
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
                if (this.state.balance) {
                    borrowingAmt = this.state.balance.lend;
                    borrowQuota = 20 - borrowingAmt;
                }
                if (this.state.allBalances && this.state.allBalances[0]) {
                    availableFund = this.state.allBalances[0].deposit - this.state.allBalances[0].lend;
                    if (availableFund > borrowQuota) {
                        console.log('1.' + availableFund + '-' + borrowQuota);
                        borrowNoticeContext = "You can borrow up to " + borrowQuota + " DCF.";
                    } else if (borrowQuota > availableFund  && availableFund > 0) {
                        console.log('2.' + availableFund + '-' + borrowQuota);
                        borrowNoticeContext = "You can borrow up to " + availableFund + " DCF.";
                    }
                }

                this.setState({
                    requestNotice:
                        <div className="alert alert-info" role="alert">
                            <strong>{availableFund} DCF</strong> is available for lending. {borrowNoticeContext}
                        </div>
                });
                break;
            case 3:
                let borrowingAmount = 0;
                let payNoticeContext = "You don't need to pay.";
                if (this.state.balance) {
                    borrowingAmount = this.state.balance.lend;
                    if (borrowingAmount > 0) {
                        payNoticeContext = "Don't pay more than " + borrowingAmount + " DCF.";
                    }
                }
                this.setState({
                    requestNotice:
                        <div className="alert alert-info" role="alert">
                            You are borrowing <strong>{borrowingAmount} DCF</strong>. {payNoticeContext}
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
        while (unit = units[i++]) {
            if (diff < unit.limit || !unit.limit) {
                diff = parseInt(Math.floor(diff / unit.in_seconds));
                return diff + " " + unit.name + (diff > 1 ? "s" : "") + " ago";
            }
        }

        return "";
    }

    hideAlert() {
        this.setState({
            alert: null
        });
    }

    render() {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);
        let isAdmin = Roles.userIsInRole(currentUser, 'administrator');
        let isApprover = Roles.userIsInRole(currentUser, 'approver');
        let isUser = Roles.userIsInRole(currentUser, 'user');

        let balance = this.state.balance;
        let allBalance = this.state.allBalances;
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        let pendTransPool = this.state.pendTransPool;
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
                                     aria-label="Transaction pending">
                                    <button type="button" className="btn btn-default btn-danger"
                                            onClick={() => {
                                                this.removeTrans(transaction)
                                            }}>
                                        <span className="glyphicon glyphicon-trash" aria-hidden="true"></span> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                );
            });
        }

        let apprTransPool = this.state.apprFiltedTransPool;
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
                                        <span className="glyphicon glyphicon-ok" aria-hidden="true"></span> Approve
                                    </button>
                                    <button type="button" className="btn btn-default btn-danger"
                                            onClick={() => {
                                                this.confirmTrans(transaction, false)
                                            }}>
                                        <span className="glyphicon glyphicon-remove" aria-hidden="true"></span> Reject
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
                {this.state.alert}

                <div className="container">
                    <header>
                        <h1>Wallet</h1>
                    </header>

                    <div className="row">
                        <div className="col-sm-12 col-md-4">
                            {this.state.loadingBalance ?
                                <div className="loader-container">
                                    <h3><DotLoader
                                        size={26}
                                        color={'#86bc25'}
                                        loading={this.state.loadingBalance}
                                    /></h3></div>
                                :
                                <div>
                                    {balance ?
                                        <div>
                                            <h3>Deposit: {balance.deposit} DCF</h3>
                                            <h4>{!isApprover ? 'Borrow' : 'Lend'}: {balance.lend} DCF</h4>
                                            {isApprover ?
                                                <h4>
                                                    Balance: {balance.deposit - balance.lend}
                                                </h4> : ''}
                                        </div> :
                                        <div>
                                            <h3>Cannot retrieve balance</h3>
                                        </div>}
                                </div>
                            }
                            <h6><i>* 1 DCF = 1.000.000 VND</i></h6>

                            {loggedIn ?
                                <div className='container-fluid'>
                                    <div className='text-center'>
                                        <h6>{currentUser.profile.address}</h6>
                                        <QRCode value={currentUser.profile.address} size={256}/>
                                    </div>
                                </div> : ''}
                        </div>
                        <div className="col-sm-12 col-md-8">
                            {isAdmin || isUser ?
                                <div>
                                    <h3>Create new request</h3>
                                    <div className='container-fluid'>
                                        <form>
                                            {this.state.requestNotice}
                                            <div className="row">
                                                <div className="col-xs-6 col-sm-6 col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="typeInput">Request type</label>
                                                        <select className="form-control input-lg" id="typeInput"
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
                                                        <input type="number" className="form-control input-lg"
                                                               id="amountInput"
                                                               placeholder="Amount" min="0.1" max="20" step="0.1"
                                                               defaultValue="1"/>
                                                    </div>
                                                </div>
                                                <div className="col-xs-6 col-sm-6 col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="monthInput">Month</label>
                                                        <select className="form-control input-lg" id="monthInput"
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
                                                        <select className="form-control input-lg" id="yearInput"
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
                                                <ul className="list-group">
                                                    {pendTransRender}
                                                </ul>
                                            </div>}
                                    </div>
                                </div> : ''}

                            {isAdmin || isApprover ?
                                <div>
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
                                                    <button type="button" className="btn btn-default dropdown-toggle"
                                                            data-toggle="dropdown" aria-haspopup="true"
                                                            aria-expanded="false">
                                                        Filter by Type: {filterType} <span className="caret"></span>
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
                                </div> : ''}
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