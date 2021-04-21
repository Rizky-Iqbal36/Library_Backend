import mongoose from 'mongoose'
import config from '@root/app/config/appConfig'

const dbName = process.env.NODE_ENV === 'test' ? `${config.mongodb.db}_test` : config.mongodb.db

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
