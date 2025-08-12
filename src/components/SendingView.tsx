import React, { useState, useEffect } from 'react';
import { MessageToSend } from '../types';
import Button from './Button';
import { WhatsAppIcon, XCircleIcon } from './Icons';
import ReturnPrompt from './ReturnPrompt';

interface SendingViewProps {
  currentMessage: MessageToSend;
  currentIndex: number;
  totalMessages: number;
  onNext: () => void;
  onCancel: () => void;
}

const WhatsAppBG = () => (
    <div 
        className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-[0.03]"
        style={{
            backgroundColor: '#E5DDD5',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }}
    >
      <div className="absolute inset-0 bg-background dark:bg-background opacity-50 dark:opacity-80"></div>
    </div>
)

const Avatar: React.FC<{ name: string }> = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center ring-2 ring-background">
            <span className="text-xl font-bold text-muted-foreground">{initial}</span>
        </div>
    );
};


const SendingView: React.FC<SendingViewProps> = ({ currentMessage, currentIndex, totalMessages, onNext, onCancel }) => {
  const [isWaitingForReturn, setIsWaitingForReturn] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isWaitingForReturn) {
        setTimeout(() => {
           setIsWaitingForReturn(false);
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
    <div className="h-screen w-screen bg-background flex flex-col font-sans">
      <header className="bg-card text-card-foreground p-3 shadow-md flex items-center gap-3 flex-shrink-0 z-10 border-b">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-muted transition-colors">
          <XCircleIcon className="w-7 h-7"/>
        </button>
        <Avatar name={name} />
        <div>
            <h1 className="text-lg font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground">Sending {currentIndex + 1} of {totalMessages}</p>
        </div>
      </header>
      
      <main className="flex-grow p-4 flex flex-col justify-end relative">
        <WhatsAppBG />
        <div className="w-full max-w-2xl ml-auto flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-500 z-0">
            <div className="bg-whatsapp-sent-bg dark:bg-dark-whatsapp-sent-bg text-gray-800 dark:text-gray-100 rounded-xl rounded-tr-lg p-3 shadow-md max-w-[85%] relative">
                <p className="whitespace-pre-wrap break-words">{personalizedMessage}</p>
                <div className="absolute top-0 -right-2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-whatsapp-sent-bg dark:border-t-dark-whatsapp-sent-bg"></div>
            </div>
        </div>
      </main>
        
      <footer className="flex-shrink-0 p-4 bg-card border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
        {isWaitingForReturn ? (
            <ReturnPrompt onManualContinue={onNext} />
        ) : (
            <div className="space-y-3">
                <Button
                    as="a"
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                    className="w-full !py-3.5"
                    onClick={handleOpenAppClick}
                >
                    <WhatsAppIcon className="w-6 h-6 mr-3"/>
                    1. Tap to Send on WhatsApp
                </Button>
                <p className="text-sm text-center text-muted-foreground px-4">
                   2. Return here for the next message.
                </p>
            </div>
        )}
      </footer>
    </div>
  );
};

export default SendingView;
