import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {DotLoader} from 'react-spinners';
import * as _ from 'lodash';

import PieFundBalanceComp from '../components/PieFundBalanceComp';
import HorBarBorrowComp from '../components/HorBarBorrowComp';
import VerBarReqTypeComp from '../components/VerBarReqTypeComp';

class ReportPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            didMount: false,
            // Loading flags
            loadingReport: true,

            borrowReportData: null,
            borrowChartData: null,
            depositReportData: null,
            requestChartData: null,
            fundTotal: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    componentDidMount() {
        this.setState({didMount: true});
    }

    componentDidUpdate() {
        if (this.state.loadingReport) {
            this.fetchBorrowReport();
        }
    }

    fetchBorrowReport() {
        Meteor.call('report.get', true, (err, res) => {
            if (err) {
                this.setState({
                    borrowReportData: null,
                    borrowChartData: null,
                    depositReportData: null,
                    fundTotal: 0
                });
            } else {
                if (res.borrowReportData) {
                    this.setState({borrowReportData: res.borrowReportData});
                }
                if (res.borrowChartData) {
                    this.setState({borrowChartData: res.borrowChartData});
                }
                if (res.depositReportData) {
                    this.setState({depositReportData: res.depositReportData});
                }
                if (res.requestChartData) {
                    this.setState({requestChartData: res.requestChartData});
                }
                if (res.fundTotal) {
                    this.setState({fundTotal: res.fundTotal});
                }
            }
            this.setState({
                loadingReport: false
            });
        });
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
        const fundTotal = this.state.fundTotal;
        let fundBalancePieData = [0, 0];
        // Borrow Report Render
        const borrowReportData = this.state.borrowReportData;
        let borrowReportRender = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    No data found or error reading data
                </li>
            )
        });
        if (borrowReportData) {
            let sumBorrowAmount = 0;
            const borrowReportRowRender = _.map(_.keys(borrowReportData), (wallet) => {
                const walletBorrowData = borrowReportData[wallet];

                if (walletBorrowData.borrowAmount > 0) {
                    sumBorrowAmount = sumBorrowAmount + walletBorrowData.borrowAmount;
                }

                return (
                    <tr key={wallet}>
                        <th className="col-sm-3 col-xs-5">{wallet}</th>
                        <td className="col-sm-3 col-xs-3">{walletBorrowData.borrowAmount}</td>
                        <td className="col-sm-3 hidden-xs">{this.formatDate(walletBorrowData.borrowTimestamp)}</td>
                        <td className="danger col-sm-3 col-xs-4">{this.formatDate(walletBorrowData.dueTimestamp)}</td>
                    </tr>
                );
            });

            const borrowTotalRowRender = [1].map(() => {
                if (sumBorrowAmount === 0) {
                    sumBorrowAmount = undefined;
                }
                return (
                    <tr key="1">
                        <th className="col-sm-3 col-xs-5">Out - Total</th>
                        <td className="warning" colSpan={3}>{sumBorrowAmount}</td>
                    </tr>
                );
            });

            const borrowAvailRowRender = [1].map(() => {
                if (sumBorrowAmount === 0) {
                    sumBorrowAmount = undefined;
                }
                return (
                    <tr key="1">
                        <th className="col-sm-3 col-xs-5">Balance</th>
                        <td className="info" colSpan={3}>{fundTotal - sumBorrowAmount}</td>
                    </tr>
                );
            });

            const borrowFundTotalRowRender = [1].map(() => {
                if (sumBorrowAmount === 0) {
                    sumBorrowAmount = undefined;
                }
                return (
                    <tr key="1">
                        <th className="col-sm-3 col-xs-5">DC Fund - Total</th>
                        <td className="success" colSpan={3}>{fundTotal}</td>
                    </tr>
                );
            });

            fundBalancePieData = [sumBorrowAmount ? sumBorrowAmount : 0, fundTotal - sumBorrowAmount];

            borrowReportRender = [1].map(() => {
                return (
                    <table key="1" className="table table-bordered table-responsive table-hover table-condensed">
                        <thead>
                        <tr>
                            <th className="col-sm-3 col-xs-5">Full Name</th>
                            <th className="col-sm-3 col-xs-3">Amount</th>
                            <th className="col-sm-3 hidden-xs">Borrowed Date</th>
                            <th className="danger col-sm-3 col-xs-4">To-be Refund Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {borrowReportRowRender}
                        {borrowTotalRowRender}
                        {borrowAvailRowRender}
                        {borrowFundTotalRowRender}
                        </tbody>
                    </table>
                )
            });
        }

        // Deposit Report Render
        const currentDate = new Date();
        const currentDay = currentDate.getDate();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const depositTableHeader = [];
        let fromMonth = -3;
        let toMonth = 3;
        if (currentDay >= 27) {
            fromMonth = -2;
            toMonth = 4;
        }
        for (let i = fromMonth; i <= toMonth; i++) {
            let year = currentYear;
            let month = currentMonth + i;
            if (month < 1) {
                month = 12 + month;
                year--;
            }
            if (month > 12) {
                month = month - 12;
                year++;
            }
            const header = month + '.' + year;
            depositTableHeader.push(header);
        }
        const depositReportData = this.state.depositReportData;
        let depositReportRender = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    No data found or error reading data
                </li>
            )
        });
        if (depositReportData) {
            let fundDepositCol1 = 0;
            let fundDepositCol2 = 0;
            let fundDepositCol3 = 0;
            let fundDepositCol4 = 0;
            let fundDepositCol5 = 0;
            let fundDepositCol6 = 0;
            let fundDepositCol7 = 0;
            let fundDepositTotal = 0;

            const depositRowRender = _.map(_.keys(depositReportData), (wallet) => {
                const walletDepositData = depositReportData[wallet];

                const walletDepositCol1 = walletDepositData[depositTableHeader[0]];
                if (walletDepositCol1 > 0 || walletDepositCol1 < 0) {
                    fundDepositCol1 = fundDepositCol1 + walletDepositCol1;
                }
                const walletDepositCol2 = walletDepositData[depositTableHeader[1]];
                if (walletDepositCol2 > 0 || walletDepositCol2 < 0) {
                    fundDepositCol2 = fundDepositCol2 + walletDepositCol2;
                }
                const walletDepositCol3 = walletDepositData[depositTableHeader[2]];
                if (walletDepositCol3 > 0 || walletDepositCol3 < 0) {
                    fundDepositCol3 = fundDepositCol3 + walletDepositCol3;
                }
                const walletDepositCol4 = walletDepositData[depositTableHeader[3]];
                if (walletDepositCol4 > 0 || walletDepositCol4 < 0) {
                    fundDepositCol4 = fundDepositCol4 + walletDepositCol4;
                }
                const walletDepositCol5 = walletDepositData[depositTableHeader[4]];
                if (walletDepositCol5 > 0 || walletDepositCol5 < 0) {
                    fundDepositCol5 = fundDepositCol5 + walletDepositCol5;
                }
                const walletDepositCol6 = walletDepositData[depositTableHeader[5]];
                if (walletDepositCol6 > 0 || walletDepositCol6 < 0) {
                    fundDepositCol6 = fundDepositCol6 + walletDepositCol6;
                }
                const walletDepositCol7 = walletDepositData[depositTableHeader[6]];
                if (walletDepositCol7 > 0 || walletDepositCol7 < 0) {
                    fundDepositCol7 = fundDepositCol7 + walletDepositCol7;
                }
                const walletDepositTotal = walletDepositData["walletDepositTotal"];
                if (walletDepositTotal !== 0) {
                    fundDepositTotal = fundDepositTotal + walletDepositTotal;
                }

                return (
                    <tr key={wallet}>
                        <th className="col-sm-4 col-xs-6">{walletDepositData.walletOwner}</th>
                        <td className="warning col-sm-1 col-xs-3">{walletDepositTotal}</td>
                        <td className={walletDepositCol1 > 0 ? 'success col-sm-1 hidden-xs' : 'td-amount-zero col-sm-1 hidden-xs'}>{walletDepositCol1}</td>
                        <td className={walletDepositCol2 > 0 ? 'success col-sm-1 hidden-xs' : 'td-amount-zero col-sm-1 hidden-xs'}>{walletDepositCol2}</td>
                        <td className={walletDepositCol3 > 0 ? 'success col-sm-1 hidden-xs' : 'td-amount-zero col-sm-1 hidden-xs'}>{walletDepositCol3}</td>
                        <td className="info col-sm-1 col-xs-3">{walletDepositCol4}</td>
                        <td className={walletDepositCol5 > 0 ? 'success col-sm-1 hidden-xs' : 'td-amount-zero col-sm-1 hidden-xs'}>{walletDepositCol5}</td>
                        <td className={walletDepositCol6 > 0 ? 'success col-sm-1 hidden-xs' : 'td-amount-zero col-sm-1 hidden-xs'}>{walletDepositCol6}</td>
                        <td className={walletDepositCol7 > 0 ? 'success col-sm-1 hidden-xs' : 'td-amount-zero col-sm-1 hidden-xs'}>{walletDepositCol7}</td>
                    </tr>
                );
            });

            const depositTotalRowRender = [1].map(() => {
                if (fundDepositCol1 === 0) {
                    fundDepositCol1 = undefined;
                }
                if (fundDepositCol2 === 0) {
                    fundDepositCol2 = undefined;
                }
                if (fundDepositCol3 === 0) {
                    fundDepositCol3 = undefined;
                }
                if (fundDepositCol4 === 0) {
                    fundDepositCol4 = undefined;
                }
                if (fundDepositCol5 === 0) {
                    fundDepositCol5 = undefined;
                }
                if (fundDepositCol6 === 0) {
                    fundDepositCol6 = undefined;
                }
                if (fundDepositCol7 === 0) {
                    fundDepositCol7 = undefined;
                }
                if (fundDepositTotal === 0) {
                    fundDepositTotal = undefined;
                }
                return (
                    <tr key="1">
                        <th className="col-sm-4 col-xs-6">DC Fund - Total</th>
                        <td className="warning col-sm-1 col-xs-3">{fundDepositTotal}</td>
                        <td className="warning col-sm-1 hidden-xs">{fundDepositCol1}</td>
                        <td className="warning col-sm-1 hidden-xs">{fundDepositCol2}</td>
                        <td className="warning col-sm-1 hidden-xs">{fundDepositCol3}</td>
                        <td className="info col-sm-1 col-xs-3">{fundDepositCol4}</td>
                        <td className="warning col-sm-1 hidden-xs">{fundDepositCol5}</td>
                        <td className="warning col-sm-1 hidden-xs">{fundDepositCol6}</td>
                        <td className="warning col-sm-1 hidden-xs">{fundDepositCol7}</td>
                    </tr>
                );
            });

            depositReportRender = [1].map(() => {
                return (
                    <table key="1" className="table table-bordered table-responsive table-hover">
                        <thead>
                        <tr>
                            <th className="col-sm-4 col-xs-6">Full Name</th>
                            <th className="col-sm-1 col-xs-3">Total</th>
                            <th className="col-sm-1 hidden-xs">{depositTableHeader[0]}</th>
                            <th className="col-sm-1 hidden-xs">{depositTableHeader[1]}</th>
                            <th className="col-sm-1 hidden-xs">{depositTableHeader[2]}</th>
                            <th className="info col-sm-1 col-xs-3">{depositTableHeader[3]}</th>
                            <th className="col-sm-1 hidden-xs">{depositTableHeader[4]}</th>
                            <th className="col-sm-1 hidden-xs">{depositTableHeader[5]}</th>
                            <th className="col-sm-1 hidden-xs">{depositTableHeader[6]}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {depositRowRender}
                        {depositTotalRowRender}
                        </tbody>
                    </table>
                )
            });
        }

        // Request Chart data
        const requestChartHeader = [];
        fromMonth = -6;
        toMonth = 0;
        if (currentDay >= 27) {
            fromMonth = -5;
            toMonth = 1;
        }
        for (let i = fromMonth; i <= toMonth; i++) {
            let year = currentYear;
            let month = currentMonth + i;
            if (month < 1) {
                month = 12 + month;
                year--;
            }
            if (month > 12) {
                month = month - 12;
                year++;
            }
            const header = month + '.' + year;
            requestChartHeader.push(header);
        }
        const requestChartData = this.state.requestChartData;
        let requestChartDisplayData = {
            "header": requestChartHeader,
            "deposit": [0, 0, 0, 0, 0, 0, 0],
            "withdraw": [0, 0, 0, 0, 0, 0, 0],
            "borrow": [0, 0, 0, 0, 0, 0, 0],
            "pay": [0, 0, 0, 0, 0, 0, 0]
        };
        if (requestChartData) {
            if (requestChartData["0"]) {
                requestChartDisplayData.deposit = _.map(requestChartHeader, (month) => {
                    const amount = requestChartData["0"][month];
                    return amount ? amount : 0;
                });
            }
            if (requestChartData["1"]) {
                requestChartDisplayData.withdraw = _.map(requestChartHeader, (month) => {
                    const amount = requestChartData["1"][month];
                    return amount ? amount : 0;
                });
            }
            if (requestChartData["2"]) {
                requestChartDisplayData.borrow = _.map(requestChartHeader, (month) => {
                    const amount = requestChartData["2"][month];
                    return amount ? amount : 0;
                });
            }
            if (requestChartData["3"]) {
                requestChartDisplayData.pay = _.map(requestChartHeader, (month) => {
                    const amount = requestChartData["3"][month];
                    return amount ? amount : 0;
                });
            }
        }

        const carouselChart = [1].map(() => {
            return (
                <div key="1" id="carousel-example-generic" className="carousel slide carousel-report-chart" data-ride="carousel">
                    <ol className="carousel-indicators">
                        <li data-target="#carousel-example-generic" data-slide-to="0" className="active"/>
                        <li data-target="#carousel-example-generic" data-slide-to="1"/>
                        <li data-target="#carousel-example-generic" data-slide-to="2"/>
                    </ol>

                    <div className="carousel-inner" role="listbox">
                        <div key={1} className="item active">
                            <HorBarBorrowComp chartData={this.state.borrowChartData}/>
                            <div className="carousel-caption">
                                <h4>Borrowing</h4>
                            </div>
                        </div>
                        <div key={2} className="item">
                            <PieFundBalanceComp chartData={fundBalancePieData}/>
                            <div className="carousel-caption">
                                <h4>Availability</h4>
                            </div>
                        </div>
                        <div key={3} className="item">
                            <VerBarReqTypeComp chartData={requestChartDisplayData}/>
                            <div className="carousel-caption">
                                <h4>Request</h4>
                            </div>
                        </div>
                    </div>

                    <a className="left carousel-control" href="#carousel-example-generic" role="button"
                       data-slide="prev">
                        <span className="glyphicon glyphicon-chevron-left" aria-hidden="true"/>
                        <span className="sr-only">Previous</span>
                    </a>
                    <a className="right carousel-control" href="#carousel-example-generic" role="button"
                       data-slide="next">
                        <span className="glyphicon glyphicon-chevron-right" aria-hidden="true"/>
                        <span className="sr-only">Next</span>
                    </a>
                </div>
            )
        });

        return (
            <div>
                <div className="container">
                    <header>
                        <h1>Report</h1>
                    </header>

                    <div className="row">
                        <div className="col-xs-12">
                            <h3>Borrowing</h3>
                            <h6><i>* 1 DCF = 1.000.000 VND</i></h6>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-6">
                            {this.state.loadingReport ?
                                <div className="loader-container">
                                    <DotLoader
                                        size={60}
                                        color={'#86bc25'}
                                        loading={this.state.loadingReport}
                                    />
                                </div> : borrowReportRender}
                        </div>
                        <div className="hidden-xs col-sm-12 col-md-6">
                            {this.state.loadingReport ?
                                <div className="loader-container">
                                    <DotLoader
                                        size={60}
                                        color={'#86bc25'}
                                        loading={this.state.loadingReport}
                                    />
                                </div> : carouselChart}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <div>
                                <h3>Deposit</h3>
                                <h6><i>* 1 DCF = 1.000.000 VND</i></h6>
                                {this.state.loadingReport ?
                                    <div className="loader-container">
                                        <DotLoader
                                            size={60}
                                            color={'#86bc25'}
                                            loading={this.state.loadingReport}
                                        />
                                    </div> : depositReportRender}
                            </div>
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
})(ReportPage);