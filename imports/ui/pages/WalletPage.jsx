import React, {Component} from 'react';
import {ec} from 'elliptic';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import {DotLoader} from 'react-spinners';
import QRCode from 'qrcode-react';

class WalletPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loadingBalance: true,
            loadingPendTrans: true,
            loadingApprTrans: true,
            balance: {},
            pendTransPool: [],
            apprTransPool: [],
            didMount: false
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
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

        if (loggedIn) {
            fetch(Meteor.settings.public.apiURL + '/transactionPool')
                .then((result) => {
                    return result.json();
                }).then((data) => {
                if (data.length > 0) {
                    data.sort((transA, transB) => {
                        return transB.txDCFs[0].timestamp - transA.txDCFs[0].timestamp;
                    });
                }
                this.setState({apprTransPool: data});
                this.setState({loadingApprTrans: false});
            });
        }
    }

    fetchTransPoolData() {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

        if (loggedIn) {
            fetch(Meteor.settings.public.apiURL + '/transactionPool/' + currentUser.profile.address)
                .then((result) => {
                    return result.json();
                }).then((data) => {
                if (data.length > 0) {
                    data.sort((transA, transB) => {
                        return transB.txDCFs[0].timestamp - transA.txDCFs[0].timestamp;
                    });
                }
                this.setState({pendTransPool: data});
                this.setState({loadingPendTrans: false});
            });
        }
    }

    fetchBalance() {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

        if (loggedIn) {
            fetch(Meteor.settings.public.apiURL + '/balance/' + currentUser.profile.address)
                .then((result) => {
                    return result.json();
                }).then((data) => {
                this.setState({balance: data});
                this.setState({loadingBalance: false});
            });
        }
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

    sendCoin(event) {
        const wallet = Meteor.user().profile.address;
        const walletKey = Meteor.user().profile.pubKey;
        const walletOwner = Meteor.user().profile.fullName;
        const amount = parseFloat(document.getElementById('amountInput').value);
        const month = parseInt(document.getElementById('monthInput').value);
        const year = parseInt(document.getElementById('yearInput').value);
        const type = parseInt(document.getElementById('typeInput').value);

        fetch(Meteor.settings.public.apiURL + '/sendTransaction', {
            method: 'POST',
            headers: {
                // 'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'wallet': wallet,
                'walletKey': walletKey,
                'walletOwner': walletOwner,
                'amount': amount,
                'type': type,
                'month': month,
                'year': year
            })
        }).then(() => {
            this.setState({loadingPendTrans: true});
        });

        event.preventDefault();
    }

    removeTrans(transaction) {
        const txId = transaction.id;
        const signature = this.signTransaction(transaction);

        fetch(Meteor.settings.public.apiURL + '/removeTransaction', {
            method: 'POST',
            headers: {
                // 'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'txId': txId,
                'signature': signature,
            })
        }).then(() => {
            this.setState({loadingPendTrans: true});
        });
    }

    confirmTrans(transaction, isApproved) {
        console.log("Confirm Transaction");
        transaction.signature = this.signTransaction(transaction);
        fetch(Meteor.settings.public.apiURL + '/confirmBlock', {
            method: 'POST',
            headers: {
                // 'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'txId': transaction.id,
                'signature': transaction.signature,
                'isApproved': isApproved
            })
        }).then(() => {
            this.setState({loadingApprTrans: true});
            this.setState({loadingBalance: true});
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
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);
        let isAdmin = Roles.userIsInRole(currentUser, 'administrator');
        let isApprover = Roles.userIsInRole(currentUser, 'approver');
        let isUser = Roles.userIsInRole(currentUser, 'user');

        let balance = this.state.balance;
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
                                <span className="lead"><b>{txDCF.amount} DCF</b>&nbsp;</span>
                                <small>from&nbsp;
                                    <Link to={`/address/${txDCF.wallet}`}>
                                        {txDCF.wallet}
                                    </Link>
                                </small>
                            </div>
                            <div>
                                <span>{txDCF.walletOwner}</span> {txDCF.type === 0 ?
                                'deposit' :
                                txDCF.type === 2 ? 'borrow' : 'pay'}s {this.timeAgo(txDCF.timestamp)}
                            </div>
                            <div>
                                <small>for period {txDCF.month}.{txDCF.year}</small>
                            </div>
                        </div>
                    );
                });

                return (
                    <li key={transaction.id} className="list-group-item">
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

        let apprTransPool = this.state.apprTransPool;
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
                    return (
                        <div key={txDCF.timestamp}>
                            <div>
                                <span className="lead"><b>{txDCF.amount} DCF</b>&nbsp;</span>
                                <small>from&nbsp;
                                    <Link to={`/address/${txDCF.wallet}`}>
                                        {txDCF.wallet}
                                    </Link>
                                </small>
                            </div>
                            <div>
                                <span>{txDCF.walletOwner}</span> {txDCF.type === 0 ?
                                'deposit' :
                                txDCF.type === 2 ? 'borrow' : 'pay'}s {this.timeAgo(txDCF.timestamp)}
                            </div>
                            <div>
                                <small>for period {txDCF.month}.{txDCF.year}</small>
                            </div>
                        </div>
                    );
                });

                return (
                    <li key={transaction.id} className="list-group-item">
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
                <div className="container">
                    <header>
                        <h1>Wallet</h1>
                    </header>

                    <div className="row">
                        <div className="col-sm-12 col-md-4">
                            {this.state.loadingBalance ?
                                <h3><DotLoader
                                    size={26}
                                    color={'#86bc25'}
                                    loading={this.state.loadingBalance}
                                /></h3>
                                :
                                <div>
                                    <h3>Deposit: {balance.deposit} DCF</h3>
                                    <h4>{!isApprover ? 'Borrow' : 'Lend'}: {balance.lend} DCF</h4>
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
                                        <form onSubmit={this.sendCoin.bind(this)}>
                                            <div className="row">
                                                <div className="col-xs-12 col-sm-6 col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="typeInput">Request type</label>
                                                        <select className="form-control input-lg" id="typeInput"
                                                                defaultValue='Deposit'>
                                                            <option value="0">Deposit</option>
                                                            <option value="2">Borrow</option>
                                                            <option value="3">Pay</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-xs-12 col-sm-6 col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="amountInput">Amount (DCF)</label>
                                                        <input type="number" className="form-control input-lg"
                                                               id="amountInput"
                                                               placeholder="Amount" min="0.1" max="20" step="0.1"
                                                               defaultValue="1"/>
                                                    </div>
                                                </div>
                                                <div className="col-xs-12 col-sm-6 col-md-3">
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
                                                <div className="col-xs-12 col-sm-6 col-md-3">
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
                                            <button type="submit" className="btn btn-success btn-lg">
                                                <span className="glyphicon glyphicon-ok"
                                                      aria-hidden="true"></span> Submit
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
                                    <h3>Approve requests</h3>
                                    <div className='container-fluid'>
                                        <div className="loader-container">
                                            <DotLoader
                                                color={'#86bc25'}
                                                loading={this.state.loadingApprTrans}
                                            />
                                        </div>

                                        {this.state.loadingApprTrans ? '' :
                                            <div>
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