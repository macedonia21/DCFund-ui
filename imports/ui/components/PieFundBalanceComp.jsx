import React, {Component} from 'react';
import {Pie} from 'react-chartjs-2';

export default class PieFundBalanceComp extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    render() {
        const data = {
            labels: [
                'Lending',
                'Available'
            ],
            datasets: [{
                data: this.props.chartData,
                backgroundColor: [
                    'rgba(217,83,79,0.5)',
                    'rgba(134,188,37,0.5)'
                ],
                borderColor: [
                    'rgba(217,83,79,1)',
                    'rgba(134,188,37,1)'
                ],
                borderWidth: 1,
                hoverBackgroundColor: [
                    'rgba(217,83,79,0.8)',
                    'rgba(134,188,37,0.8)'
                ],
                hoverBorderColor: [
                    'rgba(217,83,79,1)',
                    'rgba(134,188,37,1)'
                ]
            }]
        };

        return (
            <Pie key="chart1" data={data}/>
        );
    }
}