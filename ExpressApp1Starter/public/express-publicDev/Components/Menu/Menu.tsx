// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";
export class Decisions extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                Decision
            </div>
        );
    }
}
export class Participants extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                Participants
            </div>
        );
    }
}
export class Data extends React.Component<{}, {}> {
    render() {
        return (
            <div>
                Data
            </div>
        );
    }
}
export class Menu extends React.Component<{}, {}> {
    render() {
        var style = {
            position: 'relative',
            boxSizing: 'border-box',
            float: 'left',
            width: '250px',
            height: 'calc(100% - 110px)',
            background: '#0F7DB8',
            color: 'white',

            //border: '1px solid black'
        } as React.CSSProperties;
        return (
            <div style={style}>
                Menu
                <Decisions />
                <Participants />
                <Data />
            </div>
        )
    }
}