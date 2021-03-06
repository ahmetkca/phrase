// ============================================================================
// Mixer
// ============================================================================
// This is the top-level Component rendering the entire mixing console.
// It is responsible for composing all the mixer's child components together.

import React, { Component } from 'react'
import { connect } from 'react-redux'

import { mixerScrollX,
         mixerScrollY,
       } from '../reducers/reduceMixer.js'
import { renderedClipsSelector,
         renderedTracksSelector,
         atleastOneTrackSoloedSelector,
       } from '../selectors/selectorMixer.js'

import MixerTimeline from './MixerTimeline.js'
import MixerTracks from './MixerTracks.js'
import MixerWindowDisplay from './MixerWindowDisplay.js'
import MixerWindowControl from './MixerWindowControl.js'
import MixerWindowFocus from './MixerWindowFocus.js'
import TimelinePlayhead from './TimelinePlayhead.js'
import TimelineCursor from './TimelineCursor.js'
import ScrollBar from './Scrollbar.js'

export class Mixer extends Component {

  render() {
    if (this.props.minimized) {
      return null
    }

    let mixerClasses = 'mixer'
        mixerClasses += (this.props.yMin < 0.001) ? ' mixer-disable-shadow-top'    : ''
        mixerClasses += (this.props.yMax > 0.999) ? ' mixer-disable-shadow-bottom' : ''

    let timelineProps = {
      dispatch: this.props.dispatch,
      xMin: this.props.xMin,
      xMax: this.props.xMax,
      barCount: this.props.barCount
    }

    let trackRangeProps = {
      dispatch: this.props.dispatch,
      yMin: this.props.yMin,
      yMax: this.props.yMax,
      tracks: this.props.tracks,
      atleastOneTrackSoloed: this.props.atleastOneTrackSoloed
    }

    let trackFocusProps = {
      tracks: this.props.tracks,
      focusedTrack: this.props.focusedTrack,
      focusBarMin: this.props.focusBarMin,
      focusBarMax: this.props.focusBarMax,
      xMin: this.props.xMin,
      xMax: this.props.xMax,
      yMin: this.props.yMin,
      yMax: this.props.yMax,
    }

    let contentProps = {
      tracks: this.props.tracks,
      clips: this.props.clips
    }

    let playheadProps = {
      ...timelineProps,
      recording: this.props.recording,
      playhead: this.props.playhead,
      scrollXActionCreator: mixerScrollX,
      scrollYActionCreator: mixerScrollY,
    }

    return (
      <div className={mixerClasses} onWheel={this.handleScroll}>
        <div className="mixer-settings" />
        <MixerTimeline {...timelineProps} />
        <MixerTracks {...trackRangeProps} />
        <MixerWindowDisplay {...timelineProps} {...trackRangeProps} {...contentProps} />
        <MixerWindowControl {...timelineProps} {...trackRangeProps} {...contentProps}>
          <div className="mixer-scrollbar-horizontal">
            <ScrollBar draggableEndpoints min={this.props.xMin} max={this.props.xMax} setScroll={this.setHorizontalScroll} />
          </div>
          <div className="mixer-scrollbar-vertical">
            <ScrollBar vertical min={this.props.yMin} max={this.props.yMax} setScroll={this.setVerticalScroll} />
          </div>
        </MixerWindowControl>
        <MixerWindowFocus {...trackFocusProps} />
        <TimelineCursor     cursor={this.props.cursor} />
        <TimelinePlayhead {...playheadProps} />
      </div>
    )
  }

  handleScroll = (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      this.props.dispatch(mixerScrollY({
        delta: e.deltaY
      }))
    }
    e.preventDefault()
  }

  setVerticalScroll = (min, max) => {
    this.props.dispatch(mixerScrollY(min,max))
  }

  setHorizontalScroll = (min, max) => {
    this.props.dispatch(mixerScrollX(min,max))
  }
}

function mapStateToProps(state) {
  return {
    focusedTrack: state.pianoroll.currentTrack,
    focusBarMin: state.pianoroll.xMin,
    focusBarMax: state.pianoroll.xMax,
    tracks: renderedTracksSelector(state),
    atleastOneTrackSoloed: atleastOneTrackSoloedSelector(state),
    clips: renderedClipsSelector(state),
    barCount: state.phrase.present.barCount,
    xMin: state.mixer.xMin,
    xMax: state.mixer.xMax,
    yMin: state.mixer.yMin,
    yMax: state.mixer.yMax,
    playhead: state.transport.playhead,
    recording: state.transport.recording,
    cursor: state.mixer.cursor
  }
}

Mixer.propTypes = {
  minimized: React.PropTypes.bool.isRequired,
  maximize: React.PropTypes.func.isRequired,
}

export default connect(mapStateToProps)(Mixer)
