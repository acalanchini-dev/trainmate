export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  objective: string | null;
  notes: string | null;
  status: 'active' | 'inactive';
  sessions_remaining: number;
  created_at: string | null;
  updated_at: string | null;
  profile_picture_url: string | null;
  birth_date: string | null;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string | null;
  objective?: string | null;
  notes?: string | null;
  sessions_remaining: number;
  status: 'active' | 'inactive';
  profile_picture_url?: string | null;
  birth_date?: string | null;
}
