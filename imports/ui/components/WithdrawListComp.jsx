import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {NotificationManager} from 'react-notifications';
import {withTracker} from 'meteor/react-meteor-data';
import {DotLoader} from 'react-spinners';
import SweetAlert from 'react-bootstrap-sweetalert';
import * as _ from 'lodash';

class WithdrawListComp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading flags
            didMount: false,
            loadingDepositData: true,

            // Data
            depositData: [],

            // Request send flags
            requestSending: false,

            // Request Type Notice
            requestNotice: null,

            // SweetAlert
            alert: null
        };

        this.onConfirmWithdrawOne = this.onConfirmWithdrawOne.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState;
    }

    componentDidMount() {
        this.setState({didMount: true});
        this.fetchDepositData();
    }

    componentDidUpdate() {
        if (this.state.loadingDepositData) {
            this.fetchDepositData();
        }
    }

    fetchDepositData() {
        Meteor.call('withdraw.get', true, (err, res) => {
            if (err) {
                this.setState({depositData: null});
            } else {
                this.setState({depositData: res});
                const totalWithdraw = _.reduce(_.map(this.state.depositData, (wallet) => {
                    return wallet.withdrawAmount;
                }), (sum, n) => {
                    return sum + n;
                }, 0);
                if (totalWithdraw > (this.props.balance.deposit - this.props.balance.lend)) {
                    this.setState({
                        requestNotice:
                            <div className="alert alert-info" role="alert">
                                Only <strong>{this.props.balance.deposit - this.props.balance.lend} DCF</strong> is available for withdrawing.
                            </div>
                    });
                } else {
                    this.setState({requestNotice: null});
                }
            }
            this.setState({loadingDepositData: false});
        });
    }

    onChangeDefaultRemain() {
        const newDefaultRemain = parseFloat(ReactDOM.findDOMNode(this.refs.withdrawRemainHeaderInput).value.trim());
        if (newDefaultRemain >= 0) {
            const newDepositData = _.map(this.state.depositData, (wallet) => {
                return {
                    ...wallet,
                    defaultRemain: (wallet.deposit >= newDefaultRemain ? newDefaultRemain : wallet.deposit),
                    withdrawAmount: (wallet.deposit >= newDefaultRemain ? wallet.deposit - newDefaultRemain : 0)
                };
            });

            this.setState({depositData: newDepositData});

            const totalWithdraw = _.reduce(_.map(newDepositData, (wallet) => {
                return wallet.withdrawAmount;
            }), (sum, n) => {
                return sum + n;
            }, 0);
            if (totalWithdraw > (this.props.balance.deposit - this.props.balance.lend)) {
                this.setState({
                    requestNotice:
                        <div className="alert alert-info" role="alert">
                            Only <strong>{this.props.balance.deposit - this.props.balance.lend} DCF</strong> is available for withdrawing.
                        </div>
                });
            } else {
                this.setState({requestNotice: null});
            }
        }
    }

    onChangeWalletDefaultRemain(idx, evt) {
        if (evt.target.value && evt.target.value >= 0) {
            const newWalletDefaultRemain = evt.target.value;
            const newDepositData = this.state.depositData.map((wallet, sidx) => {
                if (idx !== sidx) {
                    return wallet;
                }
                return {
                    ...wallet,
                    defaultRemain: (wallet.deposit >= newWalletDefaultRemain ? newWalletDefaultRemain : wallet.deposit),
                    withdrawAmount: (wallet.deposit >= newWalletDefaultRemain ? wallet.deposit - newWalletDefaultRemain : 0)
                };
            });

            this.setState({depositData: newDepositData});

            const totalWithdraw = _.reduce(_.map(newDepositData, (wallet) => {
                return wallet.withdrawAmount;
            }), (sum, n) => {
                return sum + n;
            }, 0);
            if (totalWithdraw > (this.props.balance.deposit - this.props.balance.lend)) {
                this.setState({
                    requestNotice:
                        <div className="alert alert-info" role="alert">
                            Only <strong>{this.props.balance.deposit - this.props.balance.lend} DCF</strong> is available for withdrawing.
                        </div>
                });
            } else {
                this.setState({requestNotice: null});
            }
        }
    }

    onWithdrawOne(idx) {
        const withdrawRecord = this.state.depositData[idx];
        this.setState({
            alert: (
                <SweetAlert
                    warning
                    title={"Withdraw for " + withdrawRecord.walletOwner}

                    confirmBtnText="OK"
                    confirmBtnBsStyle="success"
                    onConfirm={() => {
                        this.onConfirmWithdrawOne(withdrawRecord);
                        this.hideAlert();
                    }}

                    showCancel
                    onCancel={this.hideAlert.bind(this)}>
                    This cannot be undone,<br/>you sure you want to withdraw?
                </SweetAlert>
            )
        });
    }

    onWithdrawAll() {
        this.setState({
            alert: (
                <SweetAlert
                    warning
                    title="Withdraw for all user"

                    confirmBtnText="OK"
                    confirmBtnBsStyle="success"
                    onConfirm={() => {
                        this.onConfirmWithdrawAll();
                        this.hideAlert();
                    }}

                    showCancel
                    onCancel={this.hideAlert.bind(this)}>
                    This cannot be undone,<br/>you sure you want to withdraw?
                </SweetAlert>
            )
        });
    }

    onConfirmWithdrawOne(withdrawRecord) {
        this.setState({requestSending: true});

        const wallet = withdrawRecord.wallet;
        const walletKey = '';
        const walletOwner = withdrawRecord.walletOwner;
        const amount = withdrawRecord.withdrawAmount;
        const month = parseInt(new Date().getMonth() + 1);
        const year = parseInt(new Date().getFullYear());
        const type = 1;

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

        Meteor.call('withdrawOne.post', requestData, (err) => {
            if (err) {
                NotificationManager.error((err.reason ? err.reason : 'Unknown error'), 'Error', 3000);
                setTimeout(() => {
                    this.setState({requestSending: false});
                }, 1000);
            } else {
                NotificationManager.success('Withdraw done for ' + walletOwner, 'Success', 3000);
                this.setState({loadingDepositData: true});
                setTimeout(() => {
                    this.setState({requestSending: false});
                    this.props.refresh();
                }, 1000);
            }
        });
    }

    onConfirmWithdrawAll() {
        const depositData = this.state.depositData;

        this.setState({requestSending: true});

        _.forEach(_.filter(depositData, (withdrawRecord) => {
            return withdrawRecord.withdrawAmount > 0;
        }), (withdrawRecord) => {
            const wallet = withdrawRecord.wallet;
            const walletKey = '';
            const walletOwner = withdrawRecord.walletOwner;
            const amount = withdrawRecord.withdrawAmount;
            const month = parseInt(new Date().getMonth() + 1);
            const year = parseInt(new Date().getFullYear());
            const type = 1;

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

            Meteor.call('withdrawOne.post', requestData, (err) => {
                if (err) {
                    console.log(err);
                    NotificationManager.error((err.reason ? err.reason : 'Unknown error'), 'Error', 3000);
                    setTimeout(() => {
                        this.setState({requestSending: false});
                    }, 1000);
                } else {
                    NotificationManager.success('Withdraw done for ' + walletOwner, 'Success', 3000);
                    this.setState({loadingDepositData: true});
                    setTimeout(() => {
                        this.setState({requestSending: false});
                        this.props.refresh();
                    }, 1000);
                }
            });
        });
    }

    hideAlert() {
        this.setState({
            alert: null
        });
    }

    render() {
        const depositData = this.state.depositData;
        const fundBalance = this.props.balance.deposit - this.props.balance.lend;
        let withdrawHeaderRender = '';
        let withdrawRender = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    No deposit wallet found
                </li>
            )
        });

        if (depositData) {
            const totalWithdraw = _.reduce(_.map(depositData, (wallet) => {
                return wallet.withdrawAmount;
            }), (sum, n) => {
                return sum + n;
            }, 0);
            withdrawHeaderRender = [1].map(() => {
                return (
                    <div key="1">
                        <div className="form-group">
                            <label className="col-xs-3 control-label text-left">Full Name</label>
                            <label className="col-xs-3 control-label">Keep</label>
                            <label className="col-xs-3 control-label">Withdraw</label>
                            <div className="col-xs-3"/>
                        </div>
                        <div className="form-group">
                            <div className="col-xs-3"/>
                            <div className="col-xs-3">
                                <input className="form-control input-right"
                                       type="number"
                                       ref="withdrawRemainHeaderInput"
                                       placeholder="Remain" min="0" step="1"
                                       defaultValue="5"
                                       disabled={this.state.requestSending}
                                       onChange={() => {
                                           this.onChangeDefaultRemain();
                                       }}/>
                            </div>
                            <div className="col-xs-3">
                                <input className="form-control input-right"
                                       type="number"
                                       placeholder="Withdraw amount" min="0" step="0.1"
                                       value={totalWithdraw} readOnly/>
                            </div>
                            <div className="col-xs-3">
                                <button type="button" className="btn btn-info"
                                        disabled={
                                            totalWithdraw === 0 ||
                                            totalWithdraw > fundBalance ||
                                            this.state.requestSending
                                        }
                                        onClick={() => {
                                            this.onWithdrawAll();
                                        }}>
                                    <span className="glyphicon glyphicon-ok" aria-hidden="true"/>&nbsp;
                                    Withdraw all
                                </button>
                            </div>
                        </div>
                        <hr/>
                    </div>
                );
            });
            withdrawRender = depositData.map((wallet, idx) => {
                return (
                    <div key={wallet.wallet} className="form-group">
                        <label className="col-xs-3 control-label">{wallet.walletOwner}</label>
                        <div className="col-xs-3">
                            <input className="form-control input-right"
                                   type="number"
                                   id={'withdrawRemainInput' + wallet.wallet}
                                   placeholder="Remain" min="0" step="1"
                                   value={wallet.defaultRemain} disabled={this.state.requestSending}
                                   onChange={(evt) => {
                                       this.onChangeWalletDefaultRemain(idx, evt);
                                   }}/>
                        </div>
                        <div className="col-xs-3">
                            <input className="form-control input-right"
                                   type="number"
                                   id={'withdrawAmountInput' + wallet.wallet}
                                   placeholder="Withdraw amount" min="0" step="0.1"
                                   value={wallet.withdrawAmount} readOnly/>
                        </div>
                        <div className="col-xs-3">
                            <button type="button" className="btn btn-info"
                                    disabled={
                                        wallet.withdrawAmount === 0 ||
                                        wallet.withdrawAmount > fundBalance ||
                                        this.state.requestSending
                                    }
                                    onClick={() => {
                                        this.onWithdrawOne(idx);
                                    }}>
                                <span className="glyphicon glyphicon-ok" aria-hidden="true"/>&nbsp;
                                Withdraw
                            </button>
                        </div>
                    </div>
                );
            });
        }

        return (
            <div>
                {this.state.alert}
                <h3>
                    Withdraw
                </h3>
                <div className='container-fluid'>
                    <div className="loader-container">
                        <DotLoader
                            color={'#86bc25'}
                            loading={this.state.loadingDepositData}
                        />
                    </div>

                    {this.state.loadingDepositData ? '' :
                        <div>
                            <form className="form-horizontal" role="form">
                                {this.state.requestNotice}
                                {withdrawHeaderRender}
                                {withdrawRender}
                            </form>
                        </div>}
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    return {
        currentUser: Meteor.user()
    };
})(WithdrawListComp);