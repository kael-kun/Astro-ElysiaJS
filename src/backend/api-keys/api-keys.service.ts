import type { D1Database } from "@cloudflare/workers-types";
import type { DbApiKey, CreateApiKeyInput, ApiKeyResponse, ApiKeyWithFullKey } from "./api-keys.types";

function generateApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "pk_live_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function hashKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

function getKeyPrefix(key: string): string {
  return key.substring(0, 12);
}

export class ApiKeyService {
  constructor(private db: D1Database) {}

  async create(data: CreateApiKeyInput): Promise<ApiKeyWithFullKey> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const fullKey = generateApiKey();
    const keyHash = hashKey(fullKey);
    const keyPrefix = getKeyPrefix(fullKey);

    const result = await this.db
      .prepare(
        `INSERT INTO api_keys (id, project_id, key_hash, key_prefix, name, created_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
      )
      .bind(id, data.project_id, keyHash, keyPrefix, data.name, now)
      .run();

    if (!result.success) {
      throw new Error(`Failed to create API key: ${result.error}`);
    }

    return {
      id,
      project_id: data.project_id,
      key_prefix: keyPrefix,
      name: data.name,
      last_used_at: null,
      createdAt: now,
      is_active: true,
      fullKey,
    };
  }

  async findById(id: string): Promise<ApiKeyResponse | null> {
    const result = await this.db
      .prepare(`SELECT * FROM api_keys WHERE id = ?`)
      .bind(id)
      .first<DbApiKey>();

    if (!result) return null;

    return this.toResponse(result);
  }

  async findByProjectId(projectId: string): Promise<ApiKeyResponse[]> {
    const result = await this.db
      .prepare(`SELECT * FROM api_keys WHERE project_id = ? ORDER BY created_at DESC`)
      .bind(projectId)
      .all<DbApiKey>();

    return result.results.map(this.toResponse);
  }

  async verifyKey(key: string): Promise<{ valid: boolean; apiKey: ApiKeyResponse | null }> {
    const keyPrefix = getKeyPrefix(key);
    
    const result = await this.db
      .prepare(`SELECT * FROM api_keys WHERE key_prefix = ? AND is_active = 1`)
      .bind(keyPrefix)
      .first<DbApiKey>();

    if (!result) {
      return { valid: false, apiKey: null };
    }

    const keyHash = hashKey(key);
    if (keyHash !== result.key_hash) {
      return { valid: false, apiKey: null };
    }

    await this.updateLastUsed(result.id);

    return { valid: true, apiKey: this.toResponse(result) };
  }

  async updateLastUsed(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare(`UPDATE api_keys SET last_used_at = ? WHERE id = ?`)
      .bind(now, id)
      .run();
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.prepare(`DELETE FROM api_keys WHERE id = ?`).bind(id).run();

    if (!result.success) {
      throw new Error(`Failed to delete API key: ${result.error}`);
    }
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    const result = await this.db.prepare(`DELETE FROM api_keys WHERE project_id = ?`).bind(projectId).run();

    if (!result.success) {
      throw new Error(`Failed to delete API keys: ${result.error}`);
    }
  }

  private toResponse(dbKey: DbApiKey): ApiKeyResponse {
    return {
      id: dbKey.id,
      project_id: dbKey.project_id,
      key_prefix: dbKey.key_prefix,
      name: dbKey.name,
      last_used_at: dbKey.last_used_at,
      createdAt: dbKey.created_at,
      is_active: dbKey.is_active === 1,
    };
  }
}

export function createApiKeyService(env: Env): ApiKeyService {
  return new ApiKeyService(env.DB);
}
