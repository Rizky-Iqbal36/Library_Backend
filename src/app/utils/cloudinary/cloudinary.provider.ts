const cloudinary = require('cloudinary').v2
import { CloudinaryStorage } from 'multer-storage-cloudinary'

export default cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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
