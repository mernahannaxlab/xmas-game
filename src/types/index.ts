export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  hints: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChallengeFormData {
  title: string;
  description: string;
  instructions: string;
  hints: string[];
}
