import React from 'react';
import Button from './Button';
import { ArrowRightIcon, AppSwitcherIcon } from './Icons';

interface ReturnPromptProps {
    onManualContinue: () => void;
}

const ReturnPrompt: React.FC<ReturnPromptProps> = ({ onManualContinue }) => {
    return (
        <div className="text-center p-4 bg-primary/10 dark:bg-primary-dark-theme/10 rounded-lg border-2 border-dashed border-primary/50 dark:border-primary-dark-theme/50">
            <AppSwitcherIcon className="w-12 h-12 mx-auto text-primary dark:text-primary-dark-theme animate-pulse" />
            <h3 className="text-lg font-bold mt-3 text-text-primary dark:text-text-primary-dark">Action Required</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark mt-1 text-sm">
                After sending, please return to this app to continue with the next message.
            </p>
            <Button onClick={onManualContinue} variant="secondary" className="w-full mt-4 text-sm py-2">
                Stuck? Continue Manually
                <ArrowRightIcon className="w-5 h-5 ml-2"/>
            </Button>
        </div>
    );
}

export default ReturnPrompt;