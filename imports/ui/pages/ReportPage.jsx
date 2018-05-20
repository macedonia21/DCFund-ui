import React, {Component} from 'react';
import {ec} from 'elliptic';
import {HorizontalBar} from 'react-chartjs-2';
import {NotificationManager} from 'react-notifications';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import {DotLoader} from 'react-spinners';
import QRCode from 'qrcode-react';

class ReportPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            didMount: false,
            // Loading flags
            loadingBorrowReport: true,
            loadingDepositReport: true,

            borrowReportData: null,
            depositReportData: null
        };
    }

    componentDidMount() {
        this.setState({didMount: true});
    }

    componentDidUpdate() {
        if (this.state.loadingBorrowReport) {
            this.fetchBorrowReport();
        }
    }

    fetchBorrowReport() {
        Meteor.call('report.get', true, (err, res) => {
            if (err) {
                this.setState({
                    borrowReportData: null,
                    depositReportData: null
                });
            } else {
                if (res.borrowReportData) {
                    this.setState({borrowReportData: res.borrowReportData});
                }

                if (res.depositReportData) {
                    this.setState({depositReportData: res.depositReportData});
                }
            }
            this.setState({
                loadingBorrowReport: false,
                loadingDepositReport: false
            });
        });
    }

    render() {
        const currentUser = this.props.currentUser;
        const userDataAvailable = (currentUser !== undefined);
        const loggedIn = (currentUser && userDataAvailable);
        const isAdmin = Roles.userIsInRole(currentUser, 'administrator');
        const isApprover = Roles.userIsInRole(currentUser, 'approver');
        const isUser = Roles.userIsInRole(currentUser, 'user');

        // Borrow Render
        const borrowReportData = this.state.borrowReportData;
        let borrowReportRender = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    No data found or error reading data
                </li>
            )
        });
        if (borrowReportData) {
            const dataBorrow = {
                labels: borrowReportData.key,
                datasets: [
                    {
                        label: 'Borrowing (DCF)',
                        backgroundColor: 'rgba(217,83,79,0.2)',
                        borderColor: 'rgba(217,83,79,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(217,83,79,0.4)',
                        hoverBorderColor: 'rgba(217,83,79,1)',
                        data: borrowReportData.value
                    }
                ]
            };

            const optionsBorrow = {
                scales: {
                    xAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                }
            };

            borrowReportRender = [1].map(() => {
                return (
                    <HorizontalBar key="1"
                                   data={dataBorrow}
                                   options={optionsBorrow}/>
                );
            });
        }

        // Deposit Render
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const depositTableHeader = [];
        for (let i = -3; i <= 3; i++) {
            let year = currentYear;
            let month = currentMonth + i;
            if (month < 1) {
                month = 12 + month;
                year--;
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
                if (walletDepositCol1 > 0) {
                    fundDepositCol1 = fundDepositCol1 + walletDepositCol1;
                }
                const walletDepositCol2 = walletDepositData[depositTableHeader[1]];
                if (walletDepositCol2 > 0) {
                    fundDepositCol2 = fundDepositCol2 + walletDepositCol2;
                }
                const walletDepositCol3 = walletDepositData[depositTableHeader[2]];
                if (walletDepositCol3 > 0) {
                    fundDepositCol3 = fundDepositCol3 + walletDepositCol3;
                }
                const walletDepositCol4 = walletDepositData[depositTableHeader[3]];
                if (walletDepositCol4 > 0) {
                    fundDepositCol4 = fundDepositCol4 + walletDepositCol4;
                }
                const walletDepositCol5 = walletDepositData[depositTableHeader[4]];
                if (walletDepositCol5 > 0) {
                    fundDepositCol5 = fundDepositCol5 + walletDepositCol5;
                }
                const walletDepositCol6 = walletDepositData[depositTableHeader[5]];
                if (walletDepositCol6 > 0) {
                    fundDepositCol6 = fundDepositCol6 + walletDepositCol6;
                }
                const walletDepositCol7 = walletDepositData[depositTableHeader[6]];
                if (walletDepositCol7 > 0) {
                    fundDepositCol7 = fundDepositCol7 + walletDepositCol7;
                }
                const walletDepositTotal = walletDepositData["walletDepositTotal"];
                if (walletDepositTotal > 0) {
                    fundDepositTotal = fundDepositTotal + walletDepositTotal;
                }

                return (
                    <tr key={wallet}>
                        <th>{walletDepositData.walletOwner}</th>
                        <td className="warning">{walletDepositTotal}</td>
                        <td className={walletDepositCol1 > 0 ? 'success' : 'td-amount-zero'}>{walletDepositCol1}</td>
                        <td className={walletDepositCol2 > 0 ? 'success' : 'td-amount-zero'}>{walletDepositCol2}</td>
                        <td className={walletDepositCol3 > 0 ? 'success' : 'td-amount-zero'}>{walletDepositCol3}</td>
                        <td className="info">{walletDepositCol4}</td>
                        <td className={walletDepositCol5 > 0 ? 'success' : 'td-amount-zero'}>{walletDepositCol5}</td>
                        <td className={walletDepositCol6 > 0 ? 'success' : 'td-amount-zero'}>{walletDepositCol6}</td>
                        <td className={walletDepositCol7 > 0 ? 'success' : 'td-amount-zero'}>{walletDepositCol7}</td>
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
                        <th>DC Fund</th>
                        <td className="warning">{fundDepositTotal}</td>
                        <td className="warning">{fundDepositCol1}</td>
                        <td className="warning">{fundDepositCol2}</td>
                        <td className="warning">{fundDepositCol3}</td>
                        <td className="info">{fundDepositCol4}</td>
                        <td className="warning">{fundDepositCol5}</td>
                        <td className="warning">{fundDepositCol6}</td>
                        <td className="warning">{fundDepositCol7}</td>
                    </tr>
                );
            });

            depositReportRender = [1].map(() => {
                return (
                    <table key="1" className="table table-bordered table-responsive table-hover">
                        <thead>
                        <tr>
                            <th>Full Name</th>
                            <th className="warning">Total</th>
                            <th>{depositTableHeader[0]}</th>
                            <th>{depositTableHeader[1]}</th>
                            <th>{depositTableHeader[2]}</th>
                            <th className="info">{depositTableHeader[3]}</th>
                            <th>{depositTableHeader[4]}</th>
                            <th>{depositTableHeader[5]}</th>
                            <th>{depositTableHeader[6]}</th>
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

        return (
            <div>
                <div className="container">
                    <header>
                        <h1>Report</h1>
                    </header>

                    <div className="row">
                        <div className="col-xs-12 col-sm-8 col-md-6">
                            <div>
                                <h3>Borrowing</h3>
                                <h6><i>* 1 DCF = 1.000.000 VND</i></h6>
                                {this.state.loadingBorrowReport ?
                                    <DotLoader
                                        size={60}
                                        color={'#86bc25'}
                                        loading={this.state.loadingBorrowReport}
                                    />
                                    : borrowReportRender}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <div>
                                <h3>Deposit</h3>
                                <h6><i>* 1 DCF = 1.000.000 VND</i></h6>
                                {this.state.loadingDepositReport ?
                                    <DotLoader
                                        size={60}
                                        color={'#86bc25'}
                                        loading={this.state.loadingDepositReport}
                                    /> : depositReportRender}
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