import { namespaceActions } from '../helpers/actionsHelpers.js'

export const auth = namespaceActions(
  'auth',
  [
    'LOGIN_REQUEST',
    'LOGIN_SUCCESS',
    'LOGIN_FAIL',
    'LOGOUT',
    'USER_CONFIRM_FAIL',
    'OAUTH_REQUEST',
    'OAUTH_SUCCESS',
  ]
)

export const samples = namespaceActions(
  'samples',
  [
    'LOADING',
    'LOADED',
  ]
)

export const layout = namespaceActions(
  'layout',
  [
    'CONSOLE_EMBED',
    'CONSOLE_SPLIT',
    'TOGGLE_RACK',
    'SET_INPUT_METHODS_TOUR',
  ]
)

export const transport = namespaceActions(
  'transport',
  [
    'PLAY_TOGGLE',
    'REWIND_PLAYHEAD',
    'MOVE_PLAYHEAD',
    'ADVANCE_PLAYHEAD',
    'STOP',
    'RECORD',
    'COUNT_IN',
    'METRONOME',
  ]
)

export const phrase = namespaceActions(
  'phrase',
  [
    'RENAME',
    'CREATE_TRACK',
    'CHANGE_PHRASE_LENGTH',
    'MUTE_TRACK',
    'SOLO_TRACK',
    'UPDATE_PLUGIN_CONFIG',
    'UPDATE_RACK',
    'SET_TEMPO',
    'CREATE_CLIP',
    'DELETE_CLIP',
    'CONSOLIDATE_CLIP',
    'CREATE_MIDI_EVENT',
    'CREATE_NOTE',
    'SELECT_TRACK',
    'SELECT_CLIP',
    'SELECT_NOTE',
    'SELECT_ALL',
    'DELETE_SELECTION',
    'DELETE_NOTE',
    'DRAG_CLIP_SELECTION',
    'DRAG_NOTE_SELECTION',
    'DROP_CLIP_SELECTION',
    'DROP_NOTE_SELECTION',
    'DRAG_NOTE_VELOCITY',
    'CHANGE_NOTE_VELOCITY',
    'LOAD_START',
    'LOAD_FINISH',
    'SAVE_START',
    'SAVE_FINISH',
    'SAVE_FAIL',
    'NEW_PHRASE',
    'NEW_PHRASE_LOADED',
    'REPHRASE',
    'LOGIN_REMINDER',
    'REPHRASE_REMINDER',
    'PRISTINE',
    'QUANTIZE_SELECTION',
    'UPDATE_PRIVACY_SETTING',
    'NOT_FOUND',
    'ADD_COLLABORATOR',
    'REMOVE_COLLABORATOR',
    'GIVE_MASTER_CONTROL',
  ]
)

export const presence = namespaceActions(
  `presence`,
  [
    'UPDATE_USERS',
    'USER_TYPING',
  ]
)

export const quantizer = namespaceActions(
  `quantizer`,
  [
    'CHANGE_DIVISION',
  ]
)

export const library = namespaceActions(
  `library`,
  [
    'SAVE_NEW',
    'LOAD_ALL',
    'SEARCH',
  ]
)

export const modal = namespaceActions(
  'modal',
  [
    'OPEN',
    'CLOSE',
  ]
)

export const notification = namespaceActions(
  'notification',
  [
    'ADD',
    'DISMISS',
  ]
)

export const mouse = namespaceActions(
  'mouse',
  [
    'UPDATE',
    'TOGGLE_TOOLTIP',
    'DOWN',
  ]
)

export const mixer = namespaceActions(
  'mixer',
  [
    'SCROLL_X',
    'SCROLL_Y',
    'RESIZE_WIDTH',
    'RESIZE_HEIGHT',
    'SELECTION_BOX_START',
    'SELECTION_BOX_RESIZE',
    'MOVE_CURSOR',
    'ENABLE_AUTOSCROLL',
    'DISABLE_AUTOSCROLL',
  ]
)

export const pianoroll = namespaceActions(
  'pianoroll',
  [
    'SCROLL_X',
    'SCROLL_Y',
    'RESIZE_WIDTH',
    'RESIZE_HEIGHT',
    'SELECTION_BOX_START',
    'SELECTION_BOX_RESIZE',
    'SELECTION_BOX_APPLY',
    'SET_FOCUS_WINDOW',
    'MOVE_CURSOR',
    'ENABLE_AUTOSCROLL',
    'DISABLE_AUTOSCROLL',
  ]
)

export const cursor = namespaceActions(
  'cursor',
  [
    'DEFAULT',
    'DRAG',
    'DROP',
    'RESIZE_COLUMN',
    'RESIZE_ROW',
    'RESIZE_X',
    'RESIZE_Y',
    'RESIZE_LEFT',
    'RESIZE_RIGHT',
    'RESIZE_TOP',
    'RESIZE_BOTTOM',
    'RESIZE_LOOP',
    'RESIZE_RIGHT_CLIP',
    'RESIZE_RIGHT_LOOP',
    'RESIZE_RIGHT_CLIPPED',
    'RESIZE_RIGHT_LOOPED',
    'SCISSORS',
    'CLEAR',
    'CHANGE',
  ]
)

export const arrangeTool = namespaceActions(
  'arrangeTool',
  [
    'SELECT',
  ]
)

export const clipboard = namespaceActions(
  'clipboard',
  [
    'COPY',
    'CUT',
    'PASTE',
  ]
)

export const midi = namespaceActions(
  'midi',
  [
    'NOTE_ON',
    'NOTE_OFF',
    'CONNECTION_SYNC',
    'INCREMENT_OCTAVE',
    'DECREMENT_OCTAVE',
    'CONNECTION_UNAVAILABLE',
  ]
)

export const comment = namespaceActions(
  'comment',
  [
    'SELECTION_START',
    'SELECTION_END',
    'SELECTION_CLEAR',
    'SET_FOCUS',
    'CLEAR_FOCUS',
    'REQUEST_EXISTING',
    'RECEIVE_EXISTING',
    'CLEAR_EXISTING',
    'COMMENT_CREATE',
    'COMMENT_RECEIVE',
  ]
)

export const userProfile = namespaceActions(
  'userProfile',
  [
    'REQUEST_USER',
    'RECEIVE_USER',
  ]
)
