import React, {Component} from 'react';

export default class AdminEmailComp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading flags
            requestSending: false,

            // Data
            remindData: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    onRemind() {
        this.setState({requestSending: true});
        Meteor.call('allRemind.send', true, (err, res) => {
            if (err) {
                this.setState({remindData: null});
            } else {
                console.log(res);
                this.setState({remindData: res});
            }
            setTimeout(() => {
                this.setState({requestSending: false});
            }, 1000);
        });
    }

    render() {
        return (
            <div>
                <h3>
                    Monthly reminder
                </h3>
                <div className='container-fluid'>
                    <button type="button" className="btn btn-info"
                            disabled={
                                this.state.requestSending
                            }
                            onClick={() => {
                                this.onRemind();
                            }}>
                        <span className="glyphicon glyphicon-bell" aria-hidden="true"/>&nbsp;
                        Send reminder
                    </button>
                </div>
            </div>
        );
    }
}