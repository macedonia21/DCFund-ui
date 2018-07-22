import React, {Component} from 'react';
import {Bar} from 'react-chartjs-2';

export default class PieFundBalanceComp extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    render() {
        const data = {
            labels: this.props.chartData.header,
            datasets: [{
                label: 'Deposit',
                backgroundColor: 'rgba(134,188,37,0.5)',
                borderColor: 'rgba(134,188,37,1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(134,188,37,0.8)',
                hoverBorderColor: 'rgba(134,188,37,1)',
                data: this.props.chartData.deposit,
            }, {
                label: 'Withdraw',
                backgroundColor: 'rgba(91,192,222,0.5)',
                borderColor: 'rgba(91,192,222,1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(91,192,222,0.8)',
                hoverBorderColor: 'rgba(91,192,222,1)',
                data: this.props.chartData.withdraw
            }, {
                label: 'Borrow',
                backgroundColor: 'rgba(217,83,79,0.5)',
                borderColor: 'rgba(217,83,79,1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(217,83,79,0.8)',
                hoverBorderColor: 'rgba(217,83,79,1)',
                data: this.props.chartData.borrow
            }, {
                label: 'Pay',
                backgroundColor: 'rgba(240,173,78,0.5)',
                borderColor: 'rgba(240,173,78,1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(240,173,78,0.8)',
                hoverBorderColor: 'rgba(240,173,78,1)',
                data: this.props.chartData.pay
            }]

        };

        const options = {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true
                        }
                    }
                ]
            }
        };

        return (
            <Bar key="chart3" data={data} options={options}/>
        );
    }
}