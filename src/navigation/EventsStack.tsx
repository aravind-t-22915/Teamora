// src/navigation/EventsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../types';
import { EventsListScreen }    from '../features/events/screens/EventsListScreen';
import { EventDetailScreen }   from '../features/events/screens/EventDetailScreen';
import { CreateEventScreen }   from '../features/events/screens/CreateEventScreen';
import { EditEventScreen }     from '../features/events/screens/EditEventScreen';
import { MatchResultScreen }   from '../features/events/screens/MatchResultScreen';
import { GalleryScreen }       from '../features/events/screens/GalleryScreen';
import { AvailabilityPollScreen } from '../features/events/screens/AvailabilityPollScreen';
import { LineupBuilderScreen }  from '../features/match/screens/LineupBuilderScreen';
import { TimelineEditorScreen } from '../features/match/screens/TimelineEditorScreen';
import { PlayerRatingScreen }   from '../features/match/screens/PlayerRatingScreen';
import { ReportWriterScreen }   from '../features/match/screens/ReportWriterScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator<EventsStackParamList>();
export function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background.primary } }}>
      <Stack.Screen name="EventsList"       component={EventsListScreen} />
      <Stack.Screen name="EventDetail"      component={EventDetailScreen} />
      <Stack.Screen name="CreateEvent"      component={CreateEventScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="EditEvent"        component={EditEventScreen} />
      <Stack.Screen name="MatchResult"      component={MatchResultScreen} />
      <Stack.Screen name="Gallery"          component={GalleryScreen} />
      <Stack.Screen name="AvailabilityPoll" component={AvailabilityPollScreen} />
      <Stack.Screen name="LineupBuilder"    component={LineupBuilderScreen} />
      <Stack.Screen name="TimelineEditor"   component={TimelineEditorScreen} />
      <Stack.Screen name="PlayerRating"     component={PlayerRatingScreen} />
      <Stack.Screen name="ReportWriter"     component={ReportWriterScreen} />
    </Stack.Navigator>
  );
}
