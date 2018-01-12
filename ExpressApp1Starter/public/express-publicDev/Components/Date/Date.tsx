// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";

export class Date extends React.Component<{}, {}> {
    render() {
        var style = {
            clear: 'left',
            float: 'left',
            width: '250px',
            height: '100px',
            boxSizing: 'border-box',
            marginTop: '10px',
            background: '#0D7DB8',
            color: 'white',
            position: 'relative',
            //border: '1px solid black'
        } as React.CSSProperties;
        return (
            <div style={style}>
                Date
            </div>
        )
    }
}