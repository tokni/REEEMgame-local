// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from "react";
import { Menu } from "./Menu/Menu";
import { Date } from "./Date/Date";
import { Map } from "./Map/Map";
import { TimeBar } from "./TimeBar/TimeBar"


export class World extends React.Component<{}, {}> {
    render() {
        return (
            <div style={{ height: '100%', width: '100%', position: 'relative' }}>
                <Menu />
                <Date />
                <Map />
                <TimeBar />
            </div>
        );
    }
}
