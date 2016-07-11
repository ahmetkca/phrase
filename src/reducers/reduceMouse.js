import { mouse } from 'actions/actions'

let initialState = {
  x: 0, y: 0,
  tooltip: null,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case mouse.UPDATE:
      return {
        ...state,
        x: action.payload.clientX,
        y: action.payload.clientY,
      }

    case mouse.TOGGLE_TOOLTIP:
      return {
        ...state,
        tooltip: action.payload
      }

    default:
      return state
  }
}
