export interface User {
  id: string;
  username: string;
  hashed_pass: string;
}

export interface Profile {
  user_id: string;
  email?: string;
  full_name?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithProfile extends User {
  profile: Profile;
}
