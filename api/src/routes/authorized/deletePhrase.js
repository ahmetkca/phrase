import r from 'rethinkdb'
import fs from 'fs'
import glob from 'glob'

export default ({ api, db }) => {
  api.post(`/deletePhrase`, async (req, res) => {
    let { phraseId } = req.body
    let { id } = req.decoded

    if (!phraseId) res.json({ success: false, message: `Must provide a phraseId` })

    try {
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)

      if (loadedPhrase.userId !== id) {
        res.json({ success: false, message: `Only original author can delete a Phrase!` })
        return
      }

      let result = await r.table(`phrases`).get(phraseId).delete().run(db)

      if (result.errors.length) {
        res.json({ success: false, message: result.first_error })
      }

      let phraseFiles = glob.sync(`public/audio-tracks/${phraseId}*`)
      if (phraseFiles.length) {
        phraseFiles.forEach(filePath => {
          fs.unlink(filePath)
        })
      }

      res.json({ success: true, message: `Phrase deleted!` })
    }

    catch (error) {
      res.json({ success: false, message: error })
    }
  })
}
