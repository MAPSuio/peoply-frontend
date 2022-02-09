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
export interface Snack {
  label: string;
  type?: SnackTypes;
}

export interface SnackContextType {
  addSnack: any;
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

export interface EventArranger {
  event_id: string;
  event: Event;
  arranger_id: string;
  arranger: Arranger;
  role: string;
}

export interface Favorite {
  user_id: string;
  user: User;
  event_id: string;
  event: Event;
  favorite_date: string;
}

export interface Registration {
  event_id: string;
  event: Event;
  user_id: string;
  user: User;
  reg_date: string;
  reg_status: string;
  attendance: boolean;
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
  image?: string;
  event_arrangers: Array<EventArranger>;
  registrations: Array<User>;
  event_categories: Array<EventCategory>;
  favorites: Array<Favorite>;
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

export interface MyEventData {
  eventId: number;
  start_date: string;
  end_date: string;
  title: string;
  capacity?: number;
  image?: string;
  registrations: Array<Registration>;
}

export interface Category {
  category_id: number;
  category: string;
  event_categories: Array<EventCategory>;
}

export interface EventCategory {
  category_id: number;
  category: Category;
  event_id: string;
  event: Event;
}

export enum InputPages {
  TitlePage = "titlePage",
  DatePage = "datePage",
  AddressPage = "addressPage",
  DescriptionPage = "descriptionPage",
  ImagePage = "imagePage",
  ExtraInfoPage = "extraInfoPage",
  SummaryPage = "summaryPage",
}

export enum CircleLabels {
  Title = "Tittel",
  Date = "Tid og dato",
  Location = "Addresse/sted",
  Description = "Beskrivelse",
  Image = "Bilde",
  Extra = "Øvrig informasjon",
  Summary = "Oppsummering 🥳",
}

export enum SnackTypes {
  Success,
  Warning,
  Error,
}
