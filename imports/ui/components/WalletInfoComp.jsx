import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {DotLoader} from 'react-spinners';
import QRCode from 'qrcode-react';

class WalletInfoComp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading flags
            loadingBalance: true,

            // Data
            balance: {},
            allBalances: [],
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    render() {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);
        let isApprover = Roles.userIsInRole(currentUser, 'approver');

        let balance = this.props.balance;

        return (
            <div>
                {this.props.loadingBalance ?
                    <div className="loader-container">
                        <h3><DotLoader
                            size={26}
                            color={'#86bc25'}
                            loading={this.props.loadingBalance}
                        /></h3></div>
                    :
                    <div>
                        {balance ?
                            <div>
                                <h3>Deposit: {balance.deposit} DCF</h3>
                                <h4>{!isApprover ? 'Borrow' : 'Lend'}: {balance.lend} DCF</h4>
                                {isApprover ?
                                    <h4>
                                        Balance: {balance.deposit - balance.lend}
                                    </h4> : ''}
                            </div> :
                            <div>
                                <h3>Cannot retrieve balance</h3>
                            </div>}
                    </div>
                }
                <h6><i>* 1 DCF = 1.000.000 VND</i></h6>

                {loggedIn ?
                    <div className='container-fluid'>
                        <div className='qr-wallet text-center'>
                            <h6>{currentUser.profile.address}</h6>
                            <QRCode value={currentUser.profile.address} size={256}/>
                        </div>
                    </div> : ''}
            </div>
        );
    }
}

export default withTracker(() => {
    return {
        currentUser: Meteor.user()
    };
})(WalletInfoComp);