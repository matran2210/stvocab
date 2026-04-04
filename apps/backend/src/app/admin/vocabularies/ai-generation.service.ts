import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import { CloudinaryService } from './cloudinary.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);
  private readonly hf: HfInference;

  // Inject CloudinaryService trực tiếp vào đây!
  constructor(private readonly cloudinaryService: CloudinaryService) {
    // Khởi tạo Hugging Face 1 lần duy nhất trong constructor
    const hfToken = process.env.HUGGINGFACE_TOKEN;
    this.hf = new HfInference(hfToken);
  }

  async pickImageUnsplash(word: string, page: number = 1, limit: number = 1) {
    this.logger.log(`Đang tìm ảnh thực tế trên Unsplash cho từ: "${word}"...`);
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      throw new Error('Thiếu UNSPLASH_ACCESS_KEY trong file .env');
    }

    // Unsplash tìm kiếm chuẩn nhất bằng chính từ vựng đó (VD: "apple")
    const query = encodeURIComponent(word);

    // Gọi API: Lấy 1 ảnh đẹp nhất (per_page=1), ưu tiên ảnh vuông (squarish) cho dễ làm flashcard
    const url = `https://api.unsplash.com/search/photos?page=${page}&per_page=${limit}&query=${query}&orientation=squarish`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Unsplash Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Trả về một mảng chứa 10 cái link ảnh
      const imageUrls = data.results.map((img: any) => img.urls.regular);
      console.log('imageUrls', imageUrls)
      return imageUrls;
    } else {
      return [];
    }
  }

  async generateAndSaveImage(
    word: string,
    imagePrompt?: string,
  ): Promise<string | null> {
    // 1. Gọi AI vẽ ảnh
    const imageBlob = await this.hf.textToImage({
      // model: 'stabilityai/stable-diffusion-xl-base-1.0',
      model: 'SDXL-Lightning',
      inputs: imagePrompt ? imagePrompt : word,
    });

    // 2. Chuyển đổi Blob sang Buffer
    const arrayBuffer = await (imageBlob as any).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Chuẩn bị tên file
    const safeWord = word.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${safeWord}-${Date.now()}`;

    // 3. Mock object Express.Multer.File
    const fileMock = {
      buffer: buffer,
      originalname: `${fileName}.jpg`,
      mimetype: 'image/jpeg',
      size: buffer.length,
    } as Express.Multer.File;

    // 4. Gọi thẳng hàm uploadImage của CloudinaryService (đã được inject)
    const folderPath = 'vocabularies/' + safeWord;
    const uploadResult = await this.cloudinaryService.uploadImage(
      fileMock,
      folderPath,
      fileName,
      true, // thực hiện xóa hết file trong folderPath trước khi import file mới lên
    );
    this.logger.log(`Đã lưu ảnh thành công tại: ${uploadResult.secure_url}`);
    // 5. Trả về URL
    return uploadResult.secure_url;
  }

  async callGroqAI(prompt: string) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      response_format: { type: 'json_object' },
    });

    const aiData = chatCompletion.choices[0]?.message?.content;
    return JSON.parse(aiData);
  }

  async callGeminiAI(prompt: string) {
    const model = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || '',
    ).getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('Dữ liệu AI trả về lỗi:', rawText);
      throw new InternalServerErrorException(
        'AI không trả về đúng định dạng JSON.',
      );
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('Parse JSON error:', err, rawText);
      throw new InternalServerErrorException('Parse AI JSON failed');
    }
  }
}
