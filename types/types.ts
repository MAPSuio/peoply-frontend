export interface User {
  first_name: string;
  last_name: string;
  birth_date: string;
  user_id: string;
  email: string;
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

export interface Event {
  event_id: number;
  start_date: Date;
  end_date: Date;
  title: string;
  description: string;
  capacity: number;
}
