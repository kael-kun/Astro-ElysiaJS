export interface GenerateBlogInput {
  topic: string;
  keywords?: string;
  tone: string;
  audience: string;
}

export interface GenerateBlogResponse {
  content: string;
}
