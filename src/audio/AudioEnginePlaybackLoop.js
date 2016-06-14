import _ from 'lodash'

import { transportMovePlayhead } from '../reducers/reduceTransport.js'

import { fireNote,
         killNote } from './AudioEngineMidiTriggers.js'

export const BEATS_PER_BAR = 4 // For 4/4 time signature, it's 4
export const SECONDS_PER_MINUTE = 60

// ============================================================================
// PLAY START
// ============================================================================
// This function initializes a tight setInterval loop. In this loop, the next
// few milliseconds worth of midi commands are scheduled, and the playhead is
// moved.
//
// TODO: Use WebWorkers to trigger each tick of the loop, to avoid playback
//       stutter when tab moves to the background. Example:
//       https://github.com/cwilso/metronome/blob/master/js/metronome.js
export function startPlayback(engine, state, dispatch) {

  console.log('startPlayback()', engine.ctx.currentTime)

  // Keep track of when playback began
  engine.isPlaying = true
  engine.playheadPositionBars = state.transport.playhead
  engine.playStartTime = engine.ctx.currentTime - engine.playheadPositionBars * BEATS_PER_BAR * SECONDS_PER_MINUTE / state.phrase.present.tempo

  // Setup first iteration
  engine.iCommand = 0
  let currentCommand = engine.midiCommands[engine.iCommand]
  let currentCommandTime = barToPlayTime(currentCommand.bar, engine, state)

  // BEGIN!!!
  engine.scheduleLooper = setInterval(() => {

    // Schedule up to the next few milliseconds worth of notes
    while (currentCommandTime <= engine.ctx.currentTime + 0.10) {

      // Empty section at end of song - escape
      if (engine.iCommand >= engine.midiCommands.length)
        break

      fireNote(
        engine,
        currentCommand.trackID,
        currentCommand.keyNum,
        currentCommand.velocity,
        currentCommandTime
      )

      // Iterate to next command
      engine.iCommand++
      if (engine.iCommand >= engine.midiCommands.length)
        break
      currentCommand = engine.midiCommands[engine.iCommand]
      currentCommandTime = barToPlayTime(currentCommand.bar, engine, state)
    }

    // Update playhead
    engine.playheadPositionBars = playTimeToBar(engine.ctx.currentTime, engine, state)
    dispatch(transportMovePlayhead(engine.playheadPositionBars))

  }, 5)

}

// ============================================================================
// PLAY STOP
// ============================================================================
// This function kills all active sounds and cancels the playback setInterval
// loop. It also clears flags that are used to queue up other behaviours where
// necessary
export function stopPlayback(engine) {

  console.log('stopPlayback()', engine.ctx.currentTime)

  // Kill all active sounds
  _.forOwn(engine.trackModules, (track, trackID) => {
    for (let keyNum = 1; keyNum <= 88; keyNum++)
      killNote(engine, trackID, keyNum)
  })

  // Cancel the playback setInterval loop
  if (engine.scheduleLooper) {
    clearInterval(engine.scheduleLooper)
    engine.scheduleLooper = null
  }

  // Reset flags
  engine.stopQueued = false
  engine.isPlaying = false
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function barToPlayTime(bar, engine, state) {
  // Playstart is the moment when the "PLAY" button was pressed.
  // If not provided, default to now.
  let playStartTime = engine.playStartTime || engine.ctx.currentTime

  return bar * BEATS_PER_BAR * SECONDS_PER_MINUTE / state.phrase.present.tempo + playStartTime
}

function playTimeToBar(time, engine, state) {
  // Playstart is the moment when the "PLAY" button was pressed.
  // If not provided, default to now.
  let playStartTime = engine.playStartTime || engine.ctx.currentTime

  return (time - playStartTime) / (BEATS_PER_BAR * SECONDS_PER_MINUTE) * state.phrase.present.tempo
}
