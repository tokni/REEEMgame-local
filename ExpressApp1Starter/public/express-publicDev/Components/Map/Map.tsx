// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from "react";

export class Map extends React.Component<{}, {}> {
    render() {
        
        var style = {
            position: 'relative',
            //clear: 'left',
            //float: 'left',
            boxSizing: 'border-box',
            height: '100%',
            width: 'calc(100% - 250px)',
            //border: '1px solid blue'
        } as React.CSSProperties;
        return (
            <div id='pMap' style={style}>
                
            </div>
        )
    }
}