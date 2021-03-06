import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import {DotLoader} from 'react-spinners';

class BlockInfoPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            block: [],
        }
    }

    componentDidMount() {
        this.fetchData(this.props.match.params.blockHash);
    }

    componentWillReceiveProps(nextProps) {
        this.fetchData(nextProps.match.params.blockHash);
    }

    fetchData(blockHash) {
        Meteor.call('block.get', blockHash, (err, res) => {
            if (err) {
                this.setState({block: null});
            } else {
                this.setState({block: res});
            }
            this.setState({loading: false});
        });
    }

    formatDate(timestamp) {
        const monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        const date = new Date(timestamp);

        const hour = date.getHours();
        const minute = date.getMinutes();
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year + ' ' + hour + ':' + minute;
    }

    render() {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

        let block = this.state.block;
        let transactions = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    Block is not valid or no transaction found
                </li>
            )
        });

        if (block && block.data) {
            transactions = block.data.map((transaction) => {
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
                                txDCF.type === 2 ? 'borrow' : 'pay')}s at {this.formatDate(txDCF.timestamp)}
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
                            <div className="col-xs-1">
                                <small>Hash</small>
                            </div>
                            <div className="col-xs-2">
                                <small>
                                    <Link to={`/transaction/${transaction.id}`}>
                                        {transaction.id}
                                    </Link>
                                </small>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-9">
                                {txDCFs}
                            </div>
                            <div className="col-xs-3 text-right">
                                <div className="btn-group-vertical btn-group-sm" role="group"
                                     aria-label="Transaction pending">
                                    {transaction.isApproved ?
                                        <span className="label label-success">
                                            <span className="glyphicon glyphicon-ok" aria-hidden="true">
                                            </span> Approved
                                        </span> :
                                        <span className="label label-danger">
                                            <span className="glyphicon glyphicon-remove" aria-hidden="true">
                                            </span> Rejected
                                        </span>}
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
                        <h1>Block</h1>
                    </header>

                    <div className="loader-container">
                        <DotLoader
                            color={'#86bc25'}
                            loading={this.state.loading}
                        />
                    </div>

                    {this.state.loading ? '' :
                        <div>
                            {!block ?
                                <ul className="list-group">
                                    <li key='1' className="list-group-item">
                                        Block is not valid or no transaction found
                                    </li>
                                </ul>
                                :
                                <div>
                                    <div className='container-fluid'>
                                        <h5>{this.props.match.params.blockHash}</h5>
                                        <ul className="list-group">
                                            <li key='1' className="list-group-item">
                                                <div className="row">
                                                    <div className="hidden-xs col-sm-2">Index</div>
                                                    <div className="col-xs-12 col-sm-10">{block.index}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="hidden-xs col-sm-2">Pre.Hash</div>
                                                    <div className="col-xs-12 col-sm-10">
                                                        <Link to={`/block/${block.previousHash}`}>
                                                            {block.previousHash}
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="hidden-xs col-sm-2">Time</div>
                                                    <div
                                                        className="col-xs-12 col-sm-10">{this.formatDate(block.timestamp)}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="hidden-xs col-sm-2">Diff</div>
                                                    <div className="col-xs-12 col-sm-10">{block.difficulty}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="hidden-xs col-sm-2">Nonce</div>
                                                    <div className="col-xs-12 col-sm-10">{block.nonce}</div>
                                                </div>
                                                <h3>Transaction</h3>
                                                <div className='container-fluid'>
                                                    <ul className="list-group">
                                                        {transactions}
                                                    </ul>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>}
                        </div>}
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    return {
        currentUser: Meteor.user(),
    };
})(BlockInfoPage);