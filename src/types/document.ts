
export interface ClientDocument {
  id: string;
  client_id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string | null;
  description: string | null;
  created_at: string;
}

export interface DocumentFormData {
  name: string;
  file: File;
  category?: string;
  description?: string;
}
