const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file with optional additional data
   * @param endpoint - API endpoint
   * @param file - File to upload
   * @param data - Additional form data fields
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    data?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    // Append additional data fields
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle arrays and objects by stringifying them
          if (typeof value === 'object' && !Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Upload failed');
      }

      return responseData;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files with optional additional data
   * @param endpoint - API endpoint
   * @param files - Object with field names as keys and File/File[] as values
   * @param data - Additional form data fields
   */
  async uploadFiles<T>(
    endpoint: string,
    files: Record<string, File | File[]>,
    data?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    // Append files
    Object.entries(files).forEach(([fieldName, file]) => {
      if (Array.isArray(file)) {
        file.forEach((f) => formData.append(fieldName, f));
      } else {
        formData.append(fieldName, file);
      }
    });

    // Append additional data fields
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Upload failed');
      }

      return responseData;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
