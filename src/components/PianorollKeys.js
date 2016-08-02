import React, { Component } from 'react'
import { connect } from 'react-redux'

import PianorollKeyboardKey from './PianorollKeyboardKey.js'
import diffProps from 'helpers/diffProps'

export class PianorollKeys extends Component {

  render() {
    let octave = 8
    let octaves = []
    let keys = []
    for (let key = 96; key > 8; key--) {
      // Specific sequence of black and white keys
      let keyClass = 'pianoroll-key'
          keyClass += (key % 12 in { 10: true, 8: true, 6: true, 3: true, 1: true }) ? ' black' : ' white'
          keyClass += (key % 12 in { 10: true,  3: true }) ? ' higher' : ''
          keyClass += (key % 12 in { 6: true, 1: true }) ? ' lower' : ''
          keyClass += (key % 12 in { 2: true }) ? ' thinner' : ''
          keyClass += this.props.midiKeys[key] ? ' active' : ''
      let keyLabel =  {9:'A', 7:'G', 5:'F', 4:'E', 2:'D', 0:'C', 11:'B'}[ key%12 ]
          keyLabel = keyLabel ? (keyLabel + octave) : null

      keys.push(
        <PianorollKeyboardKey
          currentTrack={this.props.currentTrack}
          key={key}
          keyNum={key}
          keyClass={keyClass}
          keyLabel={keyLabel}
          dispatch={this.props.dispatch}
        />
      )

      // Next keys into octave Group
      if (key % 12 === 0 || key === 9) {
        // Add Octave Label for full octaves
        let label = 'C' + octave
        keys.unshift(<div className="pianoroll-octave-label" key={label}><div>{label}</div></div>)
        octaves.push(<div className="pianoroll-octave" key={octave}>{keys}</div>)
        keys = []
        octave--
      }
    }
    return (
      <div className="pianoroll-keys-wrapper">
        { octaves }
      </div>
    )
  }

  shouldComponentUpdate(nextProps) {
    return diffProps(nextProps, this.props, [
      'currentTrack',
      'midiKeys',
    ])
  }

}

export default connect(state => ({ midiKeys: state.midi }))(PianorollKeys)
