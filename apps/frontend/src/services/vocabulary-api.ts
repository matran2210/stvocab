import { apiClient } from '../api/client';

export type VocabularyItem = {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  audio_path?: string | null;
  category_id: string;
};

export type VocabularyDetail = VocabularyItem & {
  image_path?: string | null;
  storyline?: string | null;
};

export type VocabularyListResponse = {
  data: VocabularyItem[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export async function getVocabulariesByCategory(
  categoryId: string,
  page: number,
  limit: number
) {
  const query = new URLSearchParams({
    category_id: categoryId,
    page: String(page),
    limit: String(limit),
  });

  return apiClient<VocabularyListResponse>(
    `/client/vocabularies?${query.toString()}`
  );
}

export async function getVocabularyDetail(id: string) {
  return apiClient<VocabularyDetail>(`/client/vocabularies/${id}`);
}
