import React, {Component} from 'react';

export default class Notfound extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className="container">
                    <h1>
                        404 Page not found
                    </h1>
                </div>
            </div>
        );
    };
}