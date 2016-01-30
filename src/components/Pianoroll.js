import React, { Component } from 'react';
import { connect } from 'react-redux';

import { mapPianorollToProps } from '../selectors/selectorPianoroll.js';
import { shiftInterval,
         zoomInterval } from '../helpers/intervalHelpers.js';
import { pianorollScrollX,
         pianorollScrollY } from '../actions/actionsPianoroll.js';

import PianorollTimeline      from './PianorollTimeline.js';
import PianorollWindow        from './PianorollWindow.js';
import PianorollWindowSlider  from './PianorollWindowSlider.js';
import PianorollKeyboard      from './PianorollKeyboard.js';
import Scrollbar              from './Scrollbar.js';
import TimelineCursor from './TimelineCursor.js'

export default class Pianoroll extends Component {

  constructor() {
    super();
    this.data = {};
  }

  render() {
    let dispatchProp = {
      dispatch: this.props.dispatch
    }
    let keyboardProps = {
      yMin: this.props.yMin,
      yMax: this.props.yMax,
      keyCount: this.props.keyCount
    }
    let timelineProps = {
      cursor: this.props.cursor,
      xMin: this.props.xMin,
      xMax: this.props.xMax,
      barCount: this.props.barCount
    }

    return (
      <div className="pianoroll">
        <PianorollKeyboard {...dispatchProp} {...keyboardProps} />
        <PianorollTimeline {...dispatchProp} {...timelineProps} ref={(ref) => this.timeline = ref} />
        <PianorollWindow {...this.props} >
          <PianorollWindowSlider {...this.props} />
          <div className="pianoroll-scrollbar-horizontal">
            <Scrollbar draggableEndpoints
              min={this.props.xMin} setScroll={(min,max) => this.props.dispatch(pianorollScrollX(min,max))}
              max={this.props.xMax}
            />
          </div>        
        </PianorollWindow>
        <TimelineCursor cursor={this.props.cursor} />
      </div>
    );
  }

  handleScrollZone(e, hover) {
    this.data.scrollZoneHover = hover;
    this.forceUpdate();
  }

}

Pianoroll.propTypes = {
  currentTrack: React.PropTypes.object,
  clips:    React.PropTypes.array,
  notes:    React.PropTypes.array,
  cursor:   React.PropTypes.number,
  playhead: React.PropTypes.number,
  xMin:   React.PropTypes.number,
  xMax:   React.PropTypes.number,
  yMin:   React.PropTypes.number,
  yMax:   React.PropTypes.number,
  selectionStartX: React.PropTypes.number,
  selectionStartY: React.PropTypes.number,
  selectionEndX: React.PropTypes.number,
  selectionEndY: React.PropTypes.number
};
Pianoroll.defaultProps = {
  keyCount: 88
};

export default connect(mapPianorollToProps)(Pianoroll);
