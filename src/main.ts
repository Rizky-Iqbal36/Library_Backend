import { NestFactory } from '@nestjs/core'
import ResponseInterceptor from '@root/app/utils/interceptor/response.interceptor'
import { AppModule } from '@root/app.module'
import config from '@root/app/config/appConfig'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = config.app.port
  app.enableCors()
  app.setGlobalPrefix('api/v2')
  app.useGlobalInterceptors(new ResponseInterceptor())
  await app.listen(port, () => Logger.debug(`Server is running 🚀  on port ${port}`))
}
bootstrap()
