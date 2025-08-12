import React, { useState, useEffect } from 'react';
import { MessageToSend } from '../types';
import Button from './Button';
import { WhatsAppIcon, ArrowRightIcon, XCircleIcon, UserIcon } from './Icons';
import ReturnPrompt from './ReturnPrompt';

interface SendingViewProps {
  currentMessage: MessageToSend;
  currentIndex: number;
  totalMessages: number;
  onNext: () => void;
  onCancel: () => void;
}

const SendingView: React.FC<SendingViewProps> = ({ currentMessage, currentIndex, totalMessages, onNext, onCancel }) => {
  const [isWaitingForReturn, setIsWaitingForReturn] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only trigger 'onNext' if the app becomes visible and we are in the waiting state.
      if (document.visibilityState === 'visible' && isWaitingForReturn) {
        // A short timeout prevents a jarring instant transition if the user switches back very fast.
        setTimeout(() => {
           setIsWaitingForReturn(false); // Reset state to prevent re-triggering
           onNext();
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isWaitingForReturn, onNext]);

  if (!currentMessage) {
    return null; 
  }

  const { number, name, personalizedMessage } = currentMessage;
  const encodedMessage = encodeURIComponent(personalizedMessage);
  const whatsappLink = `https://wa.me/${number}?text=${encodedMessage}`;

  const handleOpenAppClick = () => {
    setIsWaitingForReturn(true);
  };

  return (
    <div className="h-screen w-screen bg-app-background dark:bg-app-background-dark flex flex-col font-sans">
      <header className="bg-primary text-on-primary p-3 shadow-lg flex items-center gap-3 flex-shrink-0">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-black/20 transition-colors">
          <XCircleIcon className="w-7 h-7"/>
        </button>
        <div className="w-10 h-10 rounded-full bg-primary-dark flex items-center justify-center ring-2 ring-white/50">
            <UserIcon className="w-6 h-6" />
        </div>
        <div>
            <h1 className="text-lg font-bold">{name}</h1>
            <p className="text-sm text-on-primary/80">Sending {currentIndex + 1} of {totalMessages}</p>
        </div>
      </header>
      
      <main className="flex-grow p-4 flex flex-col justify-end">
        <div className="w-full max-w-2xl ml-auto flex justify-end">
            <div className="bg-primary text-on-primary rounded-2xl rounded-br-lg p-3 shadow-md max-w-[85%]">
                <p className="whitespace-pre-wrap break-words">{personalizedMessage}</p>
            </div>
        </div>
      </main>
        
      <footer className="flex-shrink-0 p-4 bg-surface dark:bg-surface-dark border-t border-border dark:border-border-dark shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {isWaitingForReturn ? (
            <ReturnPrompt onManualContinue={onNext} />
        ) : (
            <div className="space-y-3">
                <Button
                    as="a"
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    className="w-full !py-4"
                    onClick={handleOpenAppClick}
                >
                    <WhatsAppIcon className="w-6 h-6 mr-3"/>
                    1. Tap to Send on WhatsApp
                </Button>
                <p className="text-sm text-center text-text-secondary dark:text-text-secondary-dark px-4">
                   2. Return here for the next message in the queue.
                </p>
            </div>
        )}
      </footer>
    </div>
  );
};

export default SendingView;