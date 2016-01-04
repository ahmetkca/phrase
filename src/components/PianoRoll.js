import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shiftInterval,
         zoomInterval } from '../helpers/helpers.js';
import { pianoRollScrollX,
         pianoRollScrollY } from '../actions/actions.js';
import EffectsModule        from './EffectsModule.js';
import PianoRollTimeline    from './PianoRollTimeline.js';
import PianoRollWindow      from './PianoRollWindow.js';
import PianoRollNotesSlider from './PianoRollNotesSlider.js';
import PianoRollKeyboard    from './PianoRollKeyboard.js';
import Scrollbar            from './Scrollbar.js';

export default class PianoRoll extends Component {

  constructor() {
    super();
    this.data = {};
  }

  handleScrollZone(e, hover) {
    this.data.scrollZoneHover = hover;
    this.forceUpdate();
  }

  render() {
    return (
      <div className="piano-roll">
        <PianoRollTimeline ref={(ref) => this.timeline = ref}
          barMin={this.props.barMin}
          barMax={this.props.barMax}
          barCount={this.props.barCount} 
          dispatch={this.props.dispatch}
          />
        <div className="piano-roll-timeline-overlay" />
        <div className="piano-roll-notes-overlay" />
        <PianoRollWindow
          barCount={this.props.barCount} barMin={this.props.barMin} keyMin={this.props.keyMin}
          keyCount={this.props.keyCount} barMax={this.props.barMax} keyMax={this.props.keyMax}
          dispatch={this.props.dispatch}
        >
          <div className="piano-roll-scroll-zone"
            onMouseEnter={(e) => this.handleScrollZone(e, true)}
            onMouseLeave={(e) => this.handleScrollZone(e, false)}
            >
            <Scrollbar draggableEndpoints
              min={this.props.barMin} setScroll={(min,max) => this.props.dispatch(pianoRollScrollX(min,max))}
              max={this.props.barMax} forceHover={this.data.scrollZoneHover}
              />
          </div>        
          <PianoRollNotesSlider
            notes={this.props.notes} dispatch={this.props.dispatch}
            barCount={this.props.barCount} barMin={this.props.barMin} keyMin={this.props.keyMin}
            keyCount={this.props.keyCount} barMax={this.props.barMax} keyMax={this.props.keyMax}
            selectionStartX={this.props.selectionStartX} selectionEndX={this.props.selectionEndX}
            selectionStartY={this.props.selectionStartY} selectionEndY={this.props.selectionEndY}
          />
        </PianoRollWindow>
        <PianoRollKeyboard
          keyMin={this.props.keyMin}
          keyMax={this.props.keyMax}
          dispatch={this.props.dispatch}
          />
        <div className="piano-roll-keyboard-overlay" />
      </div>
    );
  }
}

PianoRoll.propTypes = {
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
PianoRoll.defaultProps = {
  cursor:   0.000,
  playHead: 0.000,
  barCount: 64,
  keyCount: 88,
};


function mapStateToProps(state) {
  return {
    notes: state.pianoRoll.notes,
    barMin: state.pianoRoll.barMin,
    barMax: state.pianoRoll.barMax,
    keyMin: state.pianoRoll.keyMin,
    keyMax: state.pianoRoll.keyMax,
    selectionStartX: state.pianoRoll.selectionStartX,
    selectionStartY: state.pianoRoll.selectionStartY,
    selectionEndX: state.pianoRoll.selectionEndX,
    selectionEndY: state.pianoRoll.selectionEndY
  };
}

export default connect(mapStateToProps)(PianoRoll);
