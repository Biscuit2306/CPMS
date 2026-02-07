import React from 'react';
import { Award, Trophy, Medal, Star } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import InterviewFeature from '../InterviewFeature';
import ProjectEvaluator from '../ProjectEvaluator';
import '../../styles/student-css/studentdashboard.css';
import '../../styles/student-css/studentachievements.css';



const StudentAchievements = () => {
  const achievements = [
    { id: 1, title: 'HackerRank Gold Badge', category: 'Coding', date: 'Dec 2025', icon: Trophy, color: '#f59e0b' },
    { id: 2, title: 'AWS Certified Developer', category: 'Certification', date: 'Nov 2025', icon: Award, color: '#06b6d4' },
    { id: 3, title: 'Smart India Hackathon Winner', category: 'Hackathon', date: 'Oct 2025', icon: Medal, color: '#10b981' },
    { id: 4, title: 'GATE Qualified', category: 'Examination', date: 'Sep 2025', icon: Star, color: '#7c3aed' },
    { id: 5, title: 'Best Project Award', category: 'Academic', date: 'Aug 2025', icon: Trophy, color: '#ef4444' },
    { id: 6, title: 'LeetCode 500+ Problems', category: 'Coding', date: 'Dec 2025', icon: Star, color: '#f59e0b' }
  ];

  return (
    <StudentLayout>
      <div className="student-page-header">
        <div>
          <h1>Achievements</h1>
          <p>Your certifications, awards, and accomplishments</p>
        </div>
        <button className="student-add-achievement-btn">
          <Award size={20} />
          Add Achievement
        </button>
      </div>

      <div className="student-achievements-grid">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="student-achievement-card">
            <div className="student-achievement-icon" style={{ backgroundColor: `${achievement.color}15`, color: achievement.color }}>
              <achievement.icon size={32} />
            </div>
            <h3>{achievement.title}</h3>
            <span className="student-achievement-category">{achievement.category}</span>
            <p className="student-achievement-date">{achievement.date}</p>
          </div>
        ))}
      </div>

      <InterviewFeature />
      <ProjectEvaluator />
    </StudentLayout>
  );
};

export default StudentAchievements;