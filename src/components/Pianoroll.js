import React, { Component } from 'react';
import { connect } from 'react-redux';

import { pianorollSelector } from '../selectors/selectorPianoroll.js';
import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { pianorollScrollX,
         pianorollScrollY } from '../actions/actions.js';

import EffectsModule          from './EffectsModule.js';
import PianorollTimeline      from './PianorollTimeline.js';
import PianorollWindow        from './PianorollWindow.js';
import PianorollWindowSlider  from './PianorollWindowSlider.js';
import PianorollKeyboard      from './PianorollKeyboard.js';
import Scrollbar              from './Scrollbar.js';

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
      keyMin: this.props.keyMin,
      keyMax: this.props.keyMax,
      keyCount: this.props.keyCount
    }
    let timelineProps = {
      barMin: this.props.barMin,
      barMax: this.props.barMax,
      barCount: this.props.barCount
    }
    return (
      <div className="pianoroll">
        <PianorollKeyboard {...dispatchProp} {...keyboardProps} />
        <PianorollTimeline {...dispatchProp} {...timelineProps} ref={(ref) => this.timeline = ref} />
        <PianorollWindow {...dispatchProp} {...keyboardProps} {...timelineProps} >
          <PianorollWindowSlider {...this.props} />
          <div className="pianoroll-window-scroll-zone"
            onMouseEnter={(e) => this.handleScrollZone(e, true)}
            onMouseLeave={(e) => this.handleScrollZone(e, false)}
          >
            <Scrollbar draggableEndpoints
              min={this.props.barMin} setScroll={(min,max) => this.props.dispatch(pianorollScrollX(min,max))}
              max={this.props.barMax} forceHover={this.data.scrollZoneHover}
            />
          </div>        
        </PianorollWindow>
      </div>
    );
  }

  handleScrollZone(e, hover) {
    this.data.scrollZoneHover = hover;
    this.forceUpdate();
  }

}

Pianoroll.propTypes = {
  clips:    React.PropTypes.array,
  notes:    React.PropTypes.array,
  cursor:   React.PropTypes.number,
  playHead: React.PropTypes.number,
  barMin:   React.PropTypes.number,
  barMax:   React.PropTypes.number,
  keyMin:   React.PropTypes.number,
  keyMax:   React.PropTypes.number,
  selectionStartX: React.PropTypes.number,
  selectionStartY: React.PropTypes.number,
  selectionEndX: React.PropTypes.number,
  selectionEndY: React.PropTypes.number
};
Pianoroll.defaultProps = {
  cursor:   0.000,
  playHead: 0.000,
  barCount: 64,
  keyCount: 88,
};

export default connect(pianorollSelector)(Pianoroll);