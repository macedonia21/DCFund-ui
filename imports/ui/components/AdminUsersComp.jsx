import React, {Component} from 'react';
import {DotLoader} from 'react-spinners';

import UserRoleComp from '../components/UserRoleComp';

export default class AdminBoardComp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Loading flags
            loadingUsers: false,

            // Data
            users: null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    componentDidMount() {
        this.fetchUsers();
    }

    fetchUsers() {
        this.setState({loadingUsers: true});

        Meteor.call('admin.getUserRole', true, (err, res) => {
            if (err) {
                this.setState({users: null});
            } else {
                this.setState({users: res});
            }
            this.setState({loadingUsers: false});
        });
    }

    onCheckboxChange(userId, role) {

    }

    render() {
        const users = this.state.users;

        const userRoleHeader = [1].map(() => {
            return (
                <div key={1} className="form-group">
                    <label className="col-xs-4 control-label text-left">Full Name</label>
                    <label className="col-xs-4 control-label">Email</label>
                    <label className="col-xs-1 control-label">Admn</label>
                    <label className="col-xs-1 control-label">Apvr</label>
                    <label className="col-xs-1 control-label">Susr</label>
                    <label className="col-xs-1 control-label">User</label>
                </div>
            );
        });

        let userRoleRender = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    No users found
                </li>
            )
        });

        if (users) {
            userRoleRender = users.map((user) => {
                return (
                    <UserRoleComp key={user._id} user={user} onCheckboxChange={this.onCheckboxChange}/>
                );
            });
        }

        return (
            <div>
                <h3>
                    Manage Users
                </h3>
                <div className='container-fluid'>
                    <div className="loader-container">
                        <DotLoader
                            color={'#86bc25'}
                            loading={this.state.loadingUsers}
                        />
                    </div>

                    {this.state.loadingUsers ? '' :
                        <div>
                            <form className="form-horizontal" role="form">
                                {userRoleHeader}
                                {userRoleRender}
                            </form>
                        </div>}
                </div>
            </div>
        );
    }
}