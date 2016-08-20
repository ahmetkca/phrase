/* global process, require */

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import r from 'rethinkdb'
import chalk from 'chalk'
import { secret } from './config'
import socketIO from 'socket.io'
import { Server } from 'http'
import router from './router'
import setupDatabase from './setupDatabase'

async function bootstrap () {
  try {

    /*
     *  Connect to rethink!
     */

    let db = await r.connect({ host: `localhost`, db: `phrase`, port: 28015 })

    try { await setupDatabase(db) }
    catch (err) { console.log(err) }

    let app = express()
    let http = Server(app)
    let io = socketIO(http)

    io.on(`connection`, async socket => {

      try { await r.table(`connections`).insert({ id: socket.id }).run(db) }
      catch (e) { console.log(chalk.white(e)) }

      let count = await r.table(`connections`).count().run(db)

      console.log(chalk.yellow(
        `⚡ New connection! Number of open connections: ${count}`
      ))

      socket.on(`disconnect`, async () => {
        try { await r.table(`connections`).get(socket.id).delete().run(db) }
        catch (e) { console.log(chalk.magenta(e)) }

        let count = await r.table(`connections`).count().run(db)

        console.log(chalk.magenta(
          `⚡ Disconnection! Number of open connections: ${count}`
        ))
      })
    })

    let port = process.env.PORT || 5000

    app.set(`superSecret`, secret)

    app.use(cors())
    app.use(express.static(`sounds`))

    app.use(bodyParser.json({ limit: `50mb` }))
    app.use(bodyParser.urlencoded({ limit: `50mb`, extended: true }))

    // Add intentional latency to all responses to simulate real life
    if (process.env.NODE_ENV !== `production`)
      app.use((req, res, next) => { setTimeout(next, 640) })

    app.use(`/api`, router({ app, db, io }))

    http.listen(port, () => {
      console.log(chalk.white(`☆ listening on localhost:${port}`))
    })
  }

  catch (err) {
    console.log(err)
  }
}

bootstrap()
