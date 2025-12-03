export interface Opportunity {
  id?: string;
  title: string;
  short_description: string;
  full_description: string;
  category: 'Scholarship' | 'Internship' | 'Workshop' | 'Competition';
  eligibility_criteria: string;
  deadline: string;
  source_url: string;
  is_live: boolean;
  image_url?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
