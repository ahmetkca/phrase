import u from 'updeep'
import { comment } from 'actions/actions'
import {
  uAppend,
  uReplace,
} from 'helpers/arrayHelpers'
import { api } from 'helpers/ajaxHelpers'
import { catchAndToastException } from 'reducers/reduceNotification'

// ============================================================================
// Comment Action Creators
// ============================================================================
export const commentSelectionStart = ({ start, trackID }) => ({ type: comment.SELECTION_START, payload: { start, trackID } })
export const commentSelectionEnd = ({ end }) => ({ type: comment.SELECTION_END, payload: { end } })
export const commentSelectionClear = () => ({ type: comment.SELECTION_CLEAR })
export const commentLoadAll = ({ phraseId }) => {
  return (dispatch) => {
    dispatch({ type: comment.REQUEST_EXISTING })

    catchAndToastException({ dispatch, toCatch: async () => {
      let result = await api({ endpoint: `commentExisting`, body: { phraseId } })
      dispatch({ type: comment.RECEIVE_EXISTING, payload: result.comments })
    }})
  }
}
export const commentCreate = (commentText) => {
  if (!commentText)
    return { type: "DUMMY ACTION" }

  return (dispatch, getState) => {
    let {
      comment: {
        commentRangeStart: start,
        commentRangeEnd: end,
      },
      phraseMeta: {
        phraseId,
        trackSelectionID: trackId,
      },
      auth: {
        user: {
          id: authorId
        }
      }
    } = getState()

    let payload = {
      comment: commentText,
      trackId,
      start,
      end,
      phraseId,
      authorId,
      tempKey: `${authorId}-${+new Date()}`,
    }

    catchAndToastException({ dispatch, toCatch: () => {
      dispatch({ type: comment.COMMENT_CREATE, payload })
      api({ endpoint: `commentNew`, body: payload })
    }})
  }
}
export const commentReceive = (commentState) => ({ type: comment.COMMENT_RECEIVE, payload: commentState })

// ============================================================================
// Comment Selection
// ============================================================================
export const defaultState = {
  commentId: null,
  commentTrackID: null,
  commentRangeStart: null,
  commentRangeEnd: null,
  comments: [],
}

export default function reduceComment(state = defaultState, action) {
  switch (action.type)
  {
    // ------------------------------------------------------------------------
    case comment.SELECTION_START:
      return u({
        commentRangeStart: 0.25*Math.round(4*action.payload.start),
        commentRangeEnd: null,
      }, state)

    // ------------------------------------------------------------------------
    case comment.SELECTION_END:
      return u({
        commentRangeEnd: 0.25*Math.round(4*action.payload.end),
      }, state)

    // ------------------------------------------------------------------------
    case comment.SELECTION_CLEAR:
      return u({
        comments: state.comments,
      }, defaultState)

    // ------------------------------------------------------------------------
    case comment.REQUEST_EXISTING:
      return u({
        comments: null,
      }, state)

    // ------------------------------------------------------------------------
    case comment.RECEIVE_EXISTING:
      return u({
        comments: action.payload,
      }, state)

    // ------------------------------------------------------------------------
    case comment.COMMENT_CREATE:
      return u({
        commentId: action.payload.tempKey,
        comments: uAppend(action.payload, (a, b) => a.start > b.start)
      }, state)

    // ------------------------------------------------------------------------
    case comment.COMMENT_RECEIVE:
      let existingComment = state.comments.find(comment => {
        return comment.tempKey === action.payload.tempKey
      })

      // If we just submitted this comment, replace the temporary one
      if (existingComment) {
        return u({
          comments: uReplace(existingComment, action.payload)
        }, state)
      }

      // New comment from someone else, append
      return u({
        comments: uAppend(action.payload, (a, b) => a.start > b.start)
      }, state)

    // ------------------------------------------------------------------------
    default:
      return state
  }
}
