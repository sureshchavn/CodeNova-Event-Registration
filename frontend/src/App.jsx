
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowRight, CalendarDays, Clock3, MapPin, Users,
  Search, Menu, X, Plus, Pencil, Trash2, LayoutDashboard,
  Ticket, LogOut, CheckCircle2, AlertCircle, Sparkles,
  ChevronRight, Filter, Mail, Phone, GraduationCap,
  TrendingUp, CalendarCheck, ShieldCheck
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api";

const categories = [
  "All", "Technology", "Workshop", "Seminar",
  "Cultural", "Sports", "Other"
];

const emptyEvent = {
  title: "",
  description: "",
  category: "Technology",
  date: "",
  time: "",
  venue: "",
  capacity: 100,
  image: "",
  status: "Upcoming",
};

const emptyRegistration = {
  name: "",
  email: "",
  phone: "",
  college: "",
};

function App() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [eventModal, setEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [registrationForm, setRegistrationForm] = useState(emptyRegistration);
  const [adminKey, setAdminKey] = useState("");
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminLoginKey, setAdminLoginKey] = useState("");
  const [toast, setToast] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data.data || []);
    } catch (error) {
      notify(
        error.response?.data?.message ||
        "Unable to load events. Check backend connection.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (key = adminKey) => {
    try {
      const response = await axios.get(`${API}/registrations`, {
        headers: { "x-admin-key": key },
      });
      setRegistrations(response.data.data || []);
      return true;
    } catch (error) {
      notify(
        error.response?.data?.message || "Unable to load registrations.",
        "error"
      );
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory =
        activeCategory === "All" || event.category === activeCategory;

      const searchText = search.toLowerCase();
      const matchesSearch =
        event.title?.toLowerCase().includes(searchText) ||
        event.venue?.toLowerCase().includes(searchText) ||
        event.category?.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [events, activeCategory, search]);

  const totalRegistrations = registrations.length;
  const upcomingEvents = events.filter(
    (event) => event.status === "Upcoming"
  ).length;

  const openRegistration = (event) => {
    setSelectedEvent(event);
    setRegistrationForm(emptyRegistration);
    setRegisterOpen(true);
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmitting(true);

    try {
      await axios.post(`${API}/registrations`, {
        eventId: selectedEvent._id,
        ...registrationForm,
      });

      notify("Registration successful! See you at the event.");
      setRegisterOpen(false);
      setRegistrationForm(emptyRegistration);
      fetchEvents();
    } catch (error) {
      notify(
        error.response?.data?.message || "Registration failed.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const loginAdmin = async (e) => {
    e.preventDefault();

    if (!adminLoginKey.trim()) {
      notify("Please enter your admin key.", "error");
      return;
    }

    const success = await fetchRegistrations(adminLoginKey);

    if (success) {
      setAdminKey(adminLoginKey);
      setAdminAuthenticated(true);
      setActivePage("admin");
      notify("Admin login successful.");
    }
  };

  const logoutAdmin = () => {
    setAdminAuthenticated(false);
    setAdminKey("");
    setAdminLoginKey("");
    setRegistrations([]);
    setActivePage("home");
    notify("Logged out successfully.");
  };

  const openCreateEvent = () => {
    setEditingEvent(null);
    setEventForm(emptyEvent);
    setEventModal(true);
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || "",
      description: event.description || "",
      category: event.category || "Technology",
      date: event.date ? event.date.slice(0, 10) : "",
      time: event.time || "",
      venue: event.venue || "",
      capacity: event.capacity || 100,
      image: event.image || "",
      status: event.status || "Upcoming",
    });
    setEventModal(true);
  };

  const saveEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...eventForm,
        capacity: Number(eventForm.capacity),
      };

      if (editingEvent) {
        await axios.put(
          `${API}/events/${editingEvent._id}`,
          payload,
          { headers: { "x-admin-key": adminKey } }
        );
        notify("Event updated successfully.");
      } else {
        await axios.post(`${API}/events`, payload, {
          headers: { "x-admin-key": adminKey },
        });
        notify("New event created successfully.");
      }

      setEventModal(false);
      await fetchEvents();
      await fetchRegistrations();
    } catch (error) {
      notify(
        error.response?.data?.message || "Unable to save event.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event and all its registrations?")) {
      return;
    }

    try {
      await axios.delete(`${API}/events/${id}`, {
        headers: { "x-admin-key": adminKey },
      });
      notify("Event deleted successfully.");
      await fetchEvents();
      await fetchRegistrations();
    } catch (error) {
      notify(error.response?.data?.message || "Delete failed.", "error");
    }
  };

  const updateRegistration = async (id, status) => {
    try {
      await axios.put(
        `${API}/registrations/${id}`,
        { status },
        { headers: { "x-admin-key": adminKey } }
      );
      notify("Registration status updated.");
      await fetchRegistrations();
      await fetchEvents();
    } catch (error) {
      notify(
        error.response?.data?.message || "Unable to update registration.",
        "error"
      );
    }
  };

  const deleteRegistration = async (id) => {
    if (!window.confirm("Delete this registration permanently?")) return;

    try {
      await axios.delete(`${API}/registrations/${id}`, {
        headers: { "x-admin-key": adminKey },
      });
      notify("Registration deleted.");
      await fetchRegistrations();
      await fetchEvents();
    } catch (error) {
      notify(
        error.response?.data?.message || "Unable to delete registration.",
        "error"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date TBA";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatLongDate = (date) => {
    if (!date) return "Date TBA";
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const scrollToEvents = () => {
    setActivePage("home");
    setMobileMenu(false);
    setTimeout(() => {
      document.getElementById("events")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  };

  const closeMenus = () => setMobileMenu(false);

  return (
    <div className="app-shell">
      <header className="navbar">
        <a className="brand" href="#" onClick={() => setActivePage("home")}>
          <span className="brand-icon"><CalendarCheck size={22} /></span>
          <span>eventora<span className="brand-dot">.</span></span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle navigation"
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>

        <nav className={`nav-links ${mobileMenu ? "nav-open" : ""}`}>
          <button
            className={activePage === "home" ? "nav-link active" : "nav-link"}
            onClick={() => {
              setActivePage("home");
              closeMenus();
            }}
          >
            Discover Events
          </button>
          <button className="nav-link" onClick={scrollToEvents}>
            Explore
          </button>
          <button
            className="nav-link"
            onClick={() => {
              setActivePage(adminAuthenticated ? "admin" : "login");
              closeMenus();
            }}
          >
            {adminAuthenticated ? "Dashboard" : "Admin"}
          </button>
        </nav>

        <button className="nav-cta" onClick={scrollToEvents}>
          Find an event <ArrowRight size={16} />
        </button>
      </header>

      {activePage === "home" && (
        <main>
          <section className="hero">
            <div className="hero-content">
              <div className="eyebrow">
                <Sparkles size={15} /> Discover. Connect. Experience.
              </div>
              <h1>
                Moments that
                <br />
                <span>bring us together.</span>
              </h1>
              <p>
                Discover inspiring events, meet incredible people, and
                create experiences worth remembering.
              </p>
              <div className="hero-actions">
                <button className="primary-button" onClick={scrollToEvents}>
                  Explore events <ArrowRight size={18} />
                </button>
                <span className="hero-note">
                  <ShieldCheck size={16} /> Simple & secure registration
                </span>
              </div>
              <div className="hero-stats">
                <div><strong>{events.length}+</strong><span>Events listed</span></div>
                <div><strong>{upcomingEvents}</strong><span>Upcoming events</span></div>
                <div><strong>100%</strong><span>Free discovery</span></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-orb orb-one"></div>
              <div className="hero-orb orb-two"></div>
              <div className="hero-image-card">
                <div className="hero-image-placeholder">
                  <div className="floating-date">
                    <span>15</span>
                    <small>NOV</small>
                  </div>
                  <div className="hero-image-caption">
                    <span className="live-dot"></span>
                    Your next experience starts here
                  </div>
                </div>
                <div className="hero-card-bottom">
                  <div>
                    <strong>Make it memorable.</strong>
                    <span>Find your community</span>
                  </div>
                  <span className="hero-card-icon"><Ticket size={22} /></span>
                </div>
              </div>
              <div className="floating-tag tag-top">
                <Sparkles size={15} /> New experiences
              </div>
              <div className="floating-tag tag-bottom">
                <Users size={16} /> Connect with people
              </div>
            </div>
          </section>

          <section className="trust-strip">
            <span>THE PLACE TO DISCOVER</span>
            <div><CalendarDays size={17} /> Workshops</div>
            <div><Sparkles size={17} /> Conferences</div>
            <div><Users size={17} /> Community events</div>
            <div><Ticket size={17} /> Experiences</div>
          </section>

          <section className="events-section" id="events">
            <div className="section-heading">
              <div>
                <div className="eyebrow section-eyebrow">CURATED FOR YOU</div>
                <h2>Explore <span>what's happening.</span></h2>
                <p>Find your next opportunity to learn, connect and grow.</p>
              </div>
              <div className="event-count">
                <strong>{filteredEvents.length.toString().padStart(2, "0")}</strong>
                <span>EVENTS FOUND</span>
              </div>
            </div>

            <div className="event-toolbar">
              <div className="category-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={activeCategory === category ? "category-chip selected" : "category-chip"}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                />
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="loader"></div>
                <p>Finding great events for you...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><CalendarDays size={30} /></div>
                <h3>No events found</h3>
                <p>Try another category or search term, or check back later.</p>
                <button
                  className="outline-button"
                  onClick={() => {
                    setActiveCategory("All");
                    setSearch("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="event-grid">
                {filteredEvents.map((event, index) => (
                  <article className="event-card" key={event._id}>
                    <div className={`event-card-image image-tone-${index % 4}`}>
                      {event.image ? (
                        <img src={event.image} alt={event.title} />
                      ) : (
                        <div className="event-art">
                          <span className="art-circle"></span>
                          <span className="art-line"></span>
                          <span className="art-label">{event.category}</span>
                          <CalendarDays size={54} strokeWidth={1.1} />
                        </div>
                      )}
                      <span className="event-category">{event.category}</span>
                      <span className={`event-status ${event.status?.toLowerCase()}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="event-card-body">
                      <div className="event-date">
                        <CalendarDays size={15} /> {formatDate(event.date)}
                      </div>
                      <h3>{event.title}</h3>
                      <p className="event-description">{event.description}</p>
                      <div className="event-meta">
                        <span><MapPin size={15} /> {event.venue}</span>
                        <span><Clock3 size={15} /> {event.time}</span>
                      </div>
                      <div className="event-card-footer">
                        <span className="seats-info">
                          <Users size={15} />
                          {event.availableSeats ?? event.capacity} seats left
                        </span>
                        <button
                          className="card-register-button"
                          disabled={
                            event.status !== "Upcoming" ||
                            event.availableSeats === 0 ||
                            new Date(event.date) < new Date()
                          }
                          onClick={() => openRegistration(event)}
                        >
                          Register <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="bottom-cta">
            <div className="cta-icon"><Sparkles size={27} /></div>
            <div>
              <span>YOUR NEXT CHAPTER STARTS HERE</span>
              <h2>Don't just scroll. <em>Show up.</em></h2>
              <p>Discover events that make every moment count.</p>
            </div>
            <button className="primary-button" onClick={scrollToEvents}>
              Find your event <ArrowRight size={17} />
            </button>
          </section>
        </main>
      )}

      {activePage === "login" && (
        <main className="login-page">
          <div className="login-card">
            <div className="login-icon"><ShieldCheck size={28} /></div>
            <div className="eyebrow">RESTRICTED ACCESS</div>
            <h2>Welcome back, <span>Admin.</span></h2>
            <p>Enter your admin access key to manage events and registrations.</p>
            <form onSubmit={loginAdmin}>
              <label>Admin access key</label>
              <input
                type="password"
                value={adminLoginKey}
                onChange={(e) => setAdminLoginKey(e.target.value)}
                placeholder="Enter your admin key"
                required
              />
              <button className="primary-button full-button" type="submit">
                Access dashboard <ArrowRight size={17} />
              </button>
            </form>
            <button className="back-link" onClick={() => setActivePage("home")}>
              <ChevronRight size={15} className="back-arrow" /> Back to events
            </button>
          </div>
        </main>
      )}

      {activePage === "admin" && adminAuthenticated && (
        <main className="admin-page">
          <div className="admin-header">
            <div>
              <div className="eyebrow">EVENTORA MANAGEMENT</div>
              <h1>Admin <span>Dashboard</span></h1>
              <p>Manage your events and keep track of registrations.</p>
            </div>
            <button className="outline-button" onClick={logoutAdmin}>
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card">
              <span className="stat-icon purple"><CalendarDays /></span>
              <div><span>Total events</span><strong>{events.length}</strong></div>
            </div>
            <div className="admin-stat-card">
              <span className="stat-icon blue"><CalendarCheck /></span>
              <div><span>Upcoming events</span><strong>{upcomingEvents}</strong></div>
            </div>
            <div className="admin-stat-card">
              <span className="stat-icon orange"><Users /></span>
              <div><span>Registrations</span><strong>{totalRegistrations}</strong></div>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-heading">
              <div>
                <h2>Manage events</h2>
                <p>Create and update your event listings.</p>
              </div>
              <button className="primary-button" onClick={openCreateEvent}>
                <Plus size={17} /> Add new event
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Registrations</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td>
                        <div className="table-event">
                          <div className="table-event-icon"><CalendarDays size={18} /></div>
                          <div><strong>{event.title}</strong><span>{event.venue}</span></div>
                        </div>
                      </td>
                      <td>{formatDate(event.date)}</td>
                      <td><span className="table-category">{event.category}</span></td>
                      <td>{event.registeredCount || 0} / {event.capacity}</td>
                      <td><span className={`status-pill ${event.status?.toLowerCase()}`}>{event.status}</span></td>
                      <td>
                        <div className="table-actions">
                          <button title="Edit event" onClick={() => openEditEvent(event)}><Pencil size={16} /></button>
                          <button className="delete-action" title="Delete event" onClick={() => deleteEvent(event._id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr><td colSpan="6" className="table-empty">No events created yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-heading">
              <div>
                <h2>Registrations</h2>
                <p>View and manage attendee registrations.</p>
              </div>
              <button className="outline-button" onClick={() => fetchRegistrations()}>
                Refresh <TrendingUp size={15} />
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Attendee</th>
                    <th>Event</th>
                    <th>Contact</th>
                    <th>College</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration._id}>
                      <td><strong>{registration.name}</strong></td>
                      <td>{registration.event?.title || "Event deleted"}</td>
                      <td>
                        <div className="contact-cell">
                          <span><Mail size={13} /> {registration.email}</span>
                          <span><Phone size={13} /> {registration.phone}</span>
                        </div>
                      </td>
                      <td>{registration.college || "—"}</td>
                      <td>
                        <span className={`status-pill ${registration.status.toLowerCase()}`}>
                          {registration.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {registration.status === "Registered" ? (
                            <button
                              title="Cancel registration"
                              onClick={() => updateRegistration(registration._id, "Cancelled")}
                            >
                              <X size={16} />
                            </button>
                          ) : (
                            <button
                              title="Restore registration"
                              onClick={() => updateRegistration(registration._id, "Registered")}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button
                            className="delete-action"
                            title="Delete registration"
                            onClick={() => deleteRegistration(registration._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr><td colSpan="6" className="table-empty">No registrations yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      <footer className="footer">
        <a className="brand footer-brand" href="#" onClick={() => setActivePage("home")}>
          <span className="brand-icon"><CalendarCheck size={20} /></span>
          <span>eventora<span className="brand-dot">.</span></span>
        </a>
        <p>Bringing people and experiences together.</p>
        <span>© {new Date().getFullYear()} Eventora. Built for meaningful moments.</span>
      </footer>

      {registerOpen && selectedEvent && (
        <div className="modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setRegisterOpen(false);
        }}>
          <div className="modal-card">
            <button className="modal-close" onClick={() => setRegisterOpen(false)}><X /></button>
            <div className="modal-kicker"><Ticket size={15} /> EVENT REGISTRATION</div>
            <h2>Save your <span>spot.</span></h2>
            <p className="modal-event-title">{selectedEvent.title}</p>
            <div className="modal-event-meta">
              <span><CalendarDays size={15} /> {formatLongDate(selectedEvent.date)}</span>
              <span><MapPin size={15} /> {selectedEvent.venue}</span>
            </div>
            <form className="modal-form" onSubmit={submitRegistration}>
              <div className="form-field">
                <label>Full name *</label>
                <input
                  required
                  minLength="2"
                  value={registrationForm.name}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-field">
                <label>Email address *</label>
                <input
                  required
                  type="email"
                  value={registrationForm.email}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <div className="form-field">
                <label>Phone number *</label>
                <input
                  required
                  type="tel"
                  pattern="[0-9+\-\s]{10,15}"
                  value={registrationForm.phone}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-field">
                <label>College / Organization</label>
                <input
                  value={registrationForm.college}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, college: e.target.value })}
                  placeholder="Your college or organization"
                />
              </div>
              <button className="primary-button full-button" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Confirm registration"}
                <ArrowRight size={17} />
              </button>
              <span className="form-security"><ShieldCheck size={14} /> Your details are handled securely.</span>
            </form>
          </div>
        </div>
      )}

      {eventModal && (
        <div className="modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setEventModal(false);
        }}>
          <div className="modal-card event-form-modal">
            <button className="modal-close" onClick={() => setEventModal(false)}><X /></button>
            <div className="modal-kicker"><CalendarDays size={15} /> EVENT MANAGEMENT</div>
            <h2>{editingEvent ? "Edit your" : "Create an"} <span>event.</span></h2>
            <form className="modal-form" onSubmit={saveEvent}>
              <div className="form-field">
                <label>Event title *</label>
                <input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Enter event title" />
              </div>
              <div className="form-field">
                <label>Description *</label>
                <textarea required rows="3" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Describe your event" />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Category *</label>
                  <select value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}>
                    {categories.filter((c) => c !== "All").map((category) => <option key={category}>{category}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={eventForm.status} onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}>
                    <option>Upcoming</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Date *</label>
                  <input required type="date" min={new Date().toISOString().slice(0, 10)} value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Time *</label>
                  <input required value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} placeholder="e.g. 10:00 AM" />
                </div>
              </div>
              <div className="form-field">
                <label>Venue *</label>
                <input required value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} placeholder="Event location" />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Capacity *</label>
                  <input required type="number" min="1" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Image URL (optional)</label>
                  <input value={eventForm.image} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <button className="primary-button full-button" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingEvent ? "Save changes" : "Create event"}
                <ArrowRight size={17} />
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast-message ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
          {toast.message}
          <button onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}
    </div>
  );
}

export default App;
