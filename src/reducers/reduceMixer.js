import u from 'updeep'
import { restrictTimelineZoom } from '../helpers/intervalHelpers.js'
import { mixer } from '../actions/actions.js'

// ============================================================================
// Mixer Action Creators
// ============================================================================
export const mixerScrollY = (min, max) => ({type: mixer.SCROLL_Y, min, max})
export const mixerScrollX = (min, max) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let barCount = state.phrase.present.barCount
    dispatch({ type: mixer.SCROLL_X, min, max, barCount })
  }
}
export const mixerResizeHeight = (height) => ({type: mixer.RESIZE_HEIGHT, height})
export const mixerResizeWidth = (width) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let barCount = state.phrase.present.barCount
    dispatch({ type: mixer.RESIZE_WIDTH, width, barCount })
  }
}
export const mixerSelectionStart = (x, y) => ({type: mixer.SELECTION_BOX_START,  x, y})
export const mixerSelectionEnd   = (x, y) => ({type: mixer.SELECTION_BOX_RESIZE, x, y})
export const mixerMoveCursor  = (percent) => ({type: mixer.MOVE_CURSOR, percent})


// ============================================================================
// Mixer Reducer
// ============================================================================
let defaultState = {
  width: 1000,
  height: 500,
  xMin: 0.000,
  xMax: 0.500,
  yMin: 0.000,
  yMax: 0.0625,
  selectionStartX: null,
  selectionStartY: null,
  selectionEndX: null,
  selectionEndY: null,
  cursor: null
}

export default function reduceMixer(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case mixer.RESIZE_WIDTH:
      state = u({
        width: action.width
      }, state)
      return restrictTimelineZoom(state, action.barCount)

    // ------------------------------------------------------------------------
    // Track absolute height to control vertical scrollbar overflow
    case mixer.RESIZE_HEIGHT:
      return Object.assign({}, state, {
        height: action.height
      })

    // ------------------------------------------------------------------------
    case mixer.SCROLL_X:
      state = u({
        xMin: action.min === null ? state.xMin : Math.max(0.0, action.min),
        xMax: action.max === null ? state.xMax : Math.min(1.0, action.max)
      }, state)
      return restrictTimelineZoom(state, action.barCount)

    // ------------------------------------------------------------------------
    case mixer.SCROLL_Y:
      return u({
        yMin: action.min === null ? state.yMin : Math.max(0.0, action.min),
        yMax: action.max === null ? state.yMax : Math.min(1.0, action.max)
      }, state)

    // ------------------------------------------------------------------------
    case mixer.SELECTION_BOX_START:
      return Object.assign({}, state, {
        selectionStartX: action.x,
        selectionStartY: action.y,
        selectionEndX: action.x,
        selectionEndY: action.y
      })

    // ------------------------------------------------------------------------
    case mixer.SELECTION_BOX_RESIZE:
      return Object.assign({}, state, {
        selectionEndX: action.x,
        selectionEndY: action.y
      })

    // ------------------------------------------------------------------------
    case mixer.MOVE_CURSOR:
      return Object.assign({}, state, {
        cursor: action.percent
      })

    // ------------------------------------------------------------------------
    default:
      return state

  }
}
