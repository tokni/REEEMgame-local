//import * as React from "react";
//import * as ReactDOM from "react-dom";


//export interface ButtonProps { onButtonClick: () => void };

//export class Button extends React.Component<ButtonProps, {}> {
//    render() {
//        return (<button onClick={this.props.onButtonClick} >+2</button >)
//    }
//}
//const Result = (props) => {
//    return <div>{props.counter}</div>
//}

//class App extends React.Component<{}, { counter: number }> {
//    state = { counter: 0 }
//    incrementResult = () => {
//        this.setState((prevState) => ({
//            counter: prevState.counter + 1
//        }));
//    };
//    render() {
//        return (
//            <div>
//                <Button onButtonClick={this.incrementResult} />
//                <Result counter={this.state.counter} />
//            </div>
//        );
//    }
//}
//ReactDOM.render(<App />, document.getElementById('root2'));
//stupid remarks