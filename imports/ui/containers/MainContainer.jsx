import React, {Component} from 'react';
import {withHistory, Switch, Route, BrowserRouter as Router} from 'react-router-dom';

import WalletPage from '../pages/WalletPage';
import ReportPage from '../pages/ReportPage';
import ProfilePage from '../pages/ProfilePage';
import BlockPage from '../pages/BlockPage';
import BlockInfoPage from '../pages/BlockInfoPage';
import AddressPage from '../pages/AddressPage';
import TransactionPage from '../pages/TransactionPage';
import RulesPage from '../pages/RulesPage';
import PageNotFound from '../pages/PageNotFound';

export default class MainContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        }
    }

    render() {
        return (
            <Switch>
                <Route exact path="/" component={WalletPage}/>
                <Route path="/profile" component={ProfilePage}/>
                <Route path="/report" component={ReportPage}/>
                <Route exact path="/block" component={BlockPage}/>
                <Route path="/block/:blockHash" component={BlockInfoPage}/>
                <Route path="/address/:address" component={AddressPage}/>
                <Route path="/transaction/:transactionID" component={TransactionPage}/>
                <Route path="/rule" component={RulesPage}/>
                <Route component={PageNotFound}/>
            </Switch>
        );
    }
}