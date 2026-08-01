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
  foodPreference?: FoodPreference;
  allowEmailFromArranger: boolean;
  allowEmailPromotions: boolean;
  userAllergens?: {
    allergenId: number;
    allergen: { id: number; name: string };
  }[];
  userSeenUpdates?: {
    update: UserSeenUpdateType;
  }[];
}

export enum FoodPreference {
  NO_PREFERENCE = "NO_PREFERENCE",
  VEGAN = "VEGAN",
  VEGETARIAN = "VEGETARIAN",
  PESCETARIAN = "PESCETARIAN",
}

export enum EventUpdateVisibility {
  ALL = "ALL",
  GOING = "GOING",
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
  notificationsError?: unknown;
  reload: () => void;
  markAsRead: () => void;
  hasUnreadNotifications: boolean;
}

export interface Snack {
  label: string;
  type?: SnackTypes;
}

export interface SnackContextType {
  addSnack: (label: string, type?: SnackTypes) => void;
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
  INVITATION_EVENT_COORGANIZER = "INVITATION_EVENT_COORGANIZER",
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

export interface CoOrganizerInvitationNotification
  extends PeoplyNotification,
    EventCoOrganizerInvitation {}

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
  urlId?: string;
  arranger: Arranger;
  arrangerId: string;
  approved: boolean;
  description?: string;
  name: string;
  orgNr: string;
  image?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  organizationRoles: UserOrganizationRoles[];
}

export interface OrganizationReportStatus {
  canReport: boolean;
  nextReportAt: string | null;
  remainingSeconds: number;
}

export enum IcsFeedSyncStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  DISABLED = "DISABLED",
}

export interface OrganizationIcsFeed {
  id: string;
  organizationId: string;
  url: string;
  registrationMode: EventRegistrationMode;
  enabled: boolean;
  syncIntervalMinutes: number;
  lastSyncedAt?: string | null;
  lastSuccessfulSyncAt?: string | null;
  lastSyncStatus: IcsFeedSyncStatus;
  lastSyncError?: string | null;
  consecutiveFailures: number;
  disabledAt?: string | null;
}

export enum EventSource {
  MANUAL = "MANUAL",
  ICS = "ICS",
}

export enum EventRegistrationMode {
  PEOPLY = "PEOPLY",
  EXTERNAL = "EXTERNAL",
  NONE = "NONE",
}

export interface Arranger {
  id: string;
  isBusiness: boolean;
  organization?: Organization;
  user?: User;
  eventArranger: EventArranger[];
}

export interface ArrangerFollower {
  arrangerId: string;
  userId: string;
  arranger: Arranger;
  user: User;
  createdAt: string;
  updatedAt: string;
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
  formAnswer?: string;
}

export interface Event {
  id: string;
  urlId: string;
  startDate: Date | string;
  endDate: Date | string | null;
  regStart: Date | string | null;
  regEnd: Date | string | null;
  title: string;
  description: string;
  hasFood: boolean;
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
  formQuestion?: string;
  source?: EventSource;
  registrationMode?: EventRegistrationMode;
  externalId?: string;
  externalUrl?: string;
  externalUpdatedAt?: string | null;
  archivedAt?: string | null;
  readOnly?: boolean;

  eventArrangers?: EventArranger[];
  /** @deprecated Unbounded — one element per registration, on an endpoint that
   * needs no login. Use `goingCount`; the backend keeps this only until every
   * deployed client has moved over. */
  registrations?: Registration[];
  /** How many registrations are GOING. Counted by the database rather than by
   * shipping the whole list and filtering it here. */
  goingCount?: number;
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

/**
 * An event asking an organization to co-organize it. Unlike the invitations
 * above this one is addressed to an organization rather than a user: every
 * ADMIN/OWNER of that organization sees it until one of them answers, which is
 * why there is no toUser.
 */
export interface EventCoOrganizerInvitation {
  id: string;
  eventId: string;
  event?: Event;
  organizationId: string;
  organization: Organization;
  fromUserId: string | null;
  fromUser?: User;
  respondedByUserId: string | null;
  invitationStatus: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventUpdate {
  id: string;
  eventId: string;
  visibility: EventUpdateVisibility;
  sendEmail: boolean;
  subject: string;
  body: string;
  replyTo: string;
  createdByUserId: string;
  createdByUser?: User;
  createdAt: string;
  updatedAt: string;
}

export interface EmailContent {
  /**
   * Subject of the email message
   */
  subject: string;
  /**
   * Plain text version of the email message.
   */
  plainText?: string;
  /**
   * Html version of the email message.
   */
  html?: string;
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
  BANNED = "BANNED",
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
  DANGERSOFT,
  WARNING,
  WARNINGSOFT,
  CONFIRMED,
  HIGHLIGHTEDEVENTCARD,
}

export enum ButtonSize {
  TINY,
  TINYWITHTEXT,
  COMPACT,
  SMALL,
  MEDIUM,
}

export enum Alignment {
  LEFT,
  CENTER,
  RIGHT,
}

export enum EventDateFormat {
  SHORT,
  LONG,
}

export enum UserSeenUpdateType {
  HAS_SET_ALLERGENS = "HAS_SET_ALLERGENS",
}
