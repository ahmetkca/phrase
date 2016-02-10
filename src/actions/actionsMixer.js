import { mixer } from './actions.js'

export const mixerScrollX                 = (min, max)        => ({type: mixer.SCROLL_X, min, max})
export const mixerScrollY                 = (min, max)        => ({type: mixer.SCROLL_Y, min, max})
export const mixerResizeWidth             = (width)           => ({type: mixer.RESIZE_WIDTH,  width })
export const mixerResizeHeight            = (height)          => ({type: mixer.RESIZE_HEIGHT, height})
export const mixerSelectionStart          = (x, y)            => ({type: mixer.SELECTION_BOX_START,  x, y})
export const mixerSelectionEnd            = (x, y)            => ({type: mixer.SELECTION_BOX_RESIZE, x, y})
export const mixerMoveCursor              = (percent)         => ({type: mixer.MOVE_CURSOR, percent})