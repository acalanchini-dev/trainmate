export interface AnthropometricData {
  id: string;
  client_id: string;
  user_id: string;
  date: string;
  weight: number | null;
  height: number | null;
  body_fat_percentage: number | null;
  waist_circumference: number | null;
  hip_circumference: number | null;
  chest_circumference: number | null;
  thigh_circumference: number | null;
  arm_circumference: number | null;
  notes: string | null;
  created_at: string;
}

export interface AnthropometricFormData {
  date: string;
  weight?: number | null;
  height?: number | null;
  body_fat_percentage?: number | null;
  waist_circumference?: number | null;
  hip_circumference?: number | null;
  chest_circumference?: number | null;
  thigh_circumference?: number | null;
  arm_circumference?: number | null;
  notes?: string | null;
}
