import { TypeOrmModule } from '@nestjs/typeorm'
import mongoose from 'mongoose'
import config from '@root/app/config/appConfig'
import { entities } from '@database/models'

const dbName = process.env.NODE_ENV === 'test' ? `${config.mongodb.db}_test` : config.mongodb.db

export default TypeOrmModule.forRoot({
  type: 'mongodb',
  host: config.mongodb.host,
  username: config.mongodb.user,
  password: config.mongodb.pass,
  authSource: config.mongodb.authSource,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  database: dbName,
  entities: entities
})
// mongoose.connect(`${config.mongodb.uri}/${dbName}`, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   user: config.mongodb.user,
//   pass: config.mongodb.pass,
//   authSource: config.mongodb.authSource,
//   useFindAndModify: false,
//   useCreateIndex: true
// })

export const flushMongoDB = async () => {
  const models = Object.values(mongoose.models)
  for (const model of models) {
    await model.deleteMany({})
  }
}

export const dropMongoDB = async () => {
  await mongoose.connection.db.dropDatabase()
}

export const closeMongoDB = mongoose.disconnect
