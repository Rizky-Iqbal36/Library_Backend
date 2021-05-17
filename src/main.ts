import { NestFactory } from '@nestjs/core'
import ResponseInterceptor from '@root/app/utils/interceptor/response.interceptor'
import { AppModule } from '@root/app.module'
import config from '@root/app/config/appConfig'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('library/v2')
  app.useGlobalInterceptors(new ResponseInterceptor())
  await app.listen(config.app.port)
}
bootstrap()
