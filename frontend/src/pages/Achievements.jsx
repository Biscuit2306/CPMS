import React, { useState } from 'react';
import {
  Bell, Calendar, Briefcase, User, LogOut, Menu, X,
  Award, Trophy, Star, Medal, Target, Crown,
  TrendingUp, Settings, FileText, Building2, Download,
  Share2, ChevronRight, Zap, Gift
} from 'lucide-react';
import { Link } from "react-router-dom";
import '../styles/achievements.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


export default function Achievements() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const stats = [
    { icon: Trophy, label: 'Total Achievements', value: 24, color: 'gold' },
    { icon: Star, label: 'Points Earned', value: 1250, color: 'blue' },
    { icon: Medal, label: 'Badges Unlocked', value: 18, color: 'green' },
    { icon: Crown, label: 'Rank', value: 'Top 10%', color: 'purple' }
  ];

  const achievements = [
    {
      id: 1,
      title: 'First Application',
      description: 'Successfully submitted your first job application',
      icon: '🎯',
      category: 'milestone',
      points: 50,
      date: 'Jan 5, 2026',
      unlocked: true,
      rarity: 'common'
    },
    {
      id: 2,
      title: 'Interview Master',
      description: 'Attended 5 interviews successfully',
      icon: '💼',
      category: 'interview',
      points: 150,
      date: 'Jan 10, 2026',
      unlocked: true,
      rarity: 'rare'
    },
    {
      id: 3,
      title: 'Shortlist Champion',
      description: 'Got shortlisted by 3 different companies',
      icon: '⭐',
      category: 'milestone',
      points: 200,
      date: 'Jan 12, 2026',
      unlocked: true,
      rarity: 'epic'
    },
    {
      id: 4,
      title: 'Early Bird',
      description: 'Applied to a job within first 24 hours of posting',
      icon: '🦅',
      category: 'speed',
      points: 75,
      date: 'Jan 8, 2026',
      unlocked: true,
      rarity: 'uncommon'
    },
    {
      id: 5,
      title: 'Offer Accepted',
      description: 'Received and accepted your first job offer',
      icon: '🎉',
      category: 'milestone',
      points: 500,
      date: 'Jan 15, 2026',
      unlocked: true,
      rarity: 'legendary'
    },
    {
      id: 6,
      title: 'Profile Perfectionist',
      description: 'Completed 100% of your profile',
      icon: '✨',
      category: 'profile',
      points: 100,
      date: 'Jan 3, 2026',
      unlocked: true,
      rarity: 'rare'
    },
    {
      id: 7,
      title: 'Skill Showcase',
      description: 'Add 10 skills to your profile',
      icon: '🔧',
      category: 'profile',
      points: 80,
      date: null,
      unlocked: false,
      rarity: 'uncommon',
      progress: 60
    },
    {
      id: 8,
      title: 'Dream Company',
      description: 'Get placed in a top-tier company',
      icon: '🏆',
      category: 'milestone',
      points: 1000,
      date: null,
      unlocked: false,
      rarity: 'legendary',
      progress: 85
    },
    {
      id: 9,
      title: 'Network Builder',
      description: 'Connect with 50 recruiters',
      icon: '🤝',
      category: 'social',
      points: 120,
      date: null,
      unlocked: false,
      rarity: 'rare',
      progress: 40
    }
  ];

  const badges = [
    { id: 1, name: 'Quick Applicant', icon: '⚡', color: '#f59e0b' },
    { id: 2, name: 'Interview Pro', icon: '💪', color: '#3b82f6' },
    { id: 3, name: 'Top Performer', icon: '🌟', color: '#a855f7' },
    { id: 4, name: 'Resume Expert', icon: '📄', color: '#10b981' },
    { id: 5, name: 'Communication Ace', icon: '💬', color: '#ef4444' },
    { id: 6, name: 'Tech Savvy', icon: '💻', color: '#06b6d4' }
  ];

  const recentActivity = [
    { achievement: 'Offer Accepted', points: '+500', time: '2 hours ago' },
    { achievement: 'Shortlist Champion', points: '+200', time: '4 days ago' },
    { achievement: 'Interview Master', points: '+150', time: '6 days ago' }
  ];

  const filteredAchievements = achievements.filter(ach => 
    selectedCategory === 'all' || ach.category === selectedCategory
  );

  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="achievements">
      <Navbar />

      <div className="achievements__layout">
        {/* Enhanced Sidebar */}
        <aside className={`achievements__sidebar ${sidebarOpen ? 'achievements__sidebar--open' : ''}`}>
          <div className="achievements__sidebar-header">
            <div className="achievements__user-profile">
              <div className="achievements__avatar">JD</div>
              <div className="achievements__user-details">
                <h4>John Doe</h4>
                <p>B.Tech CSE</p>
              </div>
            </div>
          </div>

          <div className="achievements__sidebar-content">
            <nav className="achievements__nav">
              <Link to="/student" className="achievements__nav-item">
                <TrendingUp size={20} />
                <span>Dashboard</span>
              </Link>

              <Link to="/pages/jobdrives" className="achievements__nav-item">
                <Building2 size={20} />
                <span>Job Drives</span>
              </Link>

              <Link to="/applications" className="achievements__nav-item">
                <FileText size={20} />
                <span>Applications</span>
              </Link>

              <Link to="/schedulepage" className="achievements__nav-item">
                <Calendar size={20} />
                <span>Schedule</span>
              </Link>

              <Link
                to="/achievements"
                className="achievements__nav-item achievements__nav-item--active"
              >
                <Award size={20} />
                <span>Achievements</span>
                <div className="achievements__nav-indicator"></div>
              </Link>
              

              <Link to="/profile" className="achievements__nav-item">
                <User size={20} />
                <span>Profile</span>
              </Link>

              <Link to="/settings" className="achievements__nav-item">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          <div className="achievements__sidebar-footer">
            <button className="achievements__logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="achievements__main">
          <div className="achievements__content">
            {/* Header */}
            <div className="achievements__header">
              <div className="achievements__header-text">
                <h2 className="achievements__title">
                  My <span className="highlight-text">Achievements</span>
                </h2>
                <p className="achievements__subtitle">
                  Track your progress and unlock amazing rewards
                </p>
              </div>
              <div className="achievements__actions">
                <button className="achievements__share-btn">
                  <Share2 size={18} />
                  Share
                </button>
                <button className="achievements__download-btn">
                  <Download size={18} />
                  Download Report
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="achievements__stats-grid">
              {stats.map((stat, idx) => (
                <div key={idx} className={`achievements__stat-card achievements__stat-card--${stat.color}`}>
                  <div className="achievements__stat-icon-wrapper">
                    <stat.icon size={32} />
                  </div>
                  <div className="achievements__stat-info">
                    <p className="achievements__stat-label">{stat.label}</p>
                    <p className="achievements__stat-value">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Overview */}
            <div className="achievements__progress-card">
              <div className="achievements__progress-header">
                <h3>Overall Progress</h3>
                <span className="achievements__progress-percentage">{Math.round((unlockedCount / achievements.length) * 100)}%</span>
              </div>
              <div className="achievements__progress-bar-container">
                <div 
                  className="achievements__progress-bar-fill"
                  style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                ></div>
              </div>
              <p className="achievements__progress-text">
                {unlockedCount} of {achievements.length} achievements unlocked
              </p>
            </div>

            {/* Badges Section */}
            <div className="achievements__badges-section">
              <h3 className="achievements__section-title">
                <Medal size={24} />
                Earned Badges
              </h3>
              <div className="achievements__badges-grid">
                {badges.map(badge => (
                  <div key={badge.id} className="achievements__badge-card">
                    <div className="achievements__badge-icon" style={{ backgroundColor: badge.color }}>
                      {badge.icon}
                    </div>
                    <p className="achievements__badge-name">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="achievements__filters">
              <button
                className={`achievements__filter-btn ${selectedCategory === 'all' ? 'achievements__filter-btn--active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              <button
                className={`achievements__filter-btn ${selectedCategory === 'milestone' ? 'achievements__filter-btn--active' : ''}`}
                onClick={() => setSelectedCategory('milestone')}
              >
                Milestones
              </button>
              <button
                className={`achievements__filter-btn ${selectedCategory === 'interview' ? 'achievements__filter-btn--active' : ''}`}
                onClick={() => setSelectedCategory('interview')}
              >
                Interviews
              </button>
              <button
                className={`achievements__filter-btn ${selectedCategory === 'profile' ? 'achievements__filter-btn--active' : ''}`}
                onClick={() => setSelectedCategory('profile')}
              >
                Profile
              </button>
              <button
                className={`achievements__filter-btn ${selectedCategory === 'social' ? 'achievements__filter-btn--active' : ''}`}
                onClick={() => setSelectedCategory('social')}
              >
                Social
              </button>
            </div>

            {/* Achievements Grid */}
            <div className="achievements__grid">
              {filteredAchievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`achievements__card ${achievement.unlocked ? 'achievements__card--unlocked' : 'achievements__card--locked'}`}
                >
                  <div className="achievements__card-header">
                    <div className={`achievements__icon achievements__icon--${achievement.rarity}`}>
                      {achievement.icon}
                    </div>
                    <div className={`achievements__rarity achievements__rarity--${achievement.rarity}`}>
                      {achievement.rarity}
                    </div>
                  </div>

                  <h3 className="achievements__card-title">{achievement.title}</h3>
                  <p className="achievements__card-description">{achievement.description}</p>

                  <div className="achievements__card-footer">
                    <div className="achievements__points">
                      <Zap size={16} />
                      {achievement.points} pts
                    </div>
                    {achievement.unlocked ? (
                      <div className="achievements__date">
                        <Calendar size={14} />
                        {achievement.date}
                      </div>
                    ) : (
                      <div className="achievements__lock">
                        🔒 Locked
                      </div>
                    )}
                  </div>

                  {!achievement.unlocked && achievement.progress && (
                    <div className="achievements__card-progress">
                      <div className="achievements__card-progress-bar">
                        <div 
                          className="achievements__card-progress-fill"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <span className="achievements__card-progress-text">{achievement.progress}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="achievements__activity-card">
              <h3 className="achievements__section-title">
                <TrendingUp size={24} />
                Recent Activity
              </h3>
              <div className="achievements__activity-list">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="achievements__activity-item">
                    <div className="achievements__activity-left">
                      <Trophy size={20} className="achievements__activity-icon" />
                      <div>
                        <p className="achievements__activity-name">{activity.achievement}</p>
                        <p className="achievements__activity-time">{activity.time}</p>
                      </div>
                    </div>
                    <div className="achievements__activity-points">{activity.points}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}