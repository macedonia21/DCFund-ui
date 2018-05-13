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
                                        <div className="text-success"><span className="glyphicon glyphicon-ok"
                                                                            aria-hidden="true">
                                        </span> Approved</div> :
                                        <div className="text-danger"><span className="glyphicon glyphicon-remove"
                                                                           aria-hidden="true">
                                        </span> Rejected</div>}
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
                                                    <div className="hidden-xs col-sm-1">Index</div>
                                                    <div className="col-xs-12 col-sm-11">{block.index}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="hidden-xs col-sm-1">Pre.Hash</div>
                                                    <div className="col-xs-12 col-sm-11">
                                                        <Link to={`/block/${block.previousHash}`}>
                                                            {block.previousHash}
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="hidden-xs col-sm-1">Time</div>
                                                    <div className="col-xs-12 col-sm-11">{block.timestamp}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="hidden-xs col-sm-1">Diff</div>
                                                    <div className="col-xs-12 col-sm-11">{block.difficulty}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="hidden-xs col-sm-1">Nonce</div>
                                                    <div className="col-xs-12 col-sm-11">{block.nonce}</div>
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