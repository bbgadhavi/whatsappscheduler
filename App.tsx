import React, { useState, useEffect, useCallback } from 'react';
import { AppStatus, MessageToSend, Recipient, SavedTemplates, SavedContactGroups, SentMessage, SentMessageHistory } from './types';
import Input from './components/Input';
import Button from './components/Button';
import StatusDisplay from './components/StatusDisplay';
import SendingView from './components/SendingView';
import { ScheduleIcon, SendIcon, UserPlusIcon, TrashIcon, ArchiveBoxIcon, HistoryIcon } from './components/Icons';
import Logo from './components/Logo';

const App: React.FC = () => {
  // Active state
  const [messageTemplate, setMessageTemplate] = useState<string>(() => {
    return localStorage.getItem('message_scheduler_template') || 'Hi {name}, how are you doing?';
  });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  
  // App logic state
  const [dateInput, setDateInput] = useState<string>('');
  const [timeInput, setTimeInput] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [queue, setQueue] = useState<MessageToSend[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [scheduleTimeoutId, setScheduleTimeoutId] = useState<number | null>(null);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);
  
  // Manual contact entry state
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactNumber, setNewContactNumber] = useState<string>('');

  // Directory/Saved Data State
  const [savedMessageTemplates, setSavedMessageTemplates] = useState<SavedTemplates>({});
  const [savedContactGroups, setSavedContactGroups] = useState<SavedContactGroups>({});
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
  const [selectedContactGroupName, setSelectedContactGroupName] = useState<string>('');
  const [history, setHistory] = useState<SentMessageHistory>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<'scheduler' | 'history'>('scheduler');

  useEffect(() => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('message_scheduler_templates') || '{}');
      setSavedMessageTemplates(savedTemplates);

      const savedGroups = JSON.parse(localStorage.getItem('message_scheduler_contact_groups') || '{}');
      setSavedContactGroups(savedGroups);

      const savedHistory = JSON.parse(localStorage.getItem('message_scheduler_history') || '[]');
      setHistory(savedHistory);
    } catch (error) {
      console.error("Failed to parse saved data from localStorage", error);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('message_scheduler_template', messageTemplate);
  }, [messageTemplate]);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDateInput(`${yyyy}-${mm}-${dd}`);
  }, []);

  const resetState = useCallback(() => {
    setStatus(AppStatus.IDLE);
    setQueue([]);
    setRecipients([]);
    setCurrentIndex(0);
    setErrorMessage('');
    setDateInput(new Date().toISOString().split('T')[0]);
    setTimeInput('');
    setScheduledDateTime(null);
    setSelectedContactGroupName('');
    if (scheduleTimeoutId) {
      clearTimeout(scheduleTimeoutId);
      setScheduleTimeoutId(null);
    }
  }, [scheduleTimeoutId]);

  const normalizePhoneNumber = useCallback((number: string): string | null => {
      const digits = number.replace(/\D/g, '');
      if (digits.length < 10) return null;
      // Simple normalization assuming various country codes, focusing on the last 10 digits as the core number
      if (digits.length > 10) return digits.slice(-10);
      return digits;
  }, []);
  
  const validateAndBuildQueue = (): MessageToSend[] | null => {
    setErrorMessage('');
    if (!messageTemplate.trim()) {
      setErrorMessage('Message template cannot be empty.');
      return null;
    }
    if (recipients.length === 0) {
      setErrorMessage('Recipient list is empty. Please add at least one contact.');
      return null;
    }

    return recipients.map(recipient => ({
      number: recipient.number,
      name: recipient.name,
      personalizedMessage: messageTemplate.replace(/{name}/gi, recipient.name),
    }));
  };
  
  const handleSendNow = () => {
    const newQueue = validateAndBuildQueue();
    if (newQueue) {
      setQueue(newQueue);
      setStatus(AppStatus.SENDING);
      setCurrentIndex(0);
    }
  };

  const handleSchedule = () => {
    const newQueue = validateAndBuildQueue();
    if (!newQueue) return;

    if (!dateInput || !timeInput) {
      setErrorMessage('Please select a valid date and time for scheduling.');
      return;
    }

    const targetDateTime = new Date(`${dateInput}T${timeInput}`);
    if (targetDateTime.getTime() <= Date.now()) {
      setErrorMessage('Scheduled time must be in the future.');
      return;
    }
    
    setQueue(newQueue);
    setScheduledDateTime(targetDateTime);
    setStatus(AppStatus.SCHEDULED);

    const delay = targetDateTime.getTime() - Date.now();
    const timeoutId = setTimeout(() => {
      setStatus(AppStatus.SENDING);
      setCurrentIndex(0);
    }, delay);
    setScheduleTimeoutId(timeoutId);
  };

  const handleCancelSchedule = () => {
    if (scheduleTimeoutId) {
      clearTimeout(scheduleTimeoutId);
    }
    resetState();
  };

  const handleNextInQueue = () => {
    const sentMessage = queue[currentIndex];
    if (sentMessage) {
      const newHistoryEntry: SentMessage = {
        ...sentMessage,
        sentAt: new Date().toISOString(),
      };
      const updatedHistory = [newHistoryEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('message_scheduler_history', JSON.stringify(updatedHistory));
    }

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStatus(AppStatus.DONE);
    }
  };

  const handleAddRecipient = useCallback(() => {
    setErrorMessage('');
    if (!newContactName.trim()) {
      setErrorMessage('Please enter a name.');
      return;
    }
    const normalizedNumber = normalizePhoneNumber(newContactNumber);
    if (!normalizedNumber) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    if (recipients.some(r => r.number === normalizedNumber)) {
      setErrorMessage('This number has already been added.');
      return;
    }

    setRecipients(prev => [...prev, { name: newContactName.trim(), number: normalizedNumber }]);
    setNewContactName('');
    setNewContactNumber('');
  }, [newContactName, newContactNumber, recipients, normalizePhoneNumber]);

  const handleRemoveRecipient = useCallback((index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleImportContacts = useCallback(async () => {
    setErrorMessage('');
    const nav = navigator as any;
    if (!nav.contacts?.select) {
      setErrorMessage('Contact Picker API is not supported on your browser or permission was denied.');
      return;
    }

    try {
      const contacts = await nav.contacts.select(['name', 'tel'], { multiple: true });
      if (!contacts || contacts.length === 0) return;

      const existingNumbers = new Set(recipients.map(r => r.number));
      const newRecipients: Recipient[] = [];
      
      contacts.forEach((contact: any) => {
        const name = contact.name?.[0] || '';
        const tel = contact.tel?.[0] || '';
        const normalizedNumber = normalizePhoneNumber(tel);

        if (normalizedNumber && !existingNumbers.has(normalizedNumber)) {
          newRecipients.push({ name: name || `+${normalizedNumber}`, number: normalizedNumber });
          existingNumbers.add(normalizedNumber);
        }
      });

      if (newRecipients.length > 0) {
        setRecipients(prev => [...prev, ...newRecipients]);
      } else if (contacts.length > 0) {
        setErrorMessage("Selected contacts were already in the list or had no valid numbers.");
      }
    } catch (ex) {
      setErrorMessage('Could not import contacts. Please ensure you have granted permission.');
      console.error("Error importing contacts:", ex);
    }
  }, [recipients, normalizePhoneNumber]);

  const handleSaveTemplate = () => {
    const name = prompt("Enter a name for this message template:");
    if (name?.trim()) {
      const newSavedTemplates = { ...savedMessageTemplates, [name.trim()]: messageTemplate };
      setSavedMessageTemplates(newSavedTemplates);
      localStorage.setItem('message_scheduler_templates', JSON.stringify(newSavedTemplates));
      setSelectedTemplateName(name.trim());
      alert('Template saved!');
    }
  };

  const handleSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedTemplateName(name);
    if (name && savedMessageTemplates[name]) {
      setMessageTemplate(savedMessageTemplates[name]);
    }
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplateName) {
      alert("Please select a template to delete.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete the template "${selectedTemplateName}"?`)) {
      const newSavedTemplates = { ...savedMessageTemplates };
      delete newSavedTemplates[selectedTemplateName];
      setSavedMessageTemplates(newSavedTemplates);
      localStorage.setItem('message_scheduler_templates', JSON.stringify(newSavedTemplates));
      setSelectedTemplateName('');
    }
  };

  const handleSaveContactGroup = () => {
    if (recipients.length === 0) {
      alert("Cannot save an empty group.");
      return;
    }
    const name = prompt("Enter a name for this contact group:");
    if (name?.trim()) {
      const newSavedGroups = { ...savedContactGroups, [name.trim()]: recipients };
      setSavedContactGroups(newSavedGroups);
      localStorage.setItem('message_scheduler_contact_groups', JSON.stringify(newSavedGroups));
      setSelectedContactGroupName(name.trim());
      alert('Contact group saved!');
    }
  };

  const handleSelectContactGroup = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedContactGroupName(name);
    if (name && savedContactGroups[name]) {
      setRecipients(savedContactGroups[name]);
    } else {
      setRecipients([]);
    }
  };
  
  const handleDeleteContactGroup = () => {
    if (!selectedContactGroupName) {
      alert("Please select a contact group to delete.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete the group "${selectedContactGroupName}"?`)) {
      const newSavedGroups = { ...savedContactGroups };
      delete newSavedGroups[selectedContactGroupName];
      setSavedContactGroups(newSavedGroups);
      localStorage.setItem('message_scheduler_contact_groups', JSON.stringify(newSavedGroups));
      
      setSelectedContactGroupName('');
      setRecipients([]);
    }
  };
  
  const handleClearHistory = () => {
    if(window.confirm('Are you sure you want to delete all message history? This action cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('message_scheduler_history');
    }
  };

  if (status === AppStatus.SENDING) {
    return <SendingView currentMessage={queue[currentIndex]} currentIndex={currentIndex} totalMessages={queue.length} onNext={handleNextInQueue} onCancel={resetState} />;
  }
  
  const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-surface dark:bg-surface-dark rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );

  const TabButton: React.FC<{isActive: boolean; onClick: () => void; children: React.ReactNode}> = ({ isActive, children, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center p-4 font-medium text-sm uppercase tracking-wider transition-colors duration-300 focus:outline-none relative ${
            isActive
                ? 'text-primary'
                : 'text-text-secondary dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        aria-current={isActive ? 'page' : undefined}
    >
        {children}
        {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></div>}
    </button>
  );

  return (
    <div className="min-h-screen w-full bg-app-background dark:bg-app-background-dark flex flex-col font-sans">
      <header className="bg-primary text-on-primary p-4 shadow-lg flex items-center gap-4 flex-shrink-0">
        <Logo className="w-10 h-10"/>
        <h1 className="text-xl font-bold">Message Scheduler</h1>
      </header>
      
      <div className="bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark flex flex-shrink-0">
          <TabButton isActive={activeTab === 'scheduler'} onClick={() => setActiveTab('scheduler')}>
              <ScheduleIcon className="w-5 h-5 mr-2" /> Scheduler
          </TabButton>
          <TabButton isActive={activeTab === 'history'} onClick={() => setActiveTab('history')}>
              <HistoryIcon className="w-5 h-5 mr-2" /> History
          </TabButton>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'scheduler' && (
          <div className="p-4 space-y-4">
              <Card>
                <div className="p-4 space-y-4">
                  <h3 className="font-bold text-lg">Message Template</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select value={selectedTemplateName} onChange={handleSelectTemplate} className="select-input">
                      <option value="">Load Template...</option>
                      {Object.keys(savedMessageTemplates).map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <Button onClick={handleSaveTemplate} variant="secondary"><ArchiveBoxIcon className="w-5 h-5 mr-2"/>Save</Button>
                    <Button onClick={handleDeleteTemplate} variant="danger" disabled={!selectedTemplateName}><TrashIcon className="w-5 h-5 mr-2"/>Delete</Button>
                  </div>
                  <Input
                      id="messageTemplate"
                      label="Use {name} as a placeholder"
                      value={messageTemplate}
                      onChange={(e) => setMessageTemplate(e.target.value)}
                      rows={4}
                  />
                </div>
              </Card>

              <Card>
                <div className="p-4 space-y-4">
                  <h3 className="font-bold text-lg">Recipients ({recipients.length})</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select value={selectedContactGroupName} onChange={handleSelectContactGroup} className="select-input">
                      <option value="">Load Group...</option>
                      {Object.keys(savedContactGroups).map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <Button onClick={handleSaveContactGroup} variant="secondary"><ArchiveBoxIcon className="w-5 h-5 mr-2"/>Save</Button>
                    <Button onClick={handleDeleteContactGroup} variant="danger" disabled={!selectedContactGroupName}><TrashIcon className="w-5 h-5 mr-2"/>Delete</Button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-lg border border-border dark:border-border-dark bg-app-background dark:bg-app-background-dark/50">
                    {recipients.length === 0 ? <p className="text-center text-text-secondary dark:text-text-secondary-dark py-4">No recipients added.</p> 
                    : recipients.map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md bg-surface dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-700/50">
                          <div>
                            <p className="font-semibold">{r.name}</p>
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">+{r.number}</p>
                          </div>
                          <button onClick={() => handleRemoveRecipient(i)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">ADD NEW CONTACT</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input id="newContactName" label="Name" type="text" placeholder="Alice" value={newContactName} onChange={e => setNewContactName(e.target.value)} />
                      <Input id="newContactNumber" label="Phone Number" type="tel" placeholder="9876543210" value={newContactNumber} onChange={e => /^\d*$/.test(e.target.value) && setNewContactNumber(e.target.value)} />
                    </div>
                     <div className="flex flex-col sm:flex-row gap-4">
                      <Button onClick={handleAddRecipient} variant="secondary" className="w-full">Add Manually</Button>
                      <Button onClick={handleImportContacts} variant="secondary" className="w-full"><UserPlusIcon className="w-5 h-5 mr-2"/>Import</Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-lg">Schedule (Optional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input id="date" label="Date" type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
                      <Input id="time" label="Time" type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} />
                  </div>
                </div>
              </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4 space-y-4">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Sent History</h3>
                  <Button onClick={handleClearHistory} variant="danger" disabled={history.length === 0} className="text-sm py-2">
                      <TrashIcon className="w-5 h-5 mr-2"/> Clear
                  </Button>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {history.length === 0 ? (
                      <p className="text-center text-text-secondary dark:text-text-secondary-dark py-10">No messages in history.</p>
                  ) : (
                      history.map((msg, index) => (
                          <div key={index} className="p-3 bg-app-background dark:bg-app-background-dark/50 rounded-lg animate-fade-in">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="font-bold">{msg.name}</p>
                                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">To: +{msg.number}</p>
                                  </div>
                                  <p className="text-xs text-text-secondary dark:text-text-secondary-dark whitespace-nowrap">
                                      {new Date(msg.sentAt).toLocaleString()}
                                  </p>
                              </div>
                              <p className="mt-2 p-3 text-sm bg-surface dark:bg-surface-dark/50 rounded-md whitespace-pre-wrap">{msg.personalizedMessage}</p>
                          </div>
                      ))
                  )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {activeTab === 'scheduler' && (
        <footer className="p-4 bg-surface dark:bg-surface-dark border-t border-border dark:border-border-dark flex-shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          {errorMessage && <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-lg text-sm">{errorMessage}</div>}
          
          <StatusDisplay status={status} queueSize={queue.length} scheduledDateTime={scheduledDateTime} onCancelSchedule={handleCancelSchedule} onReset={resetState} />

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button onClick={handleSchedule} disabled={status !== AppStatus.IDLE || recipients.length === 0} variant="secondary"><ScheduleIcon className="w-5 h-5 mr-2"/>Schedule</Button>
            <Button onClick={handleSendNow} disabled={status !== AppStatus.IDLE || recipients.length === 0} variant="primary"><SendIcon className="w-5 h-5 mr-2"/>Send Now</Button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;