export interface Opportunity {
  id?: number;
  title: string;
  description?: string; // Not in list view
  category_name: string;
  type: string;
  deadline: string;
  source: string;
  expired: boolean;
  image_url?: string;
  created_at?: string;
}

export interface LoginValues {
  email: string;
  password: string;
}

export interface OpportunityFormValues {
  title: string;
  category: number;
  short_description: string;
  full_description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deadline: any;
  source_url: string;
  eligibility_criteria?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
