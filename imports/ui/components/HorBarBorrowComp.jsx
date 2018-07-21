import React, {Component} from 'react';
import {HorizontalBar} from 'react-chartjs-2';

export default class HorBarBorrowComp extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    render() {
        const dataBorrow = {
            labels: this.props.chartData.key,
            datasets: [
                {
                    label: 'Borrowing (DCF)',
                    backgroundColor: 'rgba(217,83,79,0.5)',
                    borderColor: 'rgba(217,83,79,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(217,83,79,0.8)',
                    hoverBorderColor: 'rgba(217,83,79,1)',
                    data: this.props.chartData.value
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

        return (
            <HorizontalBar key="chart2"
                           data={dataBorrow}
                           options={optionsBorrow}/>
        );
    }
}