import {
  updateNodes,
  createMetronome,
  getTrackOutputDecibels
} from './AudioEngineNodes'
import {
  fireNote,
  killNote,
  sendMidiEvent,
  updateAudioCommands,
  updateMidiCommands,
  loadSample,
} from './AudioEngineMidiTriggers'
import {
  startPlayback,
  stopPlayback,
} from './AudioEnginePlaybackLoop'
import initializeMIDIControllers from './AudioEngineMidiControl'

let AudioContext = window.AudioContext || window.webkitAudioContext || false

// ============================================================================
// ENGINE CREATION
// ============================================================================
// This is the universal glue of the application. In this engine, each track
// is given a `trackModule` with a `gain`, a `pan`, `mute`/`solo` functionality,
// an `effectsChain`, and is routed into a `masterGain`.
export default function initializeAudioEngine(ENGINE, STORE) {

  // --------------------------------------------------------------------------
  // Initialize Internals
  // --------------------------------------------------------------------------
  // This is a private mutable object. It is passed around to other functions
  // inside this AudioEngine, which mutate it as a way to communicate
  // changes in real-time to other functions that also access it.
  //
  // Despite the strict use of immutables and pure functional strategies in
  // the Redux store and elsewhere in this app, we stick to mutable techniques
  // here as it is easy to grok. Perhaps worth investigating further in the
  // future if immutable techniques are helpful. TODO
  let engine = {
    STORE,
    ctx: new AudioContext(),
    masterGain: null,
    trackModules: {},
    midiCommands: [],
    midiAccess: false,
    iCommand: null,
    isPlaying: false,
    playStartTime: null,
    playheadPositionBars: null,
    stopQueued: false,
    bufferMap: {},
    unsubscribeStoreChanges: null,
    lastState: {
      tracks: null,
      phrase: STORE.getState().phrase,
    }
  }
  engine.masterGain = engine.ctx.createGain()
  engine.masterGain.connect(engine.ctx.destination)
  engine.masterGain.gain.value = 0.25

  // --------------------------------------------------------------------------
  // State-driven behaviours
  // --------------------------------------------------------------------------
  engine.unsubscribeStoreChanges = STORE.subscribe(() => {
    let state = STORE.getState()

    // ---------- Graph Updates ----------
    // Tracks and Effects Chains
    if (state.phrase.present.tracks !== engine.lastState.tracks)
      updateNodes(engine, STORE)

    // Notes + Tempo
    if (state.phrase !== engine.lastState.phrase) {
      updateMidiCommands(engine, state)
      updateAudioCommands(engine, STORE)
    }

    // Keep track of last state to avoid duplicated updates
    engine.lastState = state

    // ---------- Realtime Behaviours ----------
    // PLAY Playback state
    if (state.transport.playing && !engine.isPlaying) {
      startPlayback(engine, STORE.dispatch)
    }
    // STOP Playback state
    else if (!state.transport.playing && engine.isPlaying) {
      stopPlayback(engine, state)
    }

    // RECORD start during existing playback
    if (state.transport.recording && !engine.isRecording) {
      engine.isRecording = true
      engine.metronomeNextTick = Math.ceil(state.transport.playhead * 4) * 0.25
    }
    // RECORD end while playback continues
    else if (!state.transport.recording && engine.isRecording) {
      engine.isRecording = false
      engine.metronomeNextTick = null
      engine.metronomeTickCount = 0
    }
  })

  // --------------------------------------------------------------------------
  // MIDI Controller driven behaviour
  // --------------------------------------------------------------------------
  initializeMIDIControllers(engine, STORE)

  // --------------------------------------------------------------------------
  // Metronome
  // --------------------------------------------------------------------------
  createMetronome(engine)

  // --------------------------------------------------------------------------
  // Expose the API
  // --------------------------------------------------------------------------
  ENGINE.fireNote = ({ trackID, keyNum, velocity, disableRecording }) => {
    fireNote({ engine, trackID, keyNum, velocity, disableRecording })
  }
  ENGINE.killNote = ({ trackID, keyNum, disableRecording }) => {
    killNote({ engine, trackID, keyNum, disableRecording })
  }
  ENGINE.sendMidiEvent = ({ trackID, key, type, velocity, disableRecording }) => {
    sendMidiEvent({ engine, trackID, key, type, velocity, disableRecording })
  }
  ENGINE.getTrackOutputDecibels = (trackID) => {
    return getTrackOutputDecibels(engine, trackID)
  }
  ENGINE.loadSample = async (url) => {
    return await loadSample(engine, url)
  }
  ENGINE.destroy = () => {
    engine.unsubscribeStoreChanges()
    engine.ctx.close()
  }
}
