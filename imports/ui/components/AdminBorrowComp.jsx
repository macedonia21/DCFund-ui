import React, {Component} from 'react';
import {DotLoader} from 'react-spinners';
import {NotificationManager} from 'react-notifications';
import * as _ from 'lodash';

import BorrowRemindComp from '../components/BorrowRemindComp';

export default class AdminBorrowComp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading flags
            loadingBorrow: true,
            requestSending: false,

            // Data
            borrowReport: null
        };

        this.onRemind = this.onRemind.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    componentDidMount() {
        this.fetchBorrows();
    }

    fetchBorrows() {
        Meteor.call('borrowRemind.get', true, (err, res) => {
            if (err) {
                this.setState({borrowReport: null});
            } else {
                console.log(res);
                this.setState({borrowReport: res});
            }
            this.setState({
                loadingBorrow: false
            });
        });
    }

    onRemind(wallet, borrowData) {
        this.setState({requestSending: true});
        const requestData = {
            data: {
                'wallet': borrowData.wallet,
                'walletOwner': wallet,
                'borrowAmount': borrowData.borrowAmount,
                'borrowTimestamp': borrowData.borrowTimestamp,
                'dueTimestamp': borrowData.dueTimestamp
            }
        };

        console.log(requestData);

        Meteor.call('payRemind.send', requestData, (err) => {
            if (err) {
                NotificationManager.error((err.reason ? err.reason : 'Unknown error'), 'Error', 3000);
            } else {
                NotificationManager.success('Reminder sent for ' + wallet, 'Success', 3000);
            }
            setTimeout(() => {
                this.setState({requestSending: false});
            }, 1000);
        });
    }

    render() {
        const borrowReport = this.state.borrowReport;

        const borrowReportHeader = [1].map(() => {
            return (
                <div key={1} className="form-group">
                    <label className="col-xs-4 col-sm-3 control-label text-left">Full Name</label>
                    <label className="col-xs-2 col-sm-2 control-label">Amount</label>
                    <label className="hidden-xs col-sm-3 control-label">Borrowed Date</label>
                    <label className="col-xs-4 col-sm-3 control-label">To-be Refund Date</label>
                    <label className="col-xs-2 col-sm-1 control-label">&nbsp;</label>
                </div>
            );
        });

        let borrowReportRender = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    No lending found
                </li>
            )
        });

        if (borrowReport) {
            borrowReportRender = _.map(_.keys(borrowReport), (wallet) => {
                const walletBorrowData = borrowReport[wallet];
                return (
                    <BorrowRemindComp key={wallet}
                                      borrowData={walletBorrowData}
                                      wallet={wallet}
                                      onRemind={this.onRemind}/>
                );
            });
        }

        return (
            <div>
                <h3>
                    Remind to pay
                </h3>
                <div className='container-fluid'>
                    <div className="loader-container">
                        <DotLoader
                            color={'#86bc25'}
                            loading={this.state.loadingBorrow}
                        />
                    </div>

                    {this.state.loadingBorrow ? '' :
                        <div>
                            <form className="form-horizontal" role="form">
                                {borrowReportHeader}
                                {borrowReportRender}
                            </form>
                        </div>}
                </div>
            </div>
        );
    }
}