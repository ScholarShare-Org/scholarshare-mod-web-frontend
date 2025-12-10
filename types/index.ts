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
  creator_name?: string; // Added for Global Opportunities
  total_engagement?: number; // Added for Global Opportunities
  // New Stats for Moderator's Own View
  total_interested?: number;
  total_saved?: number;
  total_applied?: number;
  total_not_interested?: number;
  is_archived?: boolean;
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

export interface RecentPost {
  id: number;
  title: string;
  category_name: string;
  engagement: number;
  image_url: string;
  created_at: string;
}

export interface ModeratorProfile {
  mod_id: number;
  name: string;
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
  recent_posts?: RecentPost[];
}

export interface LeaderboardEntry {
  rank: number;
  mod_id: number;
  name: string;
  total_posts: number;
  total_engagement: number;
  avg_engagement: number;
  category_name?: string | null;
}

export interface LeaderboardResponse {
  period: string;
  total_moderators: number;
  current_mod_rank: number;
  leaderboard: LeaderboardEntry[];
}
