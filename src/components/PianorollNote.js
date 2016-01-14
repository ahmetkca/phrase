import React, { Component } from 'react';

export default class PianorollNote extends Component {
  render() {
    let noteStyle = {
      top: this.props.top+'%',
      left: this.props.left+'%',
      width: this.props.width+'%',
      height: this.props.height+'%'
    };
    let keyLetter = {1:'A',2:'A#',3:'B',4:'C',5:'C#',6:'D',7:'D#',8:'E',9:'F',10:'F#',11:'G',0:'G#'}[this.props.keyNum % 12];
    let label = keyLetter + Math.floor((this.props.keyNum+8)/12);

    return (
      <div className="pianoroll-note" style={noteStyle}>
        <div className="pianoroll-note-label">
          {label}
        </div>
      </div>
    );
  }
}

PianorollNote.propTypes = {
  id:       React.PropTypes.number.isRequired,
  keyNum:   React.PropTypes.number.isRequired,
  top:      React.PropTypes.number.isRequired,
  left:     React.PropTypes.number.isRequired,
  width:    React.PropTypes.number.isRequired,
  height:   React.PropTypes.number.isRequired,
  dispatch: React.PropTypes.func.isRequired
};