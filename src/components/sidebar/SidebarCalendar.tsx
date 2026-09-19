import React, { useEffect, useState } from 'react';
import { CalendarDays, Cloud, Link2, RefreshCw } from 'lucide-react';
import { db } from '../../storage/db';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  source: 'Ration' | 'Google';
}

interface GoogleTokenClient {
  requestAccessToken: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string }) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

const formatEventDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(value));

export const SidebarCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [googleToken, setGoogleToken] = useState<string | null>(() => sessionStorage.getItem('ration_google_calendar_token'));
  const [isConnecting, setIsConnecting] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const loadLocalEvents = async (): Promise<CalendarEvent[]> => {
    const dateProperty = (await db.databaseProperties.toArray()).find((property) => property.type === 'date');
    if (!dateProperty) return [];
    const rows = await db.databaseRows.where('databaseId').equals(dateProperty.databaseId).toArray();
    return rows
      .map((row) => ({ id: row.id, title: row.title || 'Untitled', start: String(row.values[dateProperty.id] || ''), source: 'Ration' as const }))
      .filter((event) => event.start && !Number.isNaN(new Date(event.start).getTime()))
      .filter((event) => new Date(event.start).getTime() >= Date.now() - 86400000)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  };

  const loadGoogleEvents = async (token: string): Promise<CalendarEvent[]> => {
    const timeMin = encodeURIComponent(new Date().toISOString());
    const timeMax = encodeURIComponent(new Date(Date.now() + 30 * 86400000).toISOString());
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=5&timeMin=${timeMin}&timeMax=${timeMax}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Google Calendar request failed');
    const payload = await response.json() as { items?: Array<{ id: string; summary?: string; start?: { dateTime?: string; date?: string } }> };
    return (payload.items || []).map((event) => ({
      id: `google_${event.id}`,
      title: event.summary || 'Untitled event',
      start: event.start?.dateTime || event.start?.date || '',
      source: 'Google' as const,
    })).filter((event) => event.start);
  };

  const loadEvents = async () => {
    const localEvents = await loadLocalEvents();
    if (!googleToken) {
      setEvents(localEvents);
      return;
    }
    try {
      const googleEvents = await loadGoogleEvents(googleToken);
      setEvents([...localEvents, ...googleEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).slice(0, 5));
    } catch {
      sessionStorage.removeItem('ration_google_calendar_token');
      setGoogleToken(null);
      setEvents(localEvents);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, [googleToken]);

  const connectGoogle = () => {
    if (!clientId) return;
    setIsConnecting(true);
    const finish = (response: { access_token?: string }) => {
      setIsConnecting(false);
      if (response.access_token) {
        sessionStorage.setItem('ration_google_calendar_token', response.access_token);
        setGoogleToken(response.access_token);
      }
    };
    const requestToken = () => window.google?.accounts.oauth2.initTokenClient({ client_id: clientId, scope: GOOGLE_SCOPE, callback: finish }).requestAccessToken();
    if (!window.google) {
      const script = document.createElement('script');
      script.src = GOOGLE_SCRIPT;
      script.async = true;
      script.onload = requestToken;
      script.onerror = () => setIsConnecting(false);
      document.head.appendChild(script);
      return;
    }
    requestToken();
  };

  return (
    <section className="mx-2 mb-3 rounded-lg border border-[#e5e5df] bg-[#f5f5f0] p-2.5 dark:border-[#363630] dark:bg-[#20201d]">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#5a5a40] dark:text-[#a4a485]"><CalendarDays className="h-3.5 w-3.5" /> Calendar</span>
        <button onClick={() => void loadEvents()} title="Refresh calendar" className="rounded p-1 text-[#9c9c94] hover:bg-[#e2e2da] dark:hover:bg-[#2c2c28]"><RefreshCw className="h-3 w-3" /></button>
      </div>
      <div className="space-y-1.5">
        {events.length ? events.map((event) => <div key={event.id} className="flex items-center gap-2 text-[11px] text-[#5a5a40] dark:text-[#c2c2a8]"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8c8c6d]" /><span className="min-w-0 flex-1 truncate" title={event.title}>{event.title}</span><span className="shrink-0 text-[9px] text-[#9c9c94]">{formatEventDate(event.start)}</span></div>) : <div className="text-[10px] text-[#9c9c94]">No upcoming events</div>}
      </div>
      {clientId ? <button onClick={connectGoogle} disabled={isConnecting} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-[#dadad0] bg-white px-2 py-1 text-[10px] font-semibold text-[#5a5a40] hover:bg-[#ecece4] disabled:opacity-60 dark:border-[#42423b] dark:bg-[#2c2c28] dark:text-[#c2c2a8]"><Cloud className="h-3 w-3" />{isConnecting ? 'Connecting...' : googleToken ? 'Google Calendar connected' : 'Connect Google Calendar'}</button> : <div className="mt-2 flex items-center gap-1 text-[9px] text-[#9c9c94]"><Link2 className="h-3 w-3" />Local calendar only</div>}
    </section>
  );
};