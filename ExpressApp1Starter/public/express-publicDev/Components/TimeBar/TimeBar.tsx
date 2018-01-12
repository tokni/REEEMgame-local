import * as React from "react";
export class TimeBar extends React.Component<{}, {}> {
    render() {
        return (
			<div id='timeBarContainer'>
				<div id='progressBar' className='progress dateProgress'>
                    <div className="progress-bar dateProgressValue" role="progessbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" >

                    </div>
                </div>
                <div id='progressBarSlider' className='progress dateProgress' style={{ display: "none" }}>
                    <div className='ui-slider-handle leftHandle'></div>
                    <div className='ui-slider-handle rightHandle'></div>
                </div>

            </div>

        );
    }
}