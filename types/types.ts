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
  eventUuid: string;
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

export interface FavoriteData {
  userId: string;
  eventId: string;
  favoritedDate: string;
}

export interface RegistrationData {
  eventId: string;
  userId: string;
  regDate: Date;
  regStatus: RegStatus;
  attendance: boolean;
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
  TITLEPAGE = "titlePage",
  DATEPAGE = "datePage",
  ADDRESSPAGE = "addressPage",
  DESCRIPTIONPAGE = "descriptionPage",
  IMAGEPAGE = "imagePage",
  EXTRAINFOPAGE = "extraInfoPage",
  SUMMARYPAGE = "summaryPage",
}

export enum CircleLabels {
  TITLE = "Tittel",
  DATE = "Tid og dato",
  LOCATION = "Addresse/sted",
  DESCRIPTION = "Beskrivelse",
  IMAGE = "Bilde",
  EXTRA = "Øvrig informasjon",
  SUMMARY = "Oppsummering 🥳",
}

export enum SnackTypes {
  SUCCESS,
  WARNING,
  ERROR,
}

export enum ModalTypes {
  SUCCESS,
  WARNING,
  DANGER,
}

export enum RegStatus {
  INVITED = "INVITED",
  GOING = "GOING",
  NOTGOING = "NOT_GOING",
  WAITLISTED = "WAITLISTED",
}

export enum SectionTypes {
  REGISTERED,
  FAVORITES,
  MYEVENTS,
}

export enum Weekdays {
  SUNDAY = "Søndag",
  MONDAY = "Mandag",
  TUESDAY = "Tirsdag",
  WEDNESDAY = "Onsdag",
  THURSDAY = "Torsdag",
  FRIDAY = "Fredag",
  SATURDAY = "Lørdag",
}
