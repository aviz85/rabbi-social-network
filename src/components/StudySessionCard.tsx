import React, { useState, useEffect } from 'react';
import { Clock, Users, Calendar, Video, BookOpen, Loader2 } from 'lucide-react';
import { StudySession } from '../types';
import apiService from '../services/api';

interface StudySessionCardProps {
  session: StudySession;
  onSessionUpdate?: (sessionId: string, updates: Partial<StudySession>) => void;
}

const StudySessionCard: React.FC<StudySessionCardProps> = ({ session, onSessionUpdate }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(session.participants.length);

  useEffect(() => {
    // Check registration status
    const checkRegistrationStatus = async () => {
      try {
        const status = await apiService.getSessionRegistrationStatus(parseInt(session.id));
        setIsRegistered(status.registered);
      } catch (error) {
        console.error('Error checking registration status:', error);
      }
    };
    checkRegistrationStatus();
  }, [session.id]);

  const handleRegistration = async () => {
    if (registering) return;
    
    setRegistering(true);
    try {
      const response = await apiService.registerForSession(parseInt(session.id));
      setIsRegistered(response.registered);
      setCurrentParticipants(response.participants);
      
      // Notify parent component of the update
      onSessionUpdate?.(session.id, { 
        participants: Array(response.participants).fill({}) // Update participant count
      });
    } catch (error) {
      console.error('Error registering for session:', error);
    } finally {
      setRegistering(false);
    }
  };
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isSessionFull = currentParticipants >= session.maxParticipants;
  const spotsLeft = session.maxParticipants - currentParticipants;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 space-x-reverse mb-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">שיעור לימוד</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{session.description}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 ml-2" />
          <span>{formatDate(session.startTime)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 ml-2" />
          <span>{session.duration} דקות</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 ml-2" />
          <span>
            {currentParticipants} משתתפים מתוך {session.maxParticipants}
          </span>
          {!isSessionFull && (
            <span className="text-green-600 font-medium mr-2">
              ({spotsLeft} מקומות פנויים)
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Video className="h-4 w-4 ml-2" />
          <span>שיעור וירטואלי</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {session.host.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{session.host.name}</p>
            <p className="text-xs text-gray-500">{session.host.title}</p>
          </div>
        </div>
        <button
          onClick={handleRegistration}
          disabled={isSessionFull || registering}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 space-x-reverse ${
            isSessionFull
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isRegistered
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${registering ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {registering ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>...</span>
            </>
          ) : isRegistered ? (
            'רשום'
          ) : isSessionFull ? (
            'מלא'
          ) : (
            'הרשמה'
          )}
        </button>
      </div>
    </div>
  );
};

export default StudySessionCard;
