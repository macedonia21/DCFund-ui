import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import {DotLoader} from 'react-spinners';

class BlockPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            blocks: [],
        }
    }

    componentDidMount() {
        Meteor.call('blocks.get', {}, (err, res) => {
            if (err) {
                this.setState({blocks: []});
            } else {
                this.setState({blocks: res});
            }
            this.setState({loading: false});
        });
    }

    render() {
        let currentUser = this.props.currentUser;
        let userDataAvailable = (currentUser !== undefined);
        let loggedIn = (currentUser && userDataAvailable);

        let blocks = [1].map(() => {
            return (
                <li key='1' className="list-group-item">
                    No block found
                </li>
            )
        });

        if (this.state.blocks && this.state.blocks.length > 0) {
            blocks = this.state.blocks.map((block) => {
                return (
                    <li key={block.hash} className="list-group-item">
                        <span className="badge">{block.index}</span>
                        <Link to={`/block/${block.hash}`}>
                            {block.hash}
                        </Link>
                    </li>
                );
            });
        }

        return (
            <div>
                <div className="container">
                    <header>
                        <h1>Blockchain</h1>
                    </header>

                    <div className='container-fluid'>
                        <div className="loader-container">
                            <DotLoader
                                color={'#86bc25'}
                                loading={this.state.loading}
                            />
                        </div>

                        {this.state.loading ? '' :
                            <ul className="list-group">
                                {blocks}
                            </ul>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default withTracker(() => {
    return {
        currentUser: Meteor.user(),
    };
})(BlockPage);