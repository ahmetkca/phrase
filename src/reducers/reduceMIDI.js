import u from 'updeep'
import { midi } from 'actions/actions'

import {
  phraseCreateNote,
  phraseCreateClip,
  phraseCreateMidiEvent,
} from 'reducers/reducePhrase.js'

// ============================================================================
// MIDI Action Creators
// ============================================================================
export const midiNoteOff = ({ key, end }) => {
  return midiNoteOn({ key, end })
}

export const midiNoteOn = ({ key, start, end, velocity = 0 }) => {
  return (dispatch, getState) => {
    let state = getState()

    // Record the activity if recording
    if (state.transport.recording) {

      // Completed note - record it!
      if (!velocity) {
        dispatch(phraseCreateNote({
          targetClipID: state.transport.targetClipID,
          key,
          start: state.midi.keys[key].start,
          end,
          velocity: state.midi.keys[key].velocity,
          ignore: true,
          snapStart: false,
        }))
      }

      // Create the target clip if this is first note being recorded
      if (velocity && !Number.isInteger(state.transport.targetClipID)) {
        dispatch(phraseCreateClip({
          trackID: state.phraseMeta.trackSelectionID,
          start: state.transport.playhead,
          snapStart: true,
          ignore: true,
          newRecording: true,
          recordingTargetClipID: state.phrase.present.clipAutoIncrement,
        }))
      }
    }

    velocity
      ? dispatch({ type: midi.NOTE_ON, payload: { key, start, velocity } })
      : dispatch({ type: midi.NOTE_OFF, payload: { key } })
  }
}
export const midiConnectionSync = ({ numPorts, manufacturers }) => ({ type: midi.CONNECTION_SYNC, payload: { numPorts, manufacturers }})
export const midiIncrementOctave = () => ({ type: midi.INCREMENT_OCTAVE })
export const midiDecrementOctave = () => ({ type: midi.DECREMENT_OCTAVE })

export const midiEvent = ({ bar, type, key, velocity }) => {
  return (dispatch, getState) => {
    let state = getState()

    // Record the activity if recording
    if (state.transport.recording) {
      dispatch(phraseCreateMidiEvent({
        trackID: state.phraseMeta.trackSelectionID,
        clipID: state.transport.targetClipID,
        ignore: true,
        bar, type, key, velocity,
      }))
    }
  }
}

// ============================================================================
// MIDI Reducer
// ============================================================================
export const defaultState = {
  keys: Array(128).fill(null),
  numPorts: 0,
  manufacturers: [],
  currentOctave: 4,
}

export default function reduceMIDI(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case midi.NOTE_ON:
      // Do not re-trigger keys that are already active
      if (state.keys[action.payload.key])
        return state

      return u({
        keys: {
          [action.payload.key]: {
            velocity: action.payload.velocity,
            start: action.payload.start,
          },
        },
      }, state)

    // ------------------------------------------------------------------------
    case midi.NOTE_OFF:
      return u({
        keys: {
          [action.payload.key]: null,
        },
      }, state)

    // ------------------------------------------------------------------------
    case midi.CONNECTION_SYNC:
      return u({
        numPorts: action.payload.numPorts,
        manufacturers: action.payload.manufacturers,
      }, state)

    // ------------------------------------------------------------------------
    case midi.INCREMENT_OCTAVE:
      return u({
        currentOctave: Math.min(8, state.currentOctave + 1),
      }, state)

    // ------------------------------------------------------------------------
    case midi.DECREMENT_OCTAVE:
      return u({
        currentOctave: Math.max(1, state.currentOctave - 1),
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
