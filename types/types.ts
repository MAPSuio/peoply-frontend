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

export interface EventData {
  eventId: string;
  dateString: string;
  timeString: string;
  title: string;
  description: string;
  capacity: number;
  private: boolean;
}
