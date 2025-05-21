export interface ExerciseGroup {
  id?: string;
  training_plan_id: string;
  title: string;
  order: number;
  created_at?: string;
  updated_at?: string;
  exercises?: Exercise[];
}

export interface Exercise {
  id?: string;
  training_plan_id: string;
  group_id?: string;
  name: string;
  sets: number;
  reps: string;
  notes?: string;
  video_link?: string;
  order: number;
  completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingPlan {
  id?: string;
  name: string;
  description?: string;
  client_id: string;
  user_id?: string;
  exercises?: Exercise[];
  exercise_groups?: ExerciseGroup[];
  created_at?: string;
  updated_at?: string;
}
