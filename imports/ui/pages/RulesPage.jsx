import React, {Component} from 'react';

import RulesComp from '../components/RulesComp';

export default class RulesPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className="container">
                    <header>
                        <h1>DC fund Rules</h1>
                    </header>

                    <RulesComp/>
                </div>
            </div>
        );
    };
}