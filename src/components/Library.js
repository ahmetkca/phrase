import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { phraseLoadFromMemory } from 'reducers/reducePhrase'

let Library = ({ phrases, dispatch }) => {
  return (
    <div className="library">
      <h1>Search Phrases</h1>

      { phrases.map(phrase =>
        <div
          key={phrase.id}
          style={{cursor: `pointer`}}
          onClick={
            () => {
              dispatch(phraseLoadFromMemory(phrase.state))
              dispatch(push('/edit'))
            }
          }
        >
          {phrase.name}
        </div>
      )}
    </div>
  )
}

export default connect(state => state.library)(Library)
