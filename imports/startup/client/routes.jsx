import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

// containers
import AppContainer from '../../ui/containers/AppContainer'

// pages
import SignupPage from '../../ui/pages/SignupPage'
import LoginPage from '../../ui/pages/LoginPage'


export const renderRoutes = () => (
    <Router>
        <div>
            <Switch>
                <Route path="/login" component={LoginPage}/>
                <Route path="/signup" component={SignupPage}/>
                <Route component={AppContainer}/>
            </Switch>
        </div>
    </Router>
);
