export interface DbApiKey {
  id: string;
  project_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
  is_active: number;
}

export interface CreateApiKeyInput {
  project_id: string;
  name: string;
}

export interface ApiKeyResponse {
  id: string;
  project_id: string;
  key_prefix: string;
  name: string;
  last_used_at: string | null;
  createdAt: string;
  is_active: boolean;
}

export interface ApiKeyWithFullKey extends ApiKeyResponse {
  fullKey: string;
}
