
//(function () {
//    //var quiz = React.createClass({
//    //    render: function () {
//    //        return <div>test</div>;
//    //    }
//    //});
//    class Quiz extends React.Component {
//        render() {
//            return <div>test</div>;
//        }
//    }
//    ReactDOM.render(<Quiz />, document.getElementById('root'));
//})();

import * as React from "react";
import * as ReactDOM from "react-dom";
import { World } from "../public/express-publicDev/Components/World"
import { TKN_Map } from "../public/express-publicDev/clientTypeScript/leaflet/TKN_map"

export interface ButtonProps { onButtonClick: () => void };

export class MenuItem extends React.Component<{}, {}> {
    render() {
        return (
            <div> 
                MenuItem
            </div>
        );
    }
}

ReactDOM.render(<World />, document.getElementById('pWorld'));
new TKN_Map();