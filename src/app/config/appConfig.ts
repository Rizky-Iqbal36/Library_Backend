import { config } from 'dotenv'
import * as pjson from '../../../package.json'
config()

const appConfig = {
  app: {
    name: pjson.name,
    version: pjson.version
  },
  mongodb: {
    host: process.env.MONGO_DB_HOST,
    uri:
      process.env.APP_ENV === 'local' ? process.env.MONGO_DB_URI + 'localhost' : process.env.MONGO_DB_URI + 'database',
    user: process.env.MONGO_DB_USER,
    pass: process.env.MONGO_DB_PASS,
    db: process.env.MONGO_DB_DB_NAME,
    authSource: process.env.MONGO_DB_AUTH_SOURCE
  }
}

export default appConfig
