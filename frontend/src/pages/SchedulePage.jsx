import React, { useState } from 'react';
import { Bell, Calendar, Briefcase, FileText, User, LogOut, Menu, X, TrendingUp, Users, CheckCircle, Home, Settings, Award, Clock, MapPin, Video, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../styles/schedulepage.css';
import { Link } from "react-router-dom";

export default function SchedulePage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week');

    const upcomingEvents = [
        {
            id: 1,
            title: 'Google Technical Interview',
            company: 'Google',
            date: 'Jan 15, 2026',
            time: '10:00 AM - 11:30 AM',
            type: 'Interview',
            mode: 'Virtual',
            location: 'Google Meet',
            status: 'Upcoming',
            logo: '🔵'
        },
        {
            id: 2,
            title: 'Microsoft Aptitude Test',
            company: 'Microsoft',
            date: 'Jan 16, 2026',
            time: '2:00 PM - 4:00 PM',
            type: 'Test',
            mode: 'Online',
            location: 'Assessment Portal',
            status: 'Upcoming',
            logo: '🟦'
        },
        {
            id: 3,
            title: 'Amazon Coding Round',
            company: 'Amazon',
            date: 'Jan 18, 2026',
            time: '11:00 AM - 1:00 PM',
            type: 'Test',
            mode: 'Online',
            location: 'HackerRank',
            status: 'Upcoming',
            logo: '🟠'
        },
        {
            id: 4,
            title: 'TCS HR Interview',
            company: 'TCS',
            date: 'Jan 19, 2026',
            time: '3:00 PM - 4:00 PM',
            type: 'Interview',
            mode: 'In-Person',
            location: 'Campus - Room 301',
            status: 'Upcoming',
            logo: '💙'
        },
        {
            id: 5,
            title: 'Infosys Group Discussion',
            company: 'Infosys',
            date: 'Jan 20, 2026',
            time: '9:00 AM - 10:30 AM',
            type: 'Group Discussion',
            mode: 'In-Person',
            location: 'Campus - Auditorium',
            status: 'Upcoming',
            logo: '💜'
        }
    ];

    const todayEvents = upcomingEvents.filter(event => event.date === 'Jan 15, 2026');
    const thisWeekEvents = upcomingEvents.slice(0, 3);

    const getEventTypeColor = (type) => {
        const colors = {
            'Interview': 'interview',
            'Test': 'test',
            'Group Discussion': 'gd'
        };
        return colors[type] || 'default';
    };

    return (
        <div className="schedule-page">
            <Navbar />

            <div className="schedule-page__layout">
                <aside className={`schedule-page__sidebar ${sidebarOpen ? 'schedule-page__sidebar--open' : ''}`}>
                    <div className="schedule-page__sidebar-header">
                        <div className="schedule-page__user-profile">
                            <div className="schedule-page__avatar">JD</div>
                            <div className="schedule-page__user-details">
                                <h4>John Doe</h4>
                                <p>B.Tech CSE</p>
                            </div>
                        </div>
                    </div>

                    <div className="schedule-page__sidebar-content">
                        <nav className="schedule-page__nav">
                            <Link
                                to="/student"
                                className="student-dashboard__nav-item"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Briefcase size={20} />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/pages/jobdrives"
                                className="student-dashboard__nav-item"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Briefcase size={20} />
                                <span>Job Drives</span>
                            </Link>
                            <Link
                                to="/applications"
                                className="student-dashboard__nav-item"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Briefcase size={20} />
                                <span>Applications</span>
                            </Link>
                            <button className="schedule-page__nav-item schedule-page__nav-item--active">
                                <Calendar size={20} />
                                <span>Schedule</span>
                                <div className="schedule-page__nav-indicator"></div>
                            </button>
                            <button className="schedule-page__nav-item">
                                <Award size={20} />
                                <span>Achievements</span>
                            </button>
                            <button className="schedule-page__nav-item">
                                <User size={20} />
                                <span>Profile</span>
                            </button>
                            <button className="schedule-page__nav-item">
                                <Settings size={20} />
                                <span>Settings</span>
                            </button>
                        </nav>
                    </div>

                    <div className="schedule-page__sidebar-footer">
                        <button className="schedule-page__logout-btn">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                <main className="schedule-page__main">
                    <div className="schedule-page__content">
                        <div className="schedule-page__header">
                            <div className="schedule-page__header-left">
                                <h2>
                                    Your <span className="highlight-name">Schedule</span>
                                </h2>
                                <p>Manage all your interviews, tests, and placement events</p>
                            </div>
                            <div className="schedule-page__header-actions">
                                <button className="schedule-page__filter-btn">
                                    <Filter size={18} />
                                    Filter
                                </button>
                            </div>
                        </div>

                        <div className="schedule-page__stats-grid">
                            <div className="schedule-page__stat-card schedule-page__stat-card--blue">
                                <div className="schedule-page__stat-icon-wrapper">
                                    <Calendar size={24} />
                                </div>
                                <div className="schedule-page__stat-info">
                                    <p className="schedule-page__stat-label">Total Events</p>
                                    <p className="schedule-page__stat-value">5</p>
                                    <span className="schedule-page__stat-change">This Week</span>
                                </div>
                            </div>
                            <div className="schedule-page__stat-card schedule-page__stat-card--green">
                                <div className="schedule-page__stat-icon-wrapper">
                                    <Clock size={24} />
                                </div>
                                <div className="schedule-page__stat-info">
                                    <p className="schedule-page__stat-label">Today</p>
                                    <p className="schedule-page__stat-value">{todayEvents.length}</p>
                                    <span className="schedule-page__stat-change">Event{todayEvents.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <div className="schedule-page__stat-card schedule-page__stat-card--orange">
                                <div className="schedule-page__stat-icon-wrapper">
                                    <Users size={24} />
                                </div>
                                <div className="schedule-page__stat-info">
                                    <p className="schedule-page__stat-label">Interviews</p>
                                    <p className="schedule-page__stat-value">2</p>
                                    <span className="schedule-page__stat-change">Upcoming</span>
                                </div>
                            </div>
                        </div>

                        <div className="schedule-page__content-grid">
                            <div className="schedule-page__card schedule-page__card--wide">
                                <div className="schedule-page__card-header">
                                    <h3 className="schedule-page__card-title">
                                        <Calendar className="schedule-page__title-icon" size={24} />
                                        Upcoming Events
                                    </h3>
                                    <button className="schedule-page__view-all-btn">View All</button>
                                </div>
                                <div className="schedule-page__event-list">
                                    {upcomingEvents.map(event => (
                                        <div key={event.id} className={`schedule-page__event-item schedule-page__event-item--${getEventTypeColor(event.type)}`}>
                                            <div className="schedule-page__event-header">
                                                <div className="schedule-page__event-title-wrapper">
                                                    <h4 className="schedule-page__event-title">{event.title}</h4>
                                                    <p className="schedule-page__event-company">{event.company}</p>
                                                </div>
                                                <div className="schedule-page__event-logo">{event.logo}</div>
                                            </div>
                                            <div className="schedule-page__event-details">
                                                <div className="schedule-page__event-detail">
                                                    <Calendar size={16} />
                                                    <span>{event.date}</span>
                                                </div>
                                                <div className="schedule-page__event-detail">
                                                    <Clock size={16} />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="schedule-page__event-detail">
                                                    {event.mode === 'Virtual' || event.mode === 'Online' ? (
                                                        <Video size={16} />
                                                    ) : (
                                                        <MapPin size={16} />
                                                    )}
                                                    <span>{event.location}</span>
                                                </div>
                                            </div>
                                            <div className="schedule-page__event-footer">
                                                <span className={`schedule-page__event-type schedule-page__event-type--${getEventTypeColor(event.type)}`}>
                                                    {event.type}
                                                </span>
                                                <div className="schedule-page__event-actions">
                                                    <button className="schedule-page__action-btn">View Details</button>
                                                    <button className="schedule-page__action-btn">Add to Calendar</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="schedule-page__card">
                                <div className="schedule-page__card-header">
                                    <h3 className="schedule-page__card-title">
                                        <Clock className="schedule-page__title-icon" size={24} />
                                        Today's Schedule
                                    </h3>
                                </div>
                                <div className="schedule-page__quick-view">
                                    {todayEvents.length > 0 ? (
                                        todayEvents.map(event => (
                                            <div key={event.id} className="schedule-page__today-item">
                                                <div className="schedule-page__today-time">
                                                    <Clock size={16} />
                                                    {event.time}
                                                </div>
                                                <div className="schedule-page__today-title">{event.title}</div>
                                                <div className="schedule-page__today-location">
                                                    {event.mode === 'Virtual' || event.mode === 'Online' ? (
                                                        <Video size={14} />
                                                    ) : (
                                                        <MapPin size={14} />
                                                    )}
                                                    {event.location}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="schedule-page__empty-state">
                                            <Calendar size={64} />
                                            <p>No events scheduled for today</p>
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginTop: '2rem' }}>
                                    <h3 className="schedule-page__card-title" style={{ marginBottom: '1rem' }}>
                                        <Users className="schedule-page__title-icon" size={24} />
                                        This Week
                                    </h3>
                                    <div className="schedule-page__week-summary">
                                        {thisWeekEvents.map(event => (
                                            <div key={event.id} className="schedule-page__week-item">
                                                <div className="schedule-page__week-date">
                                                    <span className="schedule-page__week-day">{event.date.split(' ')[1].replace(',', '')}</span>
                                                    <span className="schedule-page__week-month">{event.date.split(' ')[0]}</span>
                                                </div>
                                                <div className="schedule-page__week-info">
                                                    <div className="schedule-page__week-title">{event.company}</div>
                                                    <div className="schedule-page__week-type">{event.type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}