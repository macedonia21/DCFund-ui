import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';

export default class BorrowRemindComp extends Component {
    constructor(props) {
        super(props);
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        let day = date.getDate();
        if (day < 10) {
            day = '0' + day;
        }
        let month = date.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        const year = date.getFullYear();
        return day + '.' + month + '.' + year;
    }

    render() {
        const wallet = this.props.wallet;
        const borrowData = this.props.borrowData;
        return (
            <div className="form-group">
                <div className="col-sm-3 col-xs-5"><b>{wallet}</b></div>
                <div className="col-sm-1 col-xs-1">{borrowData.borrowAmount}</div>
                <div className="col-sm-2 hidden-xs">{this.formatDate(borrowData.borrowTimestamp)}</div>
                <div className="col-sm-3 col-xs-4">{this.formatDate(borrowData.dueTimestamp)}</div>
                <div className="col-sm-3 col-xs-2">
                    <button type="button" className="btn btn-info"
                            disabled={
                                wallet.borrowAmount === 0 ||
                                new Date() - new Date(borrowData.dueTimestamp) < 259200000 // Less then 3 days to due date
                            }
                            onClick={() => {
                                this.props.onRemind(wallet, borrowData);
                            }}>
                        <span className="glyphicon glyphicon-bell" aria-hidden="true"/>&nbsp;
                        Remind
                    </button>
                </div>
            </div>
        );
    }
}