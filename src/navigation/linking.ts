// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['teamora://', 'https://teamora.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login:     'login',
          Register:  'register',
          JoinClub:  'join',
        },
      },
      App: {
        screens: {
          EventsTab: {
            screens: {
              EventDetail:  'event/:eventId',
              CreateEvent:  'create-event',
            },
          },
          SquadTab: {
            screens: {
              PlayerProfile: 'player/:userId',
            },
          },
        },
      },
    },
  },
};
