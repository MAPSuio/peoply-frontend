enum OrgRole {
  admin = "ADMIN",
}

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

export interface GeolocationPostitionObject {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number;
    altitudeAccuracy: number;
    heading: number;
    speed: number;
  };
  timestamp: number;
}

export interface UserContextType {
  user?: User;
  loading: boolean;
  error?: string;
  logout: () => Promise<Response>;
}

export interface GeolocationContextType {
  activated?: boolean;
  geolocation?: GeolocationPosition;
  loading: boolean;
  error?: string;
  activateGeolocation: () => void;
}

export interface UserOrganizationRoles {
  organization_id: string;
  user_id: string;
  organization: Organization;
  user: User;
  role: OrgRole;
}

export interface Organization {
  organization_id: string;
  arranger: Arranger;
  arranger_id: string;
  name: string;
  org_nr: string;
  image?: string;
  organization_roles: Array<UserOrganizationRoles>;
}

export interface Arranger {
  arranger_id: string;
  is_business: boolean;
  organization?: Organization;
  user?: User;
  event_arrangers: Array<Arranger>;
}

export interface Event {
  event_id: string;
  event_numeric_id: number;
  start_date: Date;
  end_date: Date;
  title: string;
  description: string;
  capacity?: number;
  private: boolean;
  event_arrangers: Array<Arranger>;
  registrations: Array<User>;
}

export interface EventData {
  eventId: number;
  dateString: string;
  timeString: string;
  title: string;
  description: string;
  capacity?: number;
  private: boolean;
  image?: string;
}

export interface Category {
  category_id: number;
  category: string;
  event_categories: Array<EventCategories>;
}

export interface EventCategories {
  category_id: number;
  category: Category;
  event_id: string;
  event: Event;
}
