export enum OrganizationRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  OWNER = "OWNER",
}

export interface User {
  firstName: string;
  lastName: string;
  birthDate: string;
  id: string;
  email: string;
  arrangerId: string;
  phone: string;
  description: string;
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

export interface OutboundOrganizationInvitation {
  userId: string;
  role: OrganizationRole;
}

export interface OrganizationInvitation {
  id: string;
  invitationStatus: InvitationStatus;
  organizationId: string;
  organizationRole: OrganizationRole;
  organization: Organization;
  createdAt: string;
  updatedAt: string;
  fromUser?: User;
  fromUserId: string;
  toUser?: User;
  toUserId: string;
}

export interface UserContextType {
  user?: User;
  currentOrg?: Organization;
  orgs?: Organization[];
  loading: boolean;
  error?: string;
  ipInfo?: IpInfo;

  logout: () => Promise<Response>;
  deleteMe: () => Promise<Response>;
  reload: () => void;
  switchContext: (org?: Organization) => void;
}

export interface IpInfo {
  ip: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: string;
  country_population: number;
  asn: string;
  org: string;
}

export interface GeolocationContextType {
  activated?: boolean;
  geolocation?: GeolocationPosition;
  loading: boolean;
  error?: string;
  activateGeolocation: () => void;
}

export interface NotificationsContextType {
  notifications?: PeoplyNotification[];
  notificationsError?: any;
  reload: () => void;
  markAsRead: () => void;
  hasUnreadNotifications: boolean;
}

export interface Snack {
  label: string;
  type?: SnackTypes;
}

export interface SnackContextType {
  addSnack: any;
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
  IGNORED = "IGNORED",
}

export enum NotificationType {
  INVITATION_EVENT = "INVITATION_EVENT",
  INVITATION_ORGANIZATION = "INVITATION_ORGANIZATION",
}

export interface PeoplyNotification {
  id: string;
  type: NotificationType;
  createdAt: string;
  updatedAt: string;
}

export interface EventInvitationNotification
  extends PeoplyNotification,
    EventInvitation {}

export interface OrganizationInvitationNotification
  extends PeoplyNotification,
    OrganizationInvitation {}

export interface UserOrganizationRoles {
  organizationId: string;
  userId: string;
  organization: Organization;
  user: User;
  role: OrganizationRole;
  roleDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  arranger: Arranger;
  arrangerId: string;
  description?: string;
  name: string;
  orgNr: string;
  image?: string;
  organizationRoles: UserOrganizationRoles[];
}

export interface Arranger {
  id: string;
  isBusiness: boolean;
  organization?: Organization;
  user?: User;
  eventArranger: EventArranger[];
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
  createdAt: string;
  updatedAt: string;
  regStatus: RegStatus;
  attendance: boolean;
}

export interface Event {
  id: string;
  urlId: string;
  startDate: Date | string;
  endDate: Date | string | null;
  title: string;
  description: string;
  capacity?: number | null;
  visibility: Visibility;
  image?: string;
  locationName: string;
  poiName?: string;
  country?: string;
  countryCode?: string;
  countryCodeISO3?: string;
  countrySubdivision?: string;
  localName?: string;
  municipality?: string;
  postalCode?: string;
  streetName?: string;
  streetNumber?: string;
  freeformAddress?: string;
  latitude?: number;
  longitude?: number;

  eventArrangers?: EventArranger[];
  registrations?: Registration[];
  eventCategories?: EventCategory[];
  favorites?: Favorite[];
}

export interface MyEventData {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  capacity?: number;
  image?: string;
  registrations: Registration[];
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
  eventCategories: EventCategory[];
}

export interface EventCategory {
  categoryId: number;
  category: Category;
  eventId: string;
  event: Event;
}

export interface EventInvitation {
  id: string;
  eventId: string;
  event?: Event;
  fromUserId: string;
  fromUser?: User;
  toUserId: string;
  toUser?: User;
  createdAt: string;
  updatedAt: string;
  invitationStatus: InvitationStatus;
}

export enum InputPages {
  TITLE_PAGE = "titlePage",
  DATE_PAGE = "datePage",
  ADDRESS_PAGE = "addressPage",
  DESCRIPTION_PAGE = "descriptionPage",
  IMAGE_PAGE = "imagePage",
  EXTRA_INFO_PAGE = "extraInfoPage",
  SUMMARY_PAGE = "summaryPage",
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

export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  UNLISTED = "UNLISTED",
}

export enum ImageCaching {
  OK,
  PREEMPTIVE_MESSAGE,
  REFRESH_MESSAGE,
}

export enum SettingTypes {
  WARNING,
  DANGER,
}

export enum RegStatus {
  INVITED = "INVITED",
  GOING = "GOING",
  NOT_GOING = "NOT_GOING",
  WAITLISTED = "WAITLISTED",
}

export enum SectionTypes {
  REGISTERED = "REGISTERED",
  FAVORITES = "FAVORITES",
  MY_EVENTS = "MY_EVENTS",
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

export enum ButtonType {
  PRIMARY,
  SECONDARY,
  DANGER,
  WARNING,
}

export enum Alignment {
  LEFT,
  CENTER,
  RIGHT,
}
