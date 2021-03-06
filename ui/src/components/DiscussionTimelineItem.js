import React, { Component } from 'react'
import { connect } from 'react-redux'
import TextareaAuto from 'react-textarea-autosize'
import Moment from 'moment'

import UserBubble from 'components/UserBubble'
import { barToString } from 'helpers/trackHelpers'
import { userRequestProfileIfNotExisting } from 'reducers/reduceUserProfile'
import {
  commentClearFocus,
  commentSetFocus,
  commentCreate,
} from 'reducers/reduceComment'

export class DiscussionTimelineItem extends Component {
  state = {
    replying: false,
    formValue: "",
  }

  render() {
    let discussionTimelineItemClasses = "discussion-timeline-item"
        discussionTimelineItemClasses += this.props.comment.id ? "" : " discussion-timeline-item-pending"
        discussionTimelineItemClasses += this.props.selected ? " discussion-timeline-item-selected" : ""

    let user = this.props.users[this.props.comment.authorId]
    let username
    if (!user || user.pending)
      username = <span className="fa fa-spinner fa-pulse" />
    else
      username = user.username
    let timestamp = Moment(this.props.comment.dateCreated).calendar().toString()

    return (
      <li className={discussionTimelineItemClasses} onClick={this.handleClick}>
        <div className="discussion-timeline-tick">
          { this.getTick(this.props.comment.start) }
        </div>
        <div className="discussion-timeline-meta">
          <UserBubble userId={this.props.comment.authorId} />
          <span className="user-username">
            { username }
          </span>
        </div>
        <div className="discussion-timeline-content enable-select">
          { this.props.comment.comment.split("\n").map((sentence, i) => {
            return (
              <span key={i}>
                {sentence}
                <br/>
              </span>
            )
          })}
        </div>
        <div className="discussion-timeline-actions">
          <span className="discussion-timeline-timestamp">
            { timestamp }
          </span>
          <span> &middot; </span>
          <a onClick={this.openReply}>
            Reply
          </a>
        </div>
        <div className="discussion-timeline-replies">
          {
            this.props.replies.map(reply => {
              let key = reply.id || reply.tempKey
              let timestamp = Moment(reply.dateCreated).calendar().toString()
              let user = this.props.users[reply.authorId]
              let username
              if (!user || user.pending)
                username = <span className="fa fa-spinner fa-pulse" />
              else
                username = user.username

              return (
                <div className="discussion-timeline-reply" key={key}>
                  <div className="discussion-timeline-meta">
                    <UserBubble userId={reply.authorId} />
                    <span className="user-username">
                      { username }
                    </span>
                  </div>
                  <div className="discussion-timeline-content enable-select">
                    { reply.comment.split("\n").map((sentence, i) => {
                      return (
                        <span key={i}>
                          {sentence}
                          <br/>
                        </span>
                      )
                    })}
                  </div>
                  <div className="discussion-timeline-actions">
                    <span className="discussion-timeline-timestamp">
                      { timestamp }
                    </span>
                    <span> &middot; </span>
                    <a onClick={this.openReply}>
                      Reply
                    </a>
                  </div>
                </div>
              )
            })
          }
          { this.renderReply(user) }
        </div>
      </li>
    )
  }

  renderReply(user) {
    if (this.state.replying) {
      return (
        <div className="discussion-fullscreen">
          <button className="close close-dark visible-xs-inline-block" onClick={this.closeReply}>
            &times;
          </button>
          <div className="discussion-fullscreen-header visible-xs-block visible-xs-block">
            <button
              className="btn btn-primary btn-sm discussion-fullscreen-submit visible-xs-inline-block"
              ref={ref => this.submitButton = ref} onClick={this.submitReply}
            >
              Reply
            </button>
          </div>
          <TextareaAuto
            className="discussion-timeline-reply form-control form-control-dark"
            placeholder="Write a reply..." ref={ref => this.textarea = ref}
            onKeyDown={this.keyDownHandler} maxRows={5}
            onChange={this.handleInputChange}
          />
          <div className="discussion-fullscreen-context visible-xs-block">
            <span className="fa fa-level-up fa-flip-horizontal" />
            <span> in reply to </span>
            <span className="discussion-timeline-username">
              { user.username }
            </span>
            <p style={{ marginTop: 5 }}>
              <span className="fa fa-quote-left" />
              <span> { this.props.comment.comment } </span>
              <span className="fa fa-quote-right" />
            </p>
          </div>
        </div>
      )
    }

    return null
  }

  handleClick = () => {
    if (this.props.selected)
      this.props.dispatch(commentClearFocus())
    else
      this.props.dispatch(commentSetFocus({ commentId: this.props.comment.id }))
  }

  openReply = () => {
    // If already open, focus!
    if (this.textarea) {
      this.textarea.focus()
    }

    // Make sure open
    this.props.setFullscreenReply(true)
    this.setState({ replying: true })
  }

  closeReply = () => {
    this.props.setFullscreenReply(false)
    this.setState({ replying: false })
  }

  keyDownHandler = (e) => {
    // Only submit on regular Enter (SHIFT+Enter reserved for newlines)
    if (e.keyCode === 13 && !e.shiftKey) {
      // On Mobile, force user to tap the submit button
      if (!this.isMobile()) {
        e.preventDefault()
        this.submitReply()
      }
    }
  }

  handleInputChange = (e) => {
    this.setState({ formValue: e.target.value })
  }

  isMobile() {
    let style = window.getComputedStyle(this.submitButton)
    return style.display !== 'none'
  }

  submitReply = () => {
    this.props.dispatch(commentCreate({
      commentText: this.state.formValue,
      parentId: this.props.comment.id,
    }))
    this.closeReply()
  }

  getTick(bar) {
    return bar === null
      ? (<span className="fa fa-globe fa-lg" />)
      : (<span>{ barToString(bar, 0.25) }</span>)
  }

  componentDidUpdate(prevProps, prevState) {
    // Focus the textarea if newly opened!
    if (this.state.replying && !prevState.replying) {
      this.textarea.focus()
    }
  }

  componentWillMount() {
    this.props.dispatch(userRequestProfileIfNotExisting({ userId: this.props.comment.authorId }))
  }

}

export default connect(state => ({ users: state.userProfile.users }))(DiscussionTimelineItem)
