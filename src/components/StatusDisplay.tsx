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
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-primary/10 border-l-4 border-primary text-primary rounded-r-lg animate-in fade-in">
            <div className="flex items-center">
              <ClockIcon className="w-6 h-6 mr-3"/>
              <div>
                <p className="font-bold">Messages Scheduled</p>
                <p className="text-sm">For {scheduledDateTime && formatDateTime(scheduledDateTime)}. Keep this tab open.</p>
              </div>
            </div>
            <Button onClick={onCancelSchedule} variant="destructiveOutline" className="mt-3 sm:mt-0 py-1 px-3 h-auto text-xs">Cancel</Button>
          </div>
        );
      case AppStatus.DONE:
        return (
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-secondary/10 border-l-4 border-secondary text-green-600 dark:text-secondary rounded-r-lg animate-in fade-in">
            <div className="flex items-center">
              <CheckCircleIcon className="w-6 h-6 mr-3 text-secondary"/>
              <p className="font-bold">Process Finished!</p>
            </div>
            <Button onClick={onReset} variant="outline" className="mt-3 sm:mt-0 py-1 px-3 h-auto text-xs">Start Over</Button>
          </div>
        );
      case AppStatus.IDLE:
      default:
        return (
          <div className="flex items-center p-3 bg-muted/80 border-l-4 border-muted-foreground/30 text-muted-foreground rounded-r-lg">
            <InfoIcon className="w-5 h-5 mr-3"/>
            <p className="text-sm">Status: Idle. Ready to send or schedule.</p>
          </div>
        );
    }
  };

  return <div className="mt-1">{renderStatus()}</div>;
};

export default StatusDisplay;
