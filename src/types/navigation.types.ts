// src/types/navigation.types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  JoinClub: undefined;
  ProfileSetup: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type CalendarStackParamList = {
  Calendar: undefined;
  EventDetail: { eventId: string };
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
  CreateEvent: { date?: string } | undefined;
  EditEvent: { eventId: string };
  MatchResult: { eventId: string };
  Gallery: { eventId: string };
  AvailabilityPoll: { eventId: string };
  LineupBuilder: { eventId: string };
  TimelineEditor: { eventId: string };
  PlayerRating: { eventId: string };
  ReportWriter: { eventId: string };
};

export type SquadStackParamList = {
  Squad: undefined;
  PlayerProfile: { userId: string };
  Groups: undefined;
  GroupDetail: { groupId: string };
  PendingApprovals: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  HomeTab:     undefined;
  CalendarTab: NavigatorScreenParams<CalendarStackParamList> | undefined;
  EventsTab:   NavigatorScreenParams<EventsStackParamList>  | undefined;
  SquadTab:    NavigatorScreenParams<SquadStackParamList>   | undefined;
  ProfileTab:  NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  // Modals
  GalleryViewer: { mediaId: string; eventId: string };
  Statistics: undefined;
};
