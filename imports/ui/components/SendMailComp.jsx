import React, {Component} from 'react';
import {NotificationManager} from 'react-notifications';
import {withTracker} from 'meteor/react-meteor-data';
import {DotLoader} from 'react-spinners';

class SendMailComp extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    sendMail() {
        const emailData = {
            data: {
                'receiver': 'anhtuan.hoangvu@gmail.com',
                'subject': '[DCFund] test mail',
                'text': 'Dear Tuan, please approve request. Thank you!',
            }
        };
        Meteor.call('email.send', emailData, (err, res) => {
            if (err) {
                NotificationManager.error(err.message, 'Error', 3000);
            } else {
                NotificationManager.success('Email sent', 'Success', 3000);
            }
        });
    }

    render() {
        return (
            <div>
                This is sendmail button
                <button type="button" className="btn btn-success btn-lg"
                        onClick={() => {
                            this.sendMail();
                        }}>Send Email
                </button>
            </div>
        );
    }
}

export default withTracker(() => {
    return {
        currentUser: Meteor.user()
    };
})(SendMailComp);