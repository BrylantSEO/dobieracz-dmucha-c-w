import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.business_role !== 'admin')) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    const { bookingData } = payload;

    if (!bookingData) {
      return Response.json({ error: 'Missing booking data' }, { status: 400 });
    }

    // 1. Get inflatable details first
    let inflatable;
    try {
      inflatable = await base44.asServiceRole.entities.Inflatable.get(bookingData.inflatable_id);
    } catch (error) {
      return Response.json({ error: 'Dmuchaniec nie znaleziony' }, { status: 404 });
    }

    // 2. Create booking in database
    const booking = await base44.asServiceRole.entities.Booking.create(bookingData);

    // 3. Create availability block
    await base44.asServiceRole.entities.AvailabilityBlock.create({
      inflatable_id: bookingData.inflatable_id,
      reason: 'reserved',
      reason_description: `Rezerwacja: ${bookingData.client_name}`,
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      is_active: true
    });

    // 4. Add to Google Calendar
    let calendarSuccess = false;
    let calendarError = null;
    
    try {
      const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
      
      const eventStartDateTime = `${bookingData.start_date}T${bookingData.start_time || '09:00'}:00`;
      const eventEndDateTime = `${bookingData.end_date}T${bookingData.end_time || '18:00'}:00`;

      const calendarEvent = {
        summary: `🎈 ${inflatable.name} - ${bookingData.client_name}`,
        description: `Rezerwacja dmuchańca\n\nKlient: ${bookingData.client_name}\nTelefon: ${bookingData.client_phone}\nEmail: ${bookingData.client_email}\nAdres: ${bookingData.delivery_address}\nCena: ${bookingData.total_price} zł\n\nNumer rezerwacji: ${booking.booking_number || booking.id}`,
        location: bookingData.delivery_address,
        start: {
          dateTime: eventStartDateTime,
          timeZone: 'Europe/Warsaw'
        },
        end: {
          dateTime: eventEndDateTime,
          timeZone: 'Europe/Warsaw'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 }
          ]
        }
      };

      const calendarResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/cv6i0rbfuj9trj1i9afrk7dnbs@group.calendar.google.com/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(calendarEvent)
        }
      );

      if (!calendarResponse.ok) {
        const errorText = await calendarResponse.text();
        calendarError = `Status ${calendarResponse.status}: ${errorText}`;
        console.error('Google Calendar error:', calendarError);
      } else {
        const calendarData = await calendarResponse.json();
        console.log('Calendar event created:', calendarData.id);
        calendarSuccess = true;
      }
    } catch (error) {
      calendarError = error.message;
      console.error('Failed to create calendar event:', error);
    }

    return Response.json({ 
      success: true, 
      booking: booking,
      calendarAdded: calendarSuccess,
      calendarError: calendarError,
      message: calendarSuccess 
        ? 'Rezerwacja utworzona, dodana do kalendarza i zablokowana w systemie'
        : `Rezerwacja utworzona i zablokowana. Błąd kalendarza: ${calendarError}`
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});