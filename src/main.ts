import { resolve } from 'path'
import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import ResponseInterceptor from '@root/app/utils/interceptor/response.interceptor'
import { AppModule } from '@root/app.module'
import config from '@root/app/config/appConfig'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const port = config.app.port
  app.setBaseViewsDir(resolve('./resources/views'))
  app.setViewEngine('hbs')
  app.enableCors()
  app.setGlobalPrefix('api/v2')
  app.useGlobalInterceptors(new ResponseInterceptor())
  await app.listen(port, () => Logger.debug(`Server is running 🚀  on port ${port}`))
}
bootstrap()
