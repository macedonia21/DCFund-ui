import React, {Component} from 'react';

import AdminUsersComp from '../components/AdminUsersComp';

export default class AdminBoardComp extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    render() {
        return (
            <div>
                <ul className="nav nav-tabs" role="tablist">
                    <li role="presentation" className="active">
                        <a href="#dashboard"
                           aria-controls="home" role="tab"
                           data-toggle="tab">
                            Dashboard
                        </a>
                    </li>
                    <li role="presentation">
                        <a href="#users" aria-controls="profile" role="tab"
                           data-toggle="tab">
                            Users
                        </a>
                    </li>
                </ul>
                <div className="tab-content">
                    <div role="tabpanel" className="tab-pane fade in active" id="dashboard">

                    </div>
                    <div role="tabpanel" className="tab-pane fade" id="users">
                        <AdminUsersComp/>
                    </div>
                </div>
            </div>
        );
    }
}