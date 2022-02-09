enum OrganizationRole {
  ADMIN = "ADMIN",
}

export interface User {
  firstName: string;
  lastName: string;
  birthDate: string;
  id: string;
  email: string;
  arrangerId: string;
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
  organizationId: string;
  userId: string;
  organization: Organization;
  user: User;
  role: OrganizationRole;
}

export interface Organization {
  id: string;
  arranger: Arranger;
  arrangerId: string;
  name: string;
  orgNr: string;
  image?: string;
  organizationRole: Array<UserOrganizationRoles>;
}

export interface Arranger {
  id: string;
  isBusiness: boolean;
  organization?: Organization;
  user?: User;
  eventArranger: Array<EventArranger>;
}

export interface EventArranger {
  eventId: string;
  event: Event;
  arrangerId: string;
  arranger: Arranger;
  role: string;
}

export interface Favorite {
  userId: string;
  user: User;
  eventId: string;
  event: Event;
  favoritedDate: string;
}

export interface Registration {
  eventId: string;
  event: Event;
  userId: string;
  user: User;
  regDate: string;
  regStatus: string;
  attendance: boolean;
}

export interface Event {
  id: string;
  numericId: number;
  startDate: Date;
  endDate: Date;
  title: string;
  description: string;
  capacity?: number;
  private: boolean;
  image?: string;
  eventArrangers: Array<EventArranger>;
  registrations: Array<Registration>;
  eventCategories: Array<EventCategory>;
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
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  capacity?: number;
  image?: string;
  registrations: Array<Registration>;
}

export interface Category {
  id: number;
  name: string;
  eventCategories: Array<EventCategory>;
}

export interface EventCategory {
  categoryId: number;
  category: Category;
  eventId: string;
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
