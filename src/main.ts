import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import config from '@root/app/config/appConfig'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('library')
  await app.listen(config.app.port)
}
bootstrap()
