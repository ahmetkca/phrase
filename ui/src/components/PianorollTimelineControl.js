import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'
import { isModifierOn } from 'helpers/compatibilityHelpers'

import { pianorollScrollX,
         pianorollMoveCursor,
         pianorollSetFocusWindow } from '../reducers/reducePianoroll.js'
import { phraseCreateClip,
         phraseSelectClip,
         phraseSliceClip,
         phraseDragClipSelection,
         phraseDropClipSelection } from '../reducers/reducePhrase.js'
import {
  cursorChange,
  cursorResizeLeft,
  cursorResizeRight,
  cursorResizeRightClip,
  cursorResizeRightLoop,
  cursorResizeRightClipped,
  cursorResizeRightLooped,
  cursorClear,
} from '../actions/actionsCursor.js'
import { phrase } from 'actions/actions'
import { transportMovePlayhead } from 'reducers/reduceTransport'

const SELECT_EMPTY_AREA = 'SELECT_EMPTY_AREA'
const CLICK_EMPTY_AREA  = 'CLICK_EMPTY_AREA'
const SELECT_CLIP       = 'SELECT_CLIP'
const CLICK_CLIP        = 'CLICK_CLIP'
const DRAG_CLIP         = 'DRAG_CLIP'
const DOUBLECLICK_DELAY = 360

export class PianorollTimelineControl extends Component {

  render() {
    return (
      <div className="pianoroll-timeline-control">
        {this.props.children}
      </div>
    )
  }

  constructor() {
    super(...arguments)
    this.lastEvent = null
    this.mouseDownEvent = this.mouseDownEvent.bind(this)
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this)
    this.mouseUpEvent   = this.mouseUpEvent.bind(this)
  }

  componentDidMount() {
    // Setup Grid System
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10
    this.props.grid.didMount()

    // Event Sources
    this.container = ReactDOM.findDOMNode(this)
    this.container.addEventListener('mousedown', this.mouseDownEvent)
    document.addEventListener('mousemove', this.mouseMoveEvent)
    document.addEventListener('mouseup',   this.mouseUpEvent)
  }

  componentWillUnmount() {
    this.container.removeEventListener('mousedown', this.mouseDownEvent)
    document.removeEventListener('mousemove', this.mouseMoveEvent)
    document.removeEventListener('mouseup',   this.mouseUpEvent)
  }

  mouseDownEvent(e) {
    // Ensure clicks from the scrollbars don't interfere
    if (e.target !== this.container)
      return

    switch(e.which) {
      default:
      case 1:
      case 2: this.leftClickEvent(e);  break
      case 3: this.rightClickEvent(e); break
    }
  }

  leftClickEvent(e) {
    let foundClip
    let bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount
    let top = e.clientY - this.container.getBoundingClientRect().top
    if (top >= 25) {
      foundClip = _.findLast(this.props.clips, clip => clip.start <= bar && clip.end > bar)
    }

    if (foundClip && this.props.currentTrack.type !== "AUDIO") {
      this.clipEvent(e, bar, foundClip)
    } else {
      this.emptyAreaEvent(e, bar, top >= 25)
    }
  }

  clipEvent(e, bar, foundClip) {
    // Second Click - Clip
    if (this.lastEvent &&
        this.lastEvent.action === CLICK_CLIP) {
      // Double click - Zoom Focus to this clip!
      if (Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
        this.props.dispatch(pianorollSetFocusWindow(foundClip.id, true))
        this.lastEvent = null
        return
      // Too slow, treat as new first click
      }
      this.lastEvent = null
    }

    // First Click - Start Selection
    if (!this.lastEvent) {
      switch (this.props.arrangeTool) {
        case 'velocity':
        case 'pointer':
          this.lastEvent = {
            action: SELECT_CLIP,
            clipID: foundClip.id,
            bar,
            looped: (foundClip.loopLength !== foundClip.end - foundClip.start),
            time: Date.now()
          }

          let clipLength = foundClip.end - foundClip.start
          let threshold = Math.min(
            8 * this.props.grid.pixelScale/this.props.grid.width*this.props.grid.getBarRange()*this.props.barCount,
            0.25 * clipLength
          )

          if (!foundClip.selected) {
            this.props.dispatch(phraseSelectClip({ clipID: foundClip.id, union: e.shiftKey }))
          }

          // Adjust Start Point
          if (bar < foundClip.start + threshold) {
            this.props.dispatch(cursorResizeLeft('explicit'))
            this.lastEvent.grip = 'MIN'
          // Adjust End Point
          } else if (bar > foundClip.end - threshold) {
            // Already Looped Clip
            if (this.lastEvent.looped) {
              this.props.dispatch(cursorResizeRight('explicit'))
            // Possibly Looped Clip Depending on Cursor Position
            } else {
              let top = e.clientY - this.container.getBoundingClientRect().top
              // Not Looped
              if (top <= 37.5) {
                this.props.dispatch(cursorResizeRightClipped('explicit'))
                this.lastEvent.looped = false
              // Looped
              } else {
                this.props.dispatch(cursorResizeRightLooped('explicit'))
                this.lastEvent.looped = true
              }
            }
            this.lastEvent.grip = 'MAX'
          // Move Entire Clip
          } else {
            this.props.dispatch(cursorClear('explicit'))
            this.lastEvent.grip = 'MID'
          }
          break

        case 'scissors':
          this.props.dispatch(phraseSliceClip({ bar, trackID: foundClip.trackID, foundClip }))
          break

        case 'eraser':
          this.props.dispatch({ type: phrase.DELETE_CLIP, clipID: foundClip.id })
          break

        default:
          return
      }
    }
  }

  emptyAreaEvent(e, bar, isClipRegion) {
    if (isClipRegion) {
      // Second Click - Empty Area
      if (this.lastEvent &&
          this.lastEvent.action === CLICK_EMPTY_AREA) {
        // Double click - Create Clip
        if (Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
          return
        // Too slow, treat as new first click
        }

        this.lastEvent = null
      }

      // First Click
      if (!this.lastEvent) {
        this.lastEvent = {
          action: SELECT_EMPTY_AREA,
          bar,
          time: Date.now()
        }

        switch(this.props.arrangeTool) {
          case 'pencil':
            this.props.dispatch(phraseCreateClip({ trackID: this.props.currentTrack.id, start: bar }))
          default:
            this.props.dispatch(transportMovePlayhead(bar, !isModifierOn(e)))
        }

        return
      }
    } else {
      this.props.dispatch(transportMovePlayhead(bar, !isModifierOn(e)))
    }
  }

  mouseMoveEvent(e) {
    let bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount

    // Drag Selected Clip(s)?
    if (this.lastEvent &&
       (this.lastEvent.action === SELECT_CLIP ||
        this.lastEvent.action === DRAG_CLIP)) {
      // Adjust Clip
      let offsetStart, offsetEnd
      let offsetBar = bar - this.lastEvent.bar
      switch (this.lastEvent.grip) {
        case 'MIN': offsetStart = offsetBar; offsetEnd =         0; break
        case 'MID': offsetStart = offsetBar; offsetEnd = offsetBar; break
        case 'MAX': offsetStart =         0; offsetEnd = offsetBar; break
      }
      this.props.dispatch(phraseDragClipSelection({
        grippedClipID: this.lastEvent.clipID,
        offsetStart,
        offsetEnd,
        offsetLooped: this.lastEvent.looped,
        offsetTrack: 0,
        offsetSnap: !isModifierOn(e),
        offsetCopy: e.altKey,
      }))
      this.lastEvent.action = DRAG_CLIP
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null

    // Cursor on hover over notes
    this.hoverEvent(e, bar)
  }

  hoverEvent(e, bar) {
    let { clips, grid, barCount, arrangeTool, dispatch } = this.props

    if (e.target !== this.container)
      return

    let foundClip = clips.find(clip => clip.start <= bar && clip.end > bar)
    if (foundClip) {
      let clipLength = foundClip.end - foundClip.start
      let threshold = Math.min(
        8 * grid.pixelScale / grid.width * grid.getBarRange() * barCount,
        0.25 * clipLength
      )

      if (arrangeTool !== "pointer") {
        dispatch(cursorChange({ icon: arrangeTool, priority: `implicit` }))
      } else if (bar < foundClip.start + threshold) {
        dispatch(cursorResizeLeft('implicit'))
      } else if (bar > foundClip.end - threshold) {
        if (foundClip.loopLength !== foundClip.end - foundClip.start)
          dispatch(cursorResizeRight('implicit'))
        else {
          let top = e.clientY - this.container.getBoundingClientRect().top
          top <= 37.5
            ? dispatch(cursorResizeRightClip('implicit'))
            : dispatch(cursorResizeRightLoop('implicit'))
        }
      } else {
        dispatch(cursorClear('implicit'))
      }
    // Clear cursor if not hovering over a note (but only for the current canvas)
    } else {
      if (arrangeTool === `pointer`) {
        dispatch(cursorClear('implicit'))
      } else {
        dispatch(cursorChange({ icon: arrangeTool, priority: `implicit` }))
      }
    }
  }

  mouseUpEvent() {
    // First Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action === SELECT_EMPTY_AREA) {
      // Prepare for possibility of second click
      this.props.dispatch(phraseSelectClip({ clipID: null, union: false }))
      this.lastEvent.action = CLICK_EMPTY_AREA
      return
    }

    // First Click - Clip
    if (this.lastEvent &&
        this.lastEvent.action === SELECT_CLIP) {
      // Focus to this clip! Cancel Cursor
      this.props.dispatch(pianorollSetFocusWindow(this.lastEvent.clipID, false))
      this.props.dispatch(cursorClear('explicit'))

      // Prepare for possibility of second click
      this.lastEvent.action = CLICK_CLIP
      return
    }

    // Selected Clip(s) Dragged
    if (this.lastEvent &&
        this.lastEvent.action === DRAG_CLIP) {
      this.props.dispatch(phraseDropClipSelection())
      this.lastEvent = null
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null
  }
}

PianorollTimelineControl.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  currentTrack: React.PropTypes.object,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  barCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  clips:        React.PropTypes.array.isRequired
}

export default
connect(state => ({ arrangeTool: state.arrangeTool.currentTool }))(
  provideGridSystem(
    provideGridScroll(
      PianorollTimelineControl,
      {
        scrollXActionCreator: pianorollScrollX,
        cursorActionCreator: pianorollMoveCursor
      }
    )
  )
)
