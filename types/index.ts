export interface Opportunity {
  id?: number;
  title: string;
  description?: string;
  category_name?: string; // API might return this
  category?: string; // Or this depending on mapping
  type: string;
  deadline: string;
  source: string;
  expired: boolean;
  image_url?: string;
  created_at?: string;
  eligibility?: string; // Added field
  is_verified?: boolean; // Added for status logic
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

export interface ModeratorProfile {
  id: number;
  full_name: string;
  email: string;
  role: string;
  image_url?: string;
  phone_number?: string;
  institution?: string;
  employee_id?: string;
  stats?: {
    opportunities_created: number;
    opportunities_verified: number;
    pending_actions: number;
  };
}
