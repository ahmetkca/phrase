import { presence, phrase } from 'actions/actions'

let initialState = {
  users: [],
  usersTyping: [],
}

export default (state = initialState, action) => {
  switch (action.type) {
    case presence.UPDATE_USERS:
      return {
        ...state,
        users: action.payload.users.filter(x => x.userId !== localStorage.userId)
      }

    case presence.USER_TYPING:
      return {
        ...state,
        usersTyping: action.payload.usersTyping.slice()
      }

    case phrase.NEW_PHRASE:
      return initialState

    default:
      return state
  }
}
