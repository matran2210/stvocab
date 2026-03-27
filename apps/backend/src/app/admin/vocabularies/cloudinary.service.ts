import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Bổ sung tham số folderPath và fileName (có thể null)
  uploadImage(
    file: Express.Multer.File, 
    folderPath: string = 'images', 
    fileName?: string,
    isClearFolder?: boolean
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    
    return new Promise((resolve, reject) => {
      const handleUpload = () => {
        // Thiết lập cấu hình upload
        const uploadOptions: any = {
          folder: folderPath,
        };

        // Nếu bạn có truyền fileName, gán nó vào public_id của Cloudinary
        if (fileName) {
          uploadOptions.public_id = fileName;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              this.logger.error('Lỗi upload Cloudinary:', error);
              return reject(error);
            }
            resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      };

      const clearFolderIfNeeded = async () => {
        if (!isClearFolder) return;

        try {
          const { resources } = await cloudinary.api.resources({
            type: 'upload',
            prefix: folderPath,
            max_results: 500,
          });

          const publicIds = resources.map((r) => r.public_id);

          if (publicIds.length > 0) {
            await cloudinary.api.delete_resources(publicIds);
          }
        } catch (err) {
          this.logger.error('Lỗi khi clear folder Cloudinary:', err);
        }
      };

      (async () => {
        await clearFolderIfNeeded();
        handleUpload();
      })();
    });
  }
}