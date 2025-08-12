import React from 'react';
import { AppStatus } from '../types';
import Button from './Button';
import { InfoIcon, CheckCircleIcon, ClockIcon } from './Icons';

interface StatusDisplayProps {
  status: AppStatus;
  queueSize: number;
  scheduledDateTime: Date | null;
  onCancelSchedule: () => void;
  onReset: () => void;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, scheduledDateTime, onCancelSchedule, onReset }) => {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  
  const renderStatus = () => {
    switch (status) {
      case AppStatus.SCHEDULED:
        return (
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-primary/10 border-l-4 border-primary text-primary-dark dark:text-blue-300 rounded-r-lg">
            <div className="flex items-center">
              <ClockIcon className="w-6 h-6 mr-3"/>
              <div>
                <p className="font-bold">Messages Scheduled</p>
                <p className="text-sm">For {scheduledDateTime && formatDateTime(scheduledDateTime)}. Keep this tab open.</p>
              </div>
            </div>
            <Button onClick={onCancelSchedule} variant="danger" className="mt-3 sm:mt-0 py-1 px-3 text-xs">Cancel</Button>
          </div>
        );
      case AppStatus.DONE:
        return (
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200 rounded-r-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="w-6 h-6 mr-3"/>
              <p className="font-bold">Process Finished!</p>
            </div>
            <Button onClick={onReset} variant="secondary" className="mt-3 sm:mt-0 py-1 px-3 text-xs">Start Over</Button>
          </div>
        );
      case AppStatus.IDLE:
      default:
        return (
          <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-800/50 border-l-4 border-gray-400 text-text-secondary dark:text-text-secondary-dark rounded-r-lg">
            <InfoIcon className="w-5 h-5 mr-3"/>
            <p className="text-sm">Status: Idle. Ready to send or schedule.</p>
          </div>
        );
    }
  };

  return <div className="mt-1">{renderStatus()}</div>;
};

export default StatusDisplay;
