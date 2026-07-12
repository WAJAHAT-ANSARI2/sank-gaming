import React, { useEffect, useState } from 'react';
import { getCalendarEvents } from '../../api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    getCalendarEvents(currentMonth).then(res => setEvents(res.data.events));
  }, [currentMonth]);

  const [year, month] = currentMonth.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const todayStr = new Date().toISOString().split('T')[0];

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(ev => dateStr >= ev.start_date && dateStr <= ev.end_date);
  };

  const changeMonth = (delta) => {
    const d = new Date(year, month - 1 + delta, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthName = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Rental Calendar</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => changeMonth(-1)}>← Prev</button>
          <span style={{ fontFamily: 'Orbitron', fontSize: '0.95rem', minWidth: '160px', textAlign: 'center' }}>{monthName}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => changeMonth(1)}>Next →</button>
        </div>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map(wd => <div key={wd} className="cal-header">{wd}</div>)}
        {cells.map((day, i) => {
          const dateStr = day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
          const dayEvents = getEventsForDay(day);
          return (
            <div key={i} className={`cal-day ${dateStr === todayStr ? 'today' : ''} ${!day ? 'other-month' : ''}`}>
              {day && <div className="cal-day-num">{day}</div>}
              {dayEvents.slice(0, 3).map(ev => (
                <div
                  key={ev.id}
                  className="cal-event"
                  onClick={() => setSelectedEvent(ev)}
                  title={`${ev.cd_title} - ${ev.customer_name}`}
                >
                  {ev.cd_title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{dayEvents.length - 3} more</div>
              )}
            </div>
          );
        })}
      </div>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Rental Details</h3>
            <p><strong>Game:</strong> {selectedEvent.cd_title} ({selectedEvent.platform})</p>
            <p><strong>Customer:</strong> {selectedEvent.customer_name}</p>
            <p><strong>Dates:</strong> {selectedEvent.start_date} → {selectedEvent.end_date}</p>
            <p><strong>Total Price:</strong> Rs. {Number(selectedEvent.total_price).toLocaleString()}</p>
            <p><strong>Delivery:</strong> {selectedEvent.delivery_type === 'delivery'
              ? `🛵 ${selectedEvent.area}, ${selectedEvent.city}${selectedEvent.landmark ? ' (' + selectedEvent.landmark + ')' : ''}`
              : '🏬 Self Pickup'}</p>
            <button className="btn btn-secondary" style={{ marginTop: '1.2rem' }} onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
