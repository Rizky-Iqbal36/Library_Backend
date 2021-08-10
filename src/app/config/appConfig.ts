import { config } from 'dotenv'
import * as pjson from '../../../package.json'
config()

const appConfig = {
  app: {
    name: pjson.name,
    version: pjson.version,
    port: parseInt(process.env.PORT) || 3001,
    websocketPort: parseInt(process.env.WEBSOCKET_PORT) || 8080
  },
  mongodb: {
    host: process.env.MONGO_DB_HOST,
    uri: () => {
      if (process.env.APP_ENV === 'local') return process.env.MONGO_DB_URI + 'localhost'
      else if (process.env.APP_ENV === 'test') return process.env.MONGO_DB_URI + 'database'
      else return process.env.MONGO_DB_URI
    },
    user: process.env.MONGO_DB_USER,
    pass: process.env.MONGO_DB_PASS,
    db: process.env.MONGO_DB_DB_NAME,
    authSource: process.env.MONGO_DB_AUTH_SOURCE
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    assets: process.env.APP_ENV === 'local' ? process.env.CLOUDINARY_ASSETS + '_test' : process.env.CLOUDINARY_ASSETS
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION,
    ecryptJwtSecret: process.env.ENCRYPT_JWT_SECRET
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 6379,
    auth_pass: process.env.REDIS_PASS
  }
}

export default appConfig
