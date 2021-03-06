import u from 'updeep'
import {
  zoomInterval,
  shiftInterval,
  restrictTimelineZoom,
  maxBarWidth,
  zoomInScaling,
  zoomOutScaling
} from 'helpers/intervalHelpers'

import { pianoroll, phrase, transport } from 'actions/actions'
import { currentNotesSelector } from 'selectors/selectorPianoroll'

// ============================================================================
// Pianoroll Action Creators
// ============================================================================
export const pianorollScrollY = ({ min, max, delta, fulcrum }) => ({type: pianoroll.SCROLL_Y, min, max, delta, fulcrum})
export const pianorollScrollX = ({ min, max, delta, fulcrum, isAuto }) => {
  // We need to know the length of the phrase - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let barCount = state.phrase.present.barCount
    dispatch({ type: pianoroll.SCROLL_X, min, max, delta, fulcrum, barCount})
    if (state.pianoroll.autoScroll && state.transport.playing && !isAuto)
      dispatch({ type: pianoroll.DISABLE_AUTOSCROLL })
  }
}
export const pianorollZoomX = (zoomType) => {
  return (dispatch, getState) => {
    let state = getState()
    let min = state.pianoroll.xMin
    let max = state.pianoroll.xMax
    var newMax
    if (zoomType.toUpperCase() === 'IN') {
      newMax = zoomInScaling(min, max)
    } else if (zoomType.toUpperCase() === 'OUT') {
      newMax = zoomOutScaling(min, max)
    }
    dispatch({
      type: pianoroll.SCROLL_X,
      zoomType,
      newMax
    })
  }
}
export const pianorollZoomY = (zoomType) => {
  return (dispatch, getState) => {
    let state = getState()
    let min = state.pianoroll.yMin
    let max = state.pianoroll.yMax
    var newMax
    if (zoomType.toUpperCase() === 'IN') {
      newMax = zoomInScaling(min, max, {normal: 0.05, scaling: 0.025}, 0.5, 0.2)
    } else if (zoomType.toUpperCase() === 'OUT') {
      newMax = zoomOutScaling(min, max)
    }
    dispatch({
      type: pianoroll.SCROLL_Y,
      zoomType,
      newMax
    })
  }
}

export const pianorollResizeWidth         = (width)           => ({type: pianoroll.RESIZE_WIDTH,  width })
export const pianorollResizeHeight        = (height)          => ({type: pianoroll.RESIZE_HEIGHT, height })
export const pianorollSelectionBoxStart   = (x, y)            => ({type: pianoroll.SELECTION_BOX_START,  x, y})
export const pianorollSelectionBoxResize  = (x, y)            => ({type: pianoroll.SELECTION_BOX_RESIZE, x, y})
export const pianorollSelectionBoxApply = (union) => {
  // We need to know the selection box - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    dispatch({
      type: pianoroll.SELECTION_BOX_APPLY,
      renderedNotes: currentNotesSelector(state),
      currentTrackID: state.pianoroll.currentTrack,
      selectionStartX: state.pianoroll.selectionStartX,
      selectionStartY: state.pianoroll.selectionStartY,
      selectionEndX: state.pianoroll.selectionEndX,
      selectionEndY: state.pianoroll.selectionEndY,
      union,
    })
  }
}
export const pianorollMoveCursor = (percent) => ({type: pianoroll.MOVE_CURSOR, percent})
export const pianorollSetFocusWindow  = (clipID, tight) => {
  // We need to know the selection offsets - use a thunk to access other state branches
  return (dispatch, getState) => {
    let state = getState()
    let barCount = state.phrase.present.barCount
    let foundClip = state.phrase.present.clips.find(clip => clip.id === clipID)
    dispatch({type: pianoroll.SET_FOCUS_WINDOW, foundClip, barCount, tight})
  }
}


// ============================================================================
// Pianoroll Reducer
// ============================================================================
export const defaultState = {
  currentTrack: 0,
  width: 1000,
  height: 500,
  xMin: 0.000,
  xMax: 1.000,
  yMin: 0.350,
  yMax: 0.650,
  selectionStartX: null,
  selectionStartY: null,
  selectionEndX: null,
  selectionEndY: null,
  cursor: null,
  tooltip: null,
  autoScroll: true,
}

export default function reducePianoroll(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    // Used to ensure the timeline doesn't zoom too close
    // (looks awkward when a single quarter note takes the entire screen)
    case pianoroll.RESIZE_WIDTH:
      state = u({
        width: action.width
      }, state)
      return restrictTimelineZoom(state, action.barCount)

    // ------------------------------------------------------------------------
    // Track absolute height to ensure the keyboard doesn't get too small or large
    case pianoroll.RESIZE_HEIGHT:
      return restrictKeyboardZoom(
        u({
          height: action.height
        }, state)
      )

    // ------------------------------------------------------------------------
    case pianoroll.SCROLL_X:
      // Zoom X
      if (action.fulcrum !== undefined) {
        let zoomFactor = (action.delta + 500) / 500
        let [newMin, newMax] = zoomInterval([state.xMin, state.xMax], zoomFactor, action.fulcrum)
        let oldBarWidth = state.width / (state.xMax - state.xMin) / action.barCount

        // Already at limit - bypass
        if (zoomFactor < 1 && oldBarWidth > maxBarWidth - 0.0001)
          return state

        state = u({
          xMin: Math.max(0.0, newMin),
          xMax: Math.min(1.0, newMax),
        }, state)
        return restrictTimelineZoom(state, action.barCount)
      }

      // Zooming with Hoykeys
      if (action.zoomType !== undefined) {
        return state = u({
          xMax: action.newMax === undefined
            ? state.xMax
            : Math.min(1.0, action.newMax)
        }, state)
      }

      // Regular Scroll X
      if (action.delta !== undefined) {
        let barWindow = state.xMax - state.xMin
        let barStepSize = action.delta / state.width * barWindow
        let [newBarMin, newBarMax] = shiftInterval([state.xMin, state.xMax], barStepSize)
        state = u({
          xMin: Math.max(0.0, newBarMin),
          xMax: Math.min(1.0, newBarMax),
        }, state)
      } else {
        state = u({
          xMin: action.min === undefined ? state.xMin : Math.max(0.0, action.min),
          xMax: action.max === undefined ? state.xMax : Math.min(1.0, action.max)
        }, state)
      }

      return restrictTimelineZoom(state, action.barCount)

    // ------------------------------------------------------------------------
    case pianoroll.SCROLL_Y:
      // Zoom Y
      if (action.fulcrum !== undefined) {
        let zoomFactor = (action.delta + 500) / 500
        let [newMin, newMax] = zoomInterval([state.yMin, state.yMax], zoomFactor, action.fulcrum)
        let oldKeyboardHeight = state.height / (state.yMax - state.yMin)

        // Already at limit - bypass
        if (zoomFactor < 1 && oldKeyboardHeight > maxKeyboardHeight - 0.0001)
          return state
        if (zoomFactor > 1 && oldKeyboardHeight < minKeyboardHeight + 0.0001)
          return state

        return u({
          yMin: newMin,
          yMax: newMax,
        }, state)
      }

      // Zooming with Hoykeys
      if (action.zoomType !== undefined) {
        // debugger
        state = u({
          yMax: action.newMax === undefined
            ? state.yMax
            : Math.min(1.0, action.newMax)
        }, state)
        return restrictKeyboardZoom(state, true)
      }

      // Regular Scroll Y
      if (action.delta !== undefined) {
        let keyWindow = state.yMax - state.yMin
        let keyStepSize = action.delta / state.height * keyWindow
        let [newKeyMin, newKeyMax] = shiftInterval([state.yMin, state.yMax], keyStepSize)
        state = u({
          yMin: Math.max(0.0, newKeyMin),
          yMax: Math.min(1.0, newKeyMax),
        }, state)
      } else {
        state = u({
          yMin: action.min === null ? state.yMin : Math.max(0.0, action.min),
          yMax: action.max === null ? state.yMax : Math.min(1.0, action.max)
        }, state)
      }
      return restrictKeyboardZoom(state)

    // ------------------------------------------------------------------------
    case pianoroll.SELECTION_BOX_START:
      return u({
        selectionStartX: action.x,
        selectionStartY: action.y,
        selectionEndX: action.x,
        selectionEndY: action.y
      }, state)

    // ------------------------------------------------------------------------
    case pianoroll.SELECTION_BOX_RESIZE:
      return u({
        selectionEndX: action.x,
        selectionEndY: action.y
      }, state)

    // ------------------------------------------------------------------------
    // Select a Phrase's Notes via the Pianoroll
    case pianoroll.SELECTION_BOX_APPLY:
      return u({
        selectionStartX: null,
        selectionStartY: null,
        selectionEndX: null,
        selectionEndY: null
      }, state)

    // ------------------------------------------------------------------------
    case pianoroll.MOVE_CURSOR:
      return u({
        cursor: action.percent
      }, state)

    // ------------------------------------------------------------------------
    // Set the Pianoroll's focus window
    case pianoroll.SET_FOCUS_WINDOW:
      // Figure out the measurements
      let clipLength = action.foundClip.end - action.foundClip.start
      let windowBarLength = (state.xMax - state.xMin) * action.barCount
      let spacing = Math.min(0.5, Math.max(0.125*windowBarLength, 0.125))
      let targetBarMin, targetBarMax

      // Specially commanded to zoom tight to the clip
      if (action.tight) {
        targetBarMin = Math.max(action.foundClip.start - spacing, 0) / action.barCount
        targetBarMax = Math.min(action.foundClip.end   + spacing, action.barCount) / action.barCount
      }

      // Loose focus shift - let's figure out the best place to shift the window to
      else {
        let shiftAmount = 0         // Don't shift if not necessary, by default
        let shiftAmountMax = action.foundClip.end   + spacing - state.xMax * action.barCount // Does the target clip end beyond the ending of the window?
        let shiftAmountMin = action.foundClip.start - spacing - state.xMin * action.barCount // Does the target clip start before the beginning of the window?
        // If newly focused clip DOES NOT fit in the window, focus to the beginning of it
        if (spacing + clipLength + spacing > windowBarLength)
          shiftAmount = shiftAmountMin
        // If newly focused clip is able to fit in the window, we might need to shift to one end
        else {
               if (shiftAmountMax > 0) { shiftAmount = shiftAmountMax }
          else if (shiftAmountMin < 0) { shiftAmount = shiftAmountMin }
        }
        [targetBarMin, targetBarMax] = shiftInterval([state.xMin, state.xMax], shiftAmount/action.barCount)
      }

      // Make the change!
      return u({
        currentTrack: action.foundClip.trackID,
        xMin: targetBarMin,
        xMax: targetBarMax,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.SELECT_TRACK:
      return u({
        currentTrack: action.payload.trackID,
      }, state)

    // ------------------------------------------------------------------------
    case phrase.DELETE_SELECTION:
      // Watch for current track deletion!
      /*
      // Temporarily disable until we launch multitrack again (TODO)
      let { selectionType, trackSelectionID } = action.payload
      if (selectionType === "tracks" && trackSelectionID === state.currentTrack) {
        return u({
          currentTrack: null
        }, state)
      }
      */
      return state

    // ------------------------------------------------------------------------
    case phrase.NEW_PHRASE:
    case phrase.LOAD_START:
      return defaultState

    // ------------------------------------------------------------------------
    case pianoroll.DISABLE_AUTOSCROLL:
      return u({ autoScroll: false }, state)

    // ------------------------------------------------------------------------
    case transport.PLAY_TOGGLE:
    case pianoroll.ENABLE_AUTOSCROLL:
      return u({ autoScroll: true }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}

// Restrict min/max zoom against the pianoroll's height (ensure keyboard doesn't get too small or large)
const minKeyboardHeight =  400
const maxKeyboardHeight = 1275 + 300
function restrictKeyboardZoom(state, maxOnly) {
  let yMin = state.yMin
  let yMax = state.yMax
  let keyboardHeight = state.height / (state.yMax - state.yMin)
  if (keyboardHeight <= 0 || isNaN(keyboardHeight)) return state // Do nothing if keyboard is not shown
  if (keyboardHeight < minKeyboardHeight) [yMin, yMax] = zoomInterval([state.yMin, state.yMax], keyboardHeight/minKeyboardHeight)
  if (keyboardHeight > maxKeyboardHeight) [yMin, yMax] = zoomInterval([state.yMin, state.yMax], keyboardHeight/maxKeyboardHeight)
  // Prevent scroll from shifting when using hotkey zoom
  if (maxOnly) {
    return u({
      yMax
    }, state)
  } else {
    return u({
      yMin,
      yMax
    }, state)
  }
}
