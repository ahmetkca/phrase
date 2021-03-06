import r from 'rethinkdb'
import { generateAPIToken } from '../../helpers/token'
import doubleHash from '../../helpers/doubleHash'

export default ({ app, db }) => {
  app.post(`/login`, async (req, res) => {

    let { email, password } = req.body

    if (!email && password) {
      res.json({ success: false, message: `Must provide an email/username.`})
      return
    }

    if (email && !password) {
      res.json({ success: false, message: `Must provide a password.`})
      return
    }

    if (!email && !password) {
      res.json({ success: false, message: `Must provide an email/username and password.`})
      return
    }

    try {
      let lowerCaseUnameEmail = email.toLowerCase()

      let cursor = await r
        .table(`users`)
        .getAll(lowerCaseUnameEmail, { index: `email` })
        .limit(1)
        .union(r.table(`users`).getAll(lowerCaseUnameEmail, { index: `usernameLC` }).limit(1))
        .run(db)

      let users = await cursor.toArray()
      let user = users[0]

      if (!user) {
        res.json({
          success: false,
          message: `User not found.`,
        })
      } else if (!user.password) {
        res.json({
          success: false,
          message: `Password has not been set yet, please `,
          passwordFail: true,
        })
      } else if (user.password !== doubleHash(password.trim())) {
        res.json({
          success: false,
          message: `Bad username or email / password combination.`,
        })
      }
      else {
        let token = await generateAPIToken(user, app)
        res.json({
          success: true,
          message: `Enjoy your token!`,
          token,
          user,
        })
      }
    }

    catch (err) {
      console.log(err)
    }
  })
}
