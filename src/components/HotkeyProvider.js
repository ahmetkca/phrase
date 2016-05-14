import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ActionCreators as UndoActions } from 'redux-undo'

import { transportPlayToggle,
       } from '../reducers/reduceTransport'
import { phraseDeleteSelection } from '../reducers/reducePhrase'

// ============================================================================
// Hotkey Provider
// ============================================================================
// Special provider component which you should wrap your entire app with.
// Provides global hotkey handling (keyboard shortcuts)
//
// Unsure of whether or not this will conflict with forms...
class HotkeyProvider extends Component {

  render() {
    return this.props.children
  }

  constructor() {
    super()
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = (e) => {
    // -----------------------------------------------------------------------
    // Bypass - Prevent doublebooking events with form <inputs>
    if (e.target.tagName === 'INPUT')
      return
    if (e.target.tagName === 'SELECT')
      return
    if (e.target.tagName === 'TEXTAREA')
      return
    if (e.target.tagName === 'A')
      return
    if (e.target.tagName === 'BUTTON')
      return

      // -----------------------------------------------------------------------
    // Overrides
    let { dispatch } = this.props
    switch(e.keyCode) {
      case 70:  // CTRL/CMD+F - Search
        if (e.metaKey || e.ctrlKey) {
          this.context.router.push('/search')
          e.preventDefault()
        }
        break
      case 90:  // CTRL/CMD+Z - Undo last action
        if (e.metaKey && e.shiftKey) {
          dispatch(UndoActions.redo())
          e.preventDefault()
        } else if (e.metaKey) {
          dispatch(UndoActions.undo())
          e.preventDefault()
        }
        break
      case 89:  // CTRL/CMD+Y - Redo last action
        if (e.metaKey) {
          dispatch(UndoActions.redo())
          e.preventDefault()
        }
        break
      case 32:  // Space - Toggle Playback
        dispatch(transportPlayToggle())
        e.preventDefault()
        break
      case 8:   // Backspace - Delete Selection
      case 46:  // Delete
        dispatch(phraseDeleteSelection())
        e.preventDefault()
        break
    }
  }
}

HotkeyProvider.contextTypes = {
  router: React.PropTypes.object.isRequired
}

HotkeyProvider.propTypes = {
  dispatch: React.PropTypes.func.isRequired
}

export default connect()(HotkeyProvider)
