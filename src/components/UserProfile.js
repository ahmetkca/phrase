import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import Numeral from 'numeral'

import { api } from 'helpers/ajaxHelpers'
import { catchAndToastException } from 'reducers/reduceNotification'
import LibraryPhrases from 'components/LibraryPhrases'

export class UserProfile extends Component {

  state = {
    phrases: [],
  }

  loadUserPhrases() {
    let { dispatch } = this.props
    catchAndToastException({ dispatch, toCatch: async() => {
      let { phrases } = await api({
        endpoint: `loadUserPhrases`,
        body: { userId: localStorage.userId },
      })
      if (phrases) this.setState({ phrases })
    }})
  }

  componentDidMount() {
    this.loadUserPhrases()
  }

  render() {
    let user = {
      username: localStorage.username,
      //image: deadmau5Image,
      //followers: 28751,
      //verified: true,
    }

    return (
      <div className="user-profile">
        <Helmet title={`${user.username} - Phrase.fm`} />
        <div className="user-profile-header page-header library-header">
          <div className="container">
            <h1>
              <a>{user.username}</a>
              &nbsp;
              <span className="fa fa-fw fa-caret-right" />
              All Phrases
            </h1>
          </div>
        </div>
        <div className="library">
          <LibraryPhrases phrases={this.state.phrases} />
        </div>
      </div>
    )
  }

  renderUserProfileDetails({ user }) {
    return (
      <div>
        <div className="user-profile-pic">
          <img src={user.image} />
          { this.renderVerified({ user }) }
        </div>
        <button className="btn btn-bright btn-light-bg user-profile-action">
          <span>Follow</span>
          { this.renderFollowerCount({ user }) }
        </button>
      </div>
    )
  }

  renderVerified({ user }) {
    if (!user.verified)
      return null

    return (
      <span className="fa fa-check user-profile-pic-verified" />
    )
  }

  renderFollowerCount({ user }) {
    if (!user.followers)
      return null

    let followers = Numeral(user.followers).format('0,0[.][0]a')
    return (
      <span className="user-profile-action-count">{followers}</span>
    )
  }
}

export default connect(null)(UserProfile)
