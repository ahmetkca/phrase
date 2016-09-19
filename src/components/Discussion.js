import React, { Component } from 'react'
import { connect } from 'react-redux'
import TextareaAuto from 'react-textarea-autosize'

import UserBubble from 'components/UserBubble'
import DiscussionTimelineItem from 'components/DiscussionTimelineItem'

import { modalOpen } from 'reducers/reduceModal'
import { addMasterControl, removeMasterControl } from 'reducers/reducePhraseMeta'

export class Discussion extends Component {
  state = {
    fullscreenReply: false,
    formHeight: 90,
    formFocused: false,
    formMobileOpen: false,
    loadingMasterControl: false
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.masterControl[0] !== nextProps.masterControl[0]) {
      this.setState({ loadingMasterControl: false })
    }
  }

  render() {
    if (!this.props.open) {
      return null
    }

    // This override is necessary for mobile web, where position fixed
    // gets nixxed by ancestral elements with overflow scroll.
    let fullscreenOverride = this.state.fullscreenReply
      ? " discussion-fullscreen-override"
      : ""

    // This override adjusts form height based on textarea content
    let discussionFormStyles = { height: this.state.formHeight }
    let discussionFormClasses = `discussion-form ${this.state.formMobileOpen ? '' : 'hidden-xs'}`

    return (
      <div className="workstation-discussion">
        <div className="discussion-presence">
          <div className="discussion-presence-all">
            In this session:
          </div>
          <UserBubble
            type={
              this.props.authorUserId === this.props.userId
                ? `author`
                : this.props.collaborators.find(x => x.userId === this.props.userId)
                  ? `collaborator`
                  : `observer`
            }
            key={`collab-${this.props.userId}`}
            handleClick={
              () => {
                if (
                  this.props.authorUserId === this.props.userId &&
                  !this.props.masterControl.includes(this.props.userId)
                ) {
                  this.props.dispatch(addMasterControl({ targetUserId: this.props.userId }))
                  this.setState({ loadingMasterControl: this.props.userId })
                }
              }
            }
            initials={this.props.currentUsername.substr(0, 2).toUpperCase()}
            loadingMasterControl={this.state.loadingMasterControl === this.props.userId}
            masterControl={this.props.masterControl.includes(this.props.userId)}
            online
          />
          {this.props.collaborators
          .filter(x => x.userId !== this.props.userId)
          .map(x =>
            <UserBubble
              type="collaborator"
              key={`collab-${x.userId}`}
              handleClick={
                () => {
                  if (this.props.authorUserId === this.props.userId) {
                    if (this.props.masterControl.includes(x.userId)) {
                      this.props.dispatch(removeMasterControl())
                    } else {
                      this.props.dispatch(addMasterControl({ targetUserId: x.userId }))
                      this.setState({ loadingMasterControl: x.userId })
                    }
                  }
                }
              }
              initials={x.username.substr(0, 2).toUpperCase()}
              loadingMasterControl={this.state.loadingMasterControl === x.userId}
              masterControl={this.props.masterControl.includes(x.userId)}
              online={
                x.userId === this.props.userId ||
                this.props.users.find(user => user.userId === x.userId)
              }
            />
          )}
          {this.props.users
          .filter(x =>
            !this.props.collaborators.find(c => c.userId === x.userId)
          )
          .map(x =>
            <UserBubble
              type={this.props.authorUserId === x.userId ? `author` : `observer`}
              key={`observer-${x.userId}`}
              initials={x.username.substr(0, 2).toUpperCase()}
              masterControl={this.props.masterControl.includes(x.userId)}
              online
            />
          )}
          <button
            disabled={!this.props.phraseId || (this.props.currentUsername !== this.props.authorUsername)}
            className="btn btn-primary btn-sm discussion-invite"
            onClick={this.openPermissions}
          >
            <span className="fa fa-share" />
            <span> Share</span>
          </button>
        </div>
        <div className="discussion-body" style={{ bottom: this.state.formHeight }}>
          <div
            className={"discussion-timeline-gutter" + fullscreenOverride}
            ref={ref => this.scrollWindow = ref}
          >
            <ul className="discussion-timeline">
              {/* <DiscussionTimelineItem
                tick={ "4.1.1" }
                user={{ initials: "ZZ", username: "zavoshz" }}
                timestamp={"11:32 AM"}
                comment="You've built a nice full-screen mobile webapp, complete with scrollable elements using the -webkit-overflow-scrolling property. Everything is great, however, when you scroll to the top or bottom of your scrollable element, the window exhibits rubber band-like behavior, revealing a gray tweed pattern. Sometimes, your scrollable element doesn't scroll at all, but the window still insists on bouncing around."
                setFullscreenReply={this.setFullscreenReply}
              />
              <DiscussionTimelineItem
                tick={ "5.1.1" }
                user={{ initials: "AK", username: "ProfessorAnson" }}
                timestamp={"12:05 PM"}
                comment="Anson, whoa... built a nice full-screen mobile webapp."
                setFullscreenReply={this.setFullscreenReply}
              />
              <DiscussionTimelineItem
                tick={ "5.1.2" }
                user={{ initials: "ZZ", username: "zavoshz" }}
                timestamp={"1:47 PM"}
                comment="Complete with scrollable elements using the -webkit-overflow-scrolling property. Everything is great, however, when you scroll to the top or bottom of your scrollable element, the window exhibits rubber band-like behavior, revealing a gray tweed pattern. Sometimes, your scrollable element doesn't scroll at all, but the window still insists on bouncing around."
                setFullscreenReply={this.setFullscreenReply}
              />
              <DiscussionTimelineItem
                tick={ "216.3.1" }
                user={{ initials: "AK", username: "ProfessorAnson" }}
                timestamp={"Saturday"}
                comment="Cool."
                setFullscreenReply={this.setFullscreenReply}
              /> */}
            </ul>
          </div>
        </div>
        <button
          className="discussion-form-mobile-trigger btn btn-bright btn-sm visible-xs-inline-block"
          onClick={() => this.setState({ formMobileOpen: true })}
        >
          <span className="fa fa-comment-o fa-flip-horizontal" />
          <span> Leave a comment</span>
        </button>
        <div className={discussionFormClasses} style={discussionFormStyles}>
          <button
            className="close close-dark visible-xs-inline-block"
            onClick={() => this.setState({ formMobileOpen: false })}
          >
            &times;
          </button>
          <TextareaAuto
            className="discussion-form-input form-control form-control-dark"
            placeholder="Leave a comment..." ref={ref => this.textarea = ref}
            onKeyDown={this.keyDownHandler} minRows={2} maxRows={6}
            onHeightChange={this.handleHeightChange}
            onFocus={() => this.setState({ formFocused: true })}
            onBlur={() => this.setState({ formFocused: false })}
          />
          <div className={`form-control form-control-dark discussion-form-attachment ${this.state.formFocused ? 'focused' : ''}`}>
            <span className="fa fa-clock-o" />
            <span> General comment. </span>
            <a>Tag specific timestamp/region</a>
          </div>
          <div className="text-right" style={{ marginTop: 8 }}>
            <button className="btn btn-dark btn-sm visible-xs-inline-block" style={{ marginRight: 5 }}>
              Cancel
            </button>
            <button className="btn btn-bright btn-sm">
              Comment
            </button>
          </div>
        </div>
      </div>
    )
  }

  setFullscreenReply = (booleanStatus) => {
    this.freezeScrollWindow(booleanStatus)

    this.setState({ fullscreenReply: booleanStatus })
  }

  // This is a hack to prevent background scrolling in iOS Safari when position: fixed input gets focused.
  // See: http://stackoverflow.com/a/32389421/476426
  freezeScrollWindow(booleanStatus) {
    // Freeze (record) the scroll position before entering fullscreen
    if (!this.state.fullscreenReply && booleanStatus)
      this.scrollPosition = this.scrollWindow.scrollTop

    // Unfreeze (reset) the scroll position if leaving fullscreen
    if (this.state.fullscreenReply && !booleanStatus)
      this.scrollWindow.scrollTop = this.scrollPosition
  }

  openPermissions = () => {
    this.props.dispatch(modalOpen({ modalComponent: 'PermissionsModal' }))
  }

  handleHeightChange = (height) => {
    this.setState({ formHeight: height + 82 })
  }

  componentDidUpdate(prevProps, prevState) {
    // Focus the textarea if newly opened!
    if (this.state.formMobileOpen && !prevState.formMobileOpen) {
      this.textarea.focus()
    }
  }

}

export default connect(state => ({
  phraseId: state.phraseMeta.phraseId,
  authorUsername: state.phraseMeta.authorUsername,
  authorUserId: state.phraseMeta.userId,
  collaborators: state.phraseMeta.collaborators,
  masterControl: state.phraseMeta.masterControl,
  currentUsername: state.auth.user.username,
  userId: state.auth.user.id,
  users: state.presence.users,
}))(Discussion)
