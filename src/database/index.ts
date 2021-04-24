import mongoose from 'mongoose'
import config from '@root/app/config/appConfig'

const dbName = process.env.APP_ENV === 'local' ? `${config.mongodb.db}_test` : config.mongodb.db
console.log('env => ', process.env.APP_ENV)
console.log(config.mongodb.uri)
export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> =>
      mongoose.connect(config.mongodb.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        user: config.mongodb.user,
        pass: config.mongodb.pass,
        dbName: dbName,
        authSource: config.mongodb.authSource,
        useFindAndModify: false,
        useCreateIndex: true
      })
  }
]
