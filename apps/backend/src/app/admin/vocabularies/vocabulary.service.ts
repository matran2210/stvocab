import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '@stvocab/database';
import { ConflictException } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service';
import { CloudinaryService } from './cloudinary.service';

const IMAGE_PROMT_STABLE = `Prompt tiếng Anh để vẽ ảnh. BẮT BUỘC viết theo chuẩn Stable Diffusion: chỉ dùng các từ khóa ngắn ngăn cách bằng dấu phẩy, miêu tả chi tiết vật thể chính và bối cảnh. BẮT BUỘC thêm các từ khóa phong cách nhiếp ảnh thực tế ở cuối: "photorealistic, highly detailed, 8k resolution, cinematic lighting, real life photography, ultra-realistic, DSLR".`;

const STORYLINE_PROMPT = `Bạn là một chuyên gia ngôn ngữ học và giáo viên tiếng Anh đầy sáng tạo, chuyên thiết kế bài học truyền cảm hứng. Nhiệm vụ của bạn là tạo ra một bài học từ vựng hấp dẫn, dễ nhớ và mang tính ứng dụng cao.

Yêu cầu BẮT BUỘC:
1. PHẢI TRẢ VỀ ĐÚNG MỘT OBJECT JSON DUY NHẤT. KHÔNG bọc trong markdown code block (tuyệt đối không dùng \`\`\`json), KHÔNG giải thích, KHÔNG có văn bản dư thừa trước và sau JSON.
2. Nội dung text bên trong key "storyline" của JSON PHẢI sử dụng định dạng MARKDOWN và dùng ký tự "\\n" để ngắt dòng:
   - Dùng "###" cho các tiêu đề lớn.
   - Dùng "-" cho các danh sách (gạch đầu dòng).
   - Dùng "**" để in đậm từ vựng chính mỗi khi nó xuất hiện.
3. Tiêu chuẩn Nội dung (Rất quan trọng):
   - **Ví dụ:** Phải là câu giao tiếp thực tế, hiện đại, kèm theo dịch nghĩa tiếng Việt trong ngoặc.
   - **Câu chuyện:** Tạo một câu chuyện siêu ngắn (micro-fiction) cực kỳ lôi cuốn (có thể hài hước, kịch tính, hoặc công sở đời thường). Câu chuyện dùng tiếng Việt làm nền nhưng chèn từ vựng tiếng Anh vào đúng tình huống cao trào để người đọc lập tức đoán được nghĩa và nhớ lâu. Cốt truyện phải thú vị, không sáo rỗng.
   - **Mẹo ghi nhớ:** Bắt buộc áp dụng phương pháp liên tưởng (chế âm thanh tiếng Việt tương tự, hình ảnh gợi nhớ) hoặc phân tích gốc từ (etymology). Bổ sung thêm Collocations (từ đi kèm).

4. Cấu trúc JSON bắt buộc phải tuân theo format sau:
{
  "storyline": "### I. Ví dụ thực tế\\n- **[Từ vựng]** ([Loại từ]): [Nghĩa tiếng Việt]\\n- 🎯 [Câu ví dụ tiếng Anh 1 có chứa **[Từ vựng]**] - *([Dịch nghĩa tiếng Việt])*\\n- 🎯 [Câu ví dụ tiếng Anh 2 có chứa **[Từ vựng]**] - *([Dịch nghĩa tiếng Việt])*\\n\\n### II. Câu chuyện ghi nhớ\\n[Kể một câu chuyện dài ít nhất 30 câu, văn phong sáng tạo, hài hước hoặc kịch tính. Bối cảnh rõ ràng. Đặt từ **[Từ vựng]** vào tình huống mấu chốt để làm nổi bật ý nghĩa].\\n\\n### III. Mẹo ghi nhớ & Mở rộng\\n- 🧠 **Mẹo liên tưởng:** [Giải thích cách nhớ từ qua âm thanh tương tự, hình ảnh, hoặc phân tách từ].\\n- 🔗 **Cụm từ hay gặp:** [1-2 collocations thông dụng nhất].\\n- ⚠️ **Lưu ý (nếu có):** [Sắc thái nghĩa hoặc lỗi sai thường gặp khi dùng từ này]."
}

Hãy tạo nội dung cho từ vựng sau: {WORD}
`;

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabRepo: Repository<Vocabulary>,
    private readonly aiGenerationService: AiGenerationService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(body: any) {
    const { word, level, category_id, auto_gen_ai, meaning, phonetic } = body;

    // ------------------------------------------------------------------
    // STEP 1: KIỂM TRA TRÙNG LẶP (Tránh tốn tiền gọi AI vô ích)
    // ------------------------------------------------------------------
    const existingVocab = await this.vocabRepo.findOne({ where: { word } });
    if (existingVocab) {
      throw new ConflictException(
        `Từ vựng "${word}" đã tồn tại trong hệ thống.`,
      );
    }

    let storyline = '';
    let image_path = '';

    if (auto_gen_ai) {
      // ------------------------------------------------------------------
      // STEP 3: GỌI GEMINI AI ĐỂ SINH NỘI DUNG
      // ------------------------------------------------------------------
      const prompt = `Từ vựng: "${word}". Hãy trả về JSON. ${STORYLINE_PROMPT}`;
      const aiRawText = await this.aiGenerationService.callGroqAI(prompt);

      // Ép dữ liệu vào đúng định dạng để lưu DB
      storyline = aiRawText.storyline;

      // chọn ảnh đầu tiên từ Unsplash
      const imageUrls = await this.aiGenerationService.pickImageUnsplash(word,1,1);
      image_path = imageUrls[0]
    }
    // ------------------------------------------------------------------
    // STEP 5: LƯU BẢN GHI MỚI VÀO DATABASE
    // ------------------------------------------------------------------
    const newVocab = this.vocabRepo.create({
      word,
      meaning,
      phonetic,
      level,
      category_id,
      storyline,
      image_path,
      total_attempts: 0,
      wrong_attempts: 0,
    });

    return await this.vocabRepo.save(newVocab);
  }

  async findAll(page: number, limit: number, category_id?: string) {
    const skip = (page - 1) * limit;

    const where = category_id ? { category_id } : {};

    const [data, total] = await this.vocabRepo.findAndCount({
      where,
      relations: ['category'], // trả thêm object category cho FE
      skip,
      take: limit,
      order: { created_at: 'DESC' }, // Mới nhất lên đầu
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const vocab = await this.vocabRepo.findOne({ where: { id } });
    if (!vocab) throw new NotFoundException('Vocabulary not found');
    return vocab;
  }

  async update(id: string, body: any, file: Express.Multer.File) {
    const { image_prompt_ai, gen_storyline_ai } = body;
    // Kiểm tra tồn tại
    const existingVocab = await this.vocabRepo.findOne({ where: { id } });
    if (!existingVocab) {
      throw new NotFoundException('Vocabulary not found');
    }

    // Ghi đè tất cả các field từ body vào existingVocab
    Object.assign(existingVocab, body);

    if (image_prompt_ai) {
      // Chuyển đổi ngôn ngữ tự nhiên sang ngôn ngữ stable để AI có thể hiểu được
      const prompt = `Viết lại prompt "${image_prompt_ai}" dưới dạng ${IMAGE_PROMT_STABLE}. Yêu cầu JSON:
                  - "image_prompt_stable": Prompt mới theo chuẩn quy định ở trên`;
      const aiData = await this.aiGenerationService.callGroqAI(prompt);

      const image_path = await this.aiGenerationService.generateAndSaveImage(
        existingVocab.word,
        aiData.image_prompt_stable,
      );
      existingVocab.image_path = image_path;
    }

    if (gen_storyline_ai) {
      const prompt = `Từ vựng: "${existingVocab.word}". Hãy trả về JSON. ${STORYLINE_PROMPT}`;
      const aiRawText = await this.aiGenerationService.callGeminiAI(prompt);
      existingVocab.storyline = aiRawText.storyline;
    }

    if (file) {
      const safeWord = existingVocab.word
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const fileName = `${safeWord}-${Date.now()}`;
      const folderPath = 'vocabularies/' + safeWord;

      // 3. Gọi service up thẳng lên Cloudinary
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        folderPath,
        fileName,
        true,
      );
      // 4. Lấy link Cloudinary trả về và gán thẳng vào trường image_url của body
      existingVocab.image_path = uploadResult.secure_url;
    }

    // 5. Lưu xuống Database (Lúc này body đã có chứa image_path mới nếu có file)
    await existingVocab.save();
    return existingVocab;
  }

  async remove(id: string) {
    await this.vocabRepo.softDelete(id);
    return { success: true, message: 'Deleted' };
  }

  async autoFill(word: string) {
    const prompt = `Từ: "${word}". Yêu cầu JSON:
                  - "meaning": Nghĩa của từ. Lưu ý là nghĩa tiếng việt, ngắn gọn không giải thích
                  - "phonetic": Phiên âm Anh-Mỹ của từ`;
    const aiData = await this.aiGenerationService.callGroqAI(prompt);
    return { meaning: aiData?.meaning, phonetic: aiData.phonetic };
  }

  async pickUnsplash(word, page, limit){
    const image_paths = await this.aiGenerationService.pickImageUnsplash(word,page, limit)
    return {image_paths}
  }
}
