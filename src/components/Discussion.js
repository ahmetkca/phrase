import React, { Component } from 'react'
import DiscussionUser from 'components/DiscussionUser'
import DiscussionTimelineItem from 'components/DiscussionTimelineItem'

export default class Discussion extends Component {

  constructor() {
    super()
    this.state = {
      fullscreenReply: false,
    }
  }

  render() {
    if (!this.props.open) {
      return null
    }

    // This override is necessary for mobile web, where position fixed
    // gets nixxed by ancestral elements with overflow scroll.
    let fullscreenOverride = this.state.fullscreenReply
      ? { "overflow": "hidden" }
      : {}

    return (
      <div className="workstation-discussion">
        <div className="discussion-presence">
          <div className="discussion-presence-all">
            In this session:
          </div>
          <DiscussionUser>
            PB
          </DiscussionUser>
          <DiscussionUser>
            AK
          </DiscussionUser>
          <DiscussionUser>
            ZZ
          </DiscussionUser>
          <button className="btn btn-primary btn-sm discussion-invite">
            <span className="fa fa-share" />
            <span> Share</span>
          </button>
        </div>
        <div className="discussion-body">
          <div className="discussion-timeline-gutter" style={fullscreenOverride}>
            <ul className="discussion-timeline">
              <DiscussionTimelineItem
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
              />
            </ul>
          </div>
        </div>
      </div>
    )
  }

  setFullscreenReply = (booleanStatus) => {
    this.setState({ fullscreenReply: booleanStatus })
  }

}
