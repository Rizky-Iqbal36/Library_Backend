const cloudinary = require('cloudinary').v2
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import config from '@root/app/config/appConfig'

export default cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
})

export const CloudStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const userId = req.header('x-user-id')
    const extension = file.fieldname === 'file' ? '.pdf' : ''
    const projectFolder = process.env.APP_ENV === 'local' ? 'LibraryV2_test' : 'LibraryV2'
    return {
      folder: `${projectFolder}/${file.fieldname}s/`,
      resource_type: file.fieldname === 'file' ? 'raw' : 'image',
      public_id: file.fieldname + '-' + userId + extension
    }
  }
})
