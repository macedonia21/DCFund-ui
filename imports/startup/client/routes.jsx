import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {NotificationContainer} from 'react-notifications';

// containers
import AppContainer from '../../ui/containers/AppContainer'

// pages
import SignupPage from '../../ui/pages/SignupPage'
import LoginPage from '../../ui/pages/LoginPage'
import ForgotPasswordPage from '../../ui/pages/ForgotPasswordPage'
import ResetPasswordPage from '../../ui/pages/ResetPasswordPage'

export const renderRoutes = () => (
    <Router>
        <div>
            <Switch>
                <Route path="/login" component={LoginPage}/>
                <Route path="/signup" component={SignupPage}/>
                <Route path="/forgot-password" component={ForgotPasswordPage}/>
                <Route path="/reset-password/:token" component={ResetPasswordPage}/>
                <Route component={AppContainer}/>
            </Switch>
            <NotificationContainer/>
        </div>
    </Router>
);
