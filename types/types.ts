export interface User {
  first_name: string;
  last_name: string;
  birth_date: string;
  user_id: string;
  arranger_id: string;
  phone: string;
  image?: string;
}

export interface UserContextType {
  user?: User;
  loading: boolean;
  error?: string;
  logout: () => void;
}
