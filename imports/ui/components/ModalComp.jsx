import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';

import RulesComp from '../components/RulesComp';

class ModalComp extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className={this.props.classShowHideHelp} role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={this.props.handleClose}><span
                                    aria-hidden="true">&times;</span></button>
                                <h3 className="modal-title">DC fund Rules</h3>
                            </div>
                            <div className="modal-body text-justify">
                                <RulesComp/>
                            </div>
                        </div>
                    </div>
                </div>
                {this.props.classShowHideHelp.includes('display-block') ? <div className="modal-backdrop fade in"/> : ''}
            </div>
        );
    }
}

export default withTracker(() => {
    return {
        currentUser: Meteor.user()
    };
})(ModalComp);