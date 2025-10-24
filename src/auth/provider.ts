/**
 * Authentication provider with credential management
 */
import { validateApiKey, validateBaseUrl } from './validator.js';

export interface AuthCredentials {
  apiKey: string;
  baseUrl: string;
}

export class AuthProvider {
  private credentials: AuthCredentials;

  constructor(credentials: AuthCredentials) {
    // Validate credentials on construction
    validateApiKey(credentials.apiKey);
    validateBaseUrl(credentials.baseUrl);

    this.credentials = credentials;
  }

  /**
   * Get authorization header value
   */
  getAuthHeader(): string {
    return `Bearer ${this.credentials.apiKey}`;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.credentials.baseUrl;
  }

  /**
   * Get API key (use sparingly, prefer getAuthHeader)
   */
  getApiKey(): string {
    return this.credentials.apiKey;
  }

  /**
   * Update credentials (validates before updating)
   */
  updateCredentials(credentials: Partial<AuthCredentials>): void {
    const newCredentials = {
      ...this.credentials,
      ...credentials,
    };

    // Validate new credentials
    validateApiKey(newCredentials.apiKey);
    validateBaseUrl(newCredentials.baseUrl);

    this.credentials = newCredentials;
  }
}
