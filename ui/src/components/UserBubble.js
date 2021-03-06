import React, { Component } from 'react'
import { connect } from 'react-redux'

import { userRequestProfileIfNotExisting } from 'reducers/reduceUserProfile'
import isEmail from 'helpers/isEmail'

export class UserBubble extends Component {
  componentWillMount() {
    if (!isEmail(this.props.userId))
      this.props.dispatch(userRequestProfileIfNotExisting({ userId: this.props.userId }))
  }

  render() {
    let bubble

    if (isEmail(this.props.userId)) {
      bubble = this.props.userId.substr(0,2).toUpperCase()
    } else {
      let user = this.props.users[this.props.userId]
      if (!user || user.pending)
        bubble = <span className="fa fa-spinner fa-pulse" />
      else if (user.picture)
        bubble = <img src={user.picture} />
      else
        bubble = user.username.substr(0,2).toUpperCase()
    }

    return (
      <div
        className={`user-bubble ${this.props.type || ''}`}
        onClick={this.props.handleClick}
      >
        { this.props.loadingMasterControl &&
          <i className="master-control-loading fa fa-spinner fa-spin" />}
        { this.props.masterControl &&
          !this.props.loadingMasterControl &&
          <i className="master-control-icon fa fa-star" />
        }
        { this.props.online && <div className="user-bubble-online signal signal-green" /> }
        { bubble }
      </div>
    )
  }

}
export default connect(state => ({ users: state.userProfile.users }))(UserBubble)
