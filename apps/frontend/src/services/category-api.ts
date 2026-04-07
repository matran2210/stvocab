import { apiClient } from '../api/client';

export type VocabularyCategory = {
  id: string;
  name: string;
  description?: string | null;
};

export type VocabularyCategoryListResponse = {
  data: VocabularyCategory[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export async function getVocabularyCategories(page: number, limit: number) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiClient<VocabularyCategoryListResponse>(
    `/client/categories?${query.toString()}`
  );
}
