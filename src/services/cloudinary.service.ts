import { Injectable } from '@nestjs/common'
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary'
import toStream = require('buffer-to-stream')

@Injectable()
export class CloudinaryService {
  public async uploadImage(file: Express.Multer.File): Promise<UploadApiErrorResponse | UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((err, result) => {
        console.log(result)
        if (err) return reject(err)
        resolve(result)
      })
      toStream(file.buffer).pipe(upload)
    })
  }
  public async uploadImageV2(file: Express.Multer.File): Promise<UploadApiErrorResponse | UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload('mejik.png', { folder: 'practice' }, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
      toStream(file.buffer).pipe(upload)
    })
  }

  public async uploadAvatar(file: Express.Multer.File) {
    console.log(file.originalname)
    return 'mejik'
  }
}
