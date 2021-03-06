import { cursor } from './actions'

export const cursorDefault              = (priority = 'explicit') => ({ type: cursor.DEFAULT,               priority })
export const cursorDrag                 = (priority = 'explicit') => ({ type: cursor.DRAG,                  priority })
export const cursorDrop                 = (priority = 'explicit') => ({ type: cursor.DROP,                  priority })
export const cursorResizeColumn         = (priority = 'explicit') => ({ type: cursor.RESIZE_COLUMN,         priority })
export const cursorResizeRow            = (priority = 'explicit') => ({ type: cursor.RESIZE_ROW,            priority })
export const cursorResizeX              = (priority = 'explicit') => ({ type: cursor.RESIZE_X,              priority })
export const cursorResizeY              = (priority = 'explicit') => ({ type: cursor.RESIZE_Y,              priority })
export const cursorResizeLeft           = (priority = 'explicit') => ({ type: cursor.RESIZE_LEFT,           priority })
export const cursorResizeRight          = (priority = 'explicit') => ({ type: cursor.RESIZE_RIGHT,          priority })
export const cursorResizeTop            = (priority = 'explicit') => ({ type: cursor.RESIZE_TOP,            priority })
export const cursorResizeBottom         = (priority = 'explicit') => ({ type: cursor.RESIZE_BOTTOM,         priority })
export const cursorResizeLoop           = (priority = 'explicit') => ({ type: cursor.RESIZE_CLIP,           priority })
export const cursorResizeRightClip      = (priority = 'explicit') => ({ type: cursor.RESIZE_RIGHT_CLIP,     priority })
export const cursorResizeRightLoop      = (priority = 'explicit') => ({ type: cursor.RESIZE_RIGHT_LOOP,     priority })
export const cursorResizeRightClipped   = (priority = 'explicit') => ({ type: cursor.RESIZE_RIGHT_CLIPPED,  priority })
export const cursorResizeRightLooped    = (priority = 'explicit') => ({ type: cursor.RESIZE_RIGHT_LOOPED,   priority })
export const cursorScissors             = (priority = 'explicit') => ({ type: cursor.SCISSORS,              priority })
export const cursorClear                = (priority = 'explicit') => ({ type: cursor.CLEAR,                 priority })

export const cursorChange = ({ icon, priority = `explicit` }) => ({
  type: cursor.CHANGE,
  payload: { icon },
  priority,
})
