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
  user_id: number;
  name: string;
  email: string;
  category_id: number | null;
  category_name: string | null;
  stats: {
    total_posts: number;
    verified_posts: number;
    pending_posts: number;
    rejected_posts: number;
    total_engagement: number;
    avg_engagement_per_post: number;
  };
  rank: number;
  joined_at: string;
}
