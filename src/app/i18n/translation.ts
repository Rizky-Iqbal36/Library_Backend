import path from 'path'
import i18n, { I18n } from 'i18n'
import { IGetLocalizedMsgOption } from '@root/interfaces'
import { MiddlewareConsumer } from '@nestjs/common'

class Translation {
  private i18n: I18n = i18n

  constructor() {
    this.i18n.configure({
      locales: ['en', 'id'],
      defaultLocale: 'en',
      directory: path.join(process.cwd(), 'locales'),
      updateFiles: false,
      objectNotation: true
    })
  }

  applyMiddleware = (consumer: MiddlewareConsumer, routeName = '*') => {
    consumer.apply(this.i18n.init).forRoutes(routeName)
  }

  getLocalizedMsg = (option: IGetLocalizedMsgOption, lang: any = 'en') => {
    let msg

    this.i18n.setLocale(lang)
    msg = this.i18n.__(option.key, option.vars as any)
    if (!msg || msg === option.key)
      msg = `<err: localized msg not found in json files><key: ${option.key}><lang: ${this.i18n.getLocale()}>`

    return msg
  }

  getLocalizedTime = (second: number, lang: any = 'en') => {
    this.i18n.setLocale(lang)
    if (second >= 3600) {
      const hour = Math.floor(second / 3600)
      const minute = Math.ceil((second - 3600 * hour) / 60)
      return `${this.i18n.__n('%s HOUR', hour)} ${this.i18n.__n('%s MINUTE', minute)}`
    }
    if (second >= 60) {
      const minute = Math.floor(second / 60)
      second -= 60 * minute
      return `${this.i18n.__n('%s MINUTE', minute)} ${this.i18n.__n('%s SECOND', second)}`
    }
    return this.i18n.__n('%s SECOND', second)
  }
}

const translation = new Translation()

export default translation
export const getLocalizedMsg = translation.getLocalizedMsg
export const getLocalizedTime = translation.getLocalizedTime
