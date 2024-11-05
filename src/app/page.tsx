'use client';
import { useState, useEffect, useRef } from 'react';
import { CardSubmission } from '@/utils/airtable';
import { Magic } from 'magic-sdk';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ThumbsUp, PartyPopper, LogOut } from "lucide-react";

let magic: Magic | null = null;

interface NeynarResponse {
  fid: string;
  [key: string]: unknown;
}

interface MagicSDKError {
  message: string;
  code: string;
  [key: string]: unknown;
}

interface AuthState {
  isLoggedIn: boolean;
  userIdentifier: string;
  authenticationType: 'email' | 'farcaster' | null;
}

declare global {
  interface Window {
    onSignInSuccess?: ((data: NeynarResponse) => void) | undefined;
  }
}

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl font-bold bg-gradient-to-r from-primary/90 to-primary/60 bg-clip-text text-transparent mb-4">
    {children}
  </h3>
);

const Notification: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <ThumbsUp className="h-5 w-5" />
      <p className="font-medium">{message}</p>
    </div>
  </div>
);

const SuccessScreen: React.FC<{ onSubmitAnother: () => void }> = ({ onSubmitAnother }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <div className="mb-6">
      <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4" />
    </div>
    <h2 className="text-3xl font-bold mb-4">Thanks for Your Submission!</h2>
    <p className="text-lg text-muted-foreground mb-8 max-w-md">
      Your card has been successfully submitted to the Dramanoes team for review. We&apos;ll be in touch soon!
    </p>
    <Button onClick={onSubmitAnother} size="lg">
      Submit Another Card
    </Button>
  </div>
);

interface CardTypeOptionProps {
  type: string;
  isSelected: boolean;
  onClick: () => void;
}

const CardTypeOption: React.FC<CardTypeOptionProps> = ({ type, isSelected, onClick }) => (
  <Card 
    className={`cursor-pointer transition-all duration-200 hover:border-primary ${
      isSelected ? "border-primary border-2" : ""
    }`}
    onClick={onClick}
  >
    <CardContent className="p-4 text-center">
      <h3 className="font-semibold">{type}</h3>
    </CardContent>
  </Card>
);

const TypeSelector: React.FC<{
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
}> = ({ options, selectedValue, onChange }) => (
  <div className="flex justify-center">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
      {options.map((option) => (
        <CardTypeOption
          key={option}
          type={option}
          isSelected={selectedValue === option}
          onClick={() => onChange(option)}
        />
      ))}
    </div>
  </div>
);

const Home: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    userIdentifier: '',
    authenticationType: null
  });
  const [email, setEmail] = useState('');
  const [cardType, setCardType] = useState<'Annoy' | 'Blame' | 'Flaw' | ''>('');
  const [subType, setSubType] = useState('');
  const [cardText, setCardText] = useState('');
  const [flawName, setFlawName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isMagicReady, setIsMagicReady] = useState(false);
  const [farcasterFid, setFarcasterFid] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const farcasterContainerRef = useRef<HTMLDivElement>(null);

  const displayNotification = (message: string): void => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const initializeFarcasterButton = (): void => {
    if (farcasterContainerRef.current) {
      // Clean up existing content and scripts
      farcasterContainerRef.current.innerHTML = '';
      const existingScript = document.querySelector('script[src="https://neynarxyz.github.io/siwn/raw/1.2.0/index.js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create new button
      const buttonDiv = document.createElement('div');
      buttonDiv.className = 'neynar_signin';
      buttonDiv.setAttribute('data-client_id', process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || '');
      buttonDiv.setAttribute('data-success-callback', 'onSignInSuccess');
      buttonDiv.setAttribute('data-theme', 'light');
      farcasterContainerRef.current.appendChild(buttonDiv);

      // Create and append new script
      const script = document.createElement('script');
      script.src = 'https://neynarxyz.github.io/siwn/raw/1.2.0/index.js';
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const handleLogout = () => {
    setAuthState({
      isLoggedIn: false,
      userIdentifier: '',
      authenticationType: null
    });
    setEmail('');
    setFarcasterFid('');
  };

  useEffect(() => {
    // Initialize Magic SDK
    if (!process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
      console.error('Magic API key not found');
      return;
    }
    
    magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY);
    magic.preload().then(() => {
      setIsMagicReady(true);
    }).catch((error: unknown) => {
      const magicError = error as MagicSDKError;
      console.error('Magic SDK initialization error:', magicError);
    });

    const callback = (data: NeynarResponse) => {
      setFarcasterFid(data.fid);
      setAuthState({
        isLoggedIn: true,
        userIdentifier: `FID: ${data.fid}`,
        authenticationType: 'farcaster'
      });
      displayNotification("Farcaster account verified successfully!");
    };

    window.onSignInSuccess = callback;
    initializeFarcasterButton();

    return () => {
      window.onSignInSuccess = undefined;
    };
  }, []);

  // Add new useEffect for Farcaster button reinitialization
  useEffect(() => {
    if (!authState.isLoggedIn) {
      const timeoutId = setTimeout(() => {
        initializeFarcasterButton();
      }, 100); // Small delay to ensure DOM is ready

      return () => clearTimeout(timeoutId);
    }
  }, [authState.isLoggedIn]);

  const handleEmailVerification = async (): Promise<void> => {
    if (!email || !magic || !isMagicReady) return;

    try {
      setIsVerifyingEmail(true);
      await magic.auth.loginWithMagicLink({ 
        email,
        showUI: true
      });

      setAuthState({
        isLoggedIn: true,
        userIdentifier: email,
        authenticationType: 'email'
      });
      displayNotification("Email verified successfully!");
    } catch (error: unknown) {
      const magicError = error as MagicSDKError;
      console.error('Verification error:', magicError);
      displayNotification("Error verifying email. Please try again.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!authState.isLoggedIn) {
      displayNotification("Please verify your identity using either Email or Farcaster");
      return;
    }

    if (!agreed) {
      displayNotification("Please agree to the terms before submitting");
      return;
    }

    if (!cardType) {
      displayNotification("Please select a Card Type");
      return;
    }

    if (!subType) {
      displayNotification(`Please select a ${cardType === 'Annoy' ? 'Annoy Type' : 'Flaw Type'}`);
      return;
    }

    if (!cardText) {
      displayNotification("Please enter Card Text");
      return;
    }

    if (cardType === 'Flaw' && !flawName) {
      displayNotification("Please enter a Flaw Name");
      return;
    }

    setIsSubmitting(true);

    const submitData: CardSubmission = {
      ...(authState.authenticationType === 'email' && { email: authState.userIdentifier }),
      ...(authState.authenticationType === 'farcaster' && { farcasterFid }),
      CardType: cardType,
      cardText,
      agreedToTerms: agreed,
      ...(cardType === 'Annoy' && { 
        subTypeAnnoy: subType as 'Duck' | 'Skip' | 'Steal' | 'Undo' 
      }),
      ...(['Blame', 'Flaw'].includes(cardType) && { 
        subTypePersonality: subType as 'Arrogant' | 'Condescending' | 'Meddling' | 'Obnoxious' | 'Odd' | 'Tactless' 
      }),
      ...(cardType === 'Flaw' && { flawName })
    };

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        displayNotification("Card submitted successfully!");
        setIsSubmissionComplete(true);
      } else {
        throw new Error(data.error || 'Submission failed');
      }
    } catch (error) {
      displayNotification(error instanceof Error ? error.message : 'Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnother = (): void => {
    // Don't reset auth state
    setCardType('');
    setSubType('');
    setCardText('');
    setFlawName('');
    setAgreed(false);
    setIsSubmissionComplete(false);
    setIsSubmitting(false);
    setShowNotification(false);
    setNotificationMessage('');
  };

  const renderAuthSection = () => {
    if (authState.isLoggedIn) {
      return (
        <Card className="mb-6">
          <CardContent className="py-4 px-6 flex justify-between items-center">
            <span className="font-medium text-green-600">
              Logged in as {authState.userIdentifier}
            </span>
            <Button variant="outline" onClick={handleLogout} className="flex gap-2">
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 text-center">Email Verification</h3>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <Button
                onClick={handleEmailVerification}
                disabled={isVerifyingEmail || !email || !isMagicReady}
                className="w-full"
              >
                {isVerifyingEmail ? 'Verifying...' : 
                 !isMagicReady ? 'Loading...' : 
                 'Verify Email'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 text-center">Farcaster Verification</h3>
            <div className="flex justify-center min-h-[40px]" ref={farcasterContainerRef} />
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isSubmissionComplete) {
    return <SuccessScreen onSubmitAnother={handleSubmitAnother} />;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      {showNotification && <Notification message={notificationMessage} />}
      
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Dramanoes Card Form
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill out the form below to submit your card for consideration
          </p>
        </div>

        {renderAuthSection()}

        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                required
              />
              <label htmlFor="terms" className="text-sm">
                I agree to waive my IP rights and join the Dramanoes royalty program
                <span className="text-destructive">*</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <SectionHeading>Card Type</SectionHeading>
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                    <CardTypeOption 
                      type="Annoy"
                      isSelected={cardType === 'Annoy'}
                      onClick={() => {
                        setCardType('Annoy');
                        setSubType('');
                      }}
                    />
                    <CardTypeOption 
                      type="Blame"
                      isSelected={cardType === 'Blame'}
                      onClick={() => {
                        setCardType('Blame');
                        setSubType('');
                      }}
                    />
                    <CardTypeOption 
                      type="Flaw"
                      isSelected={cardType === 'Flaw'}
                      onClick={() => {
                        setCardType('Flaw');
                        setSubType('');
                      }}
                    />
                  </div>
                </div>
              </div>

              {cardType === 'Annoy' && (
                <div className="space-y-4">
                  <SectionHeading>Annoy Type</SectionHeading>
                  <TypeSelector 
                    options={['Duck', 'Skip', 'Steal', 'Undo']}
                    selectedValue={subType}
                    onChange={setSubType}
                  />
                </div>
              )}

              {['Blame', 'Flaw'].includes(cardType) && (
                <div className="space-y-4">
                  <SectionHeading>
                    {cardType === 'Blame' ? 'Blame a Flaw' : 'Flaw Type'}
                  </SectionHeading>
                  <TypeSelector 
                    options={[
                      'Arrogant',
                      'Condescending',
                      'Meddling',
                      'Obnoxious',
                      'Odd',
                      'Tactless'
                    ]}
                    selectedValue={subType}
                    onChange={setSubType}
                  />
                </div>
              )}

              {cardType === 'Flaw' && (
                <div className="space-y-4">
                  <SectionHeading>Flaw Name</SectionHeading>
                  <Input
                    type="text"
                    value={flawName}
                    onChange={(e) => setFlawName(e.target.value)}
                    placeholder="e.g., Pot Stirrer"
                    required
                    className="max-w-xl mx-auto"
                  />
                </div>
              )}

              <div className="space-y-4">
                <SectionHeading>Card Text</SectionHeading>
                <Textarea
                  value={cardText}
                  onChange={(e) => setCardText(e.target.value)}
                  rows={4}
                  placeholder={
                    cardType === 'Annoy' ? 'e.g., "I was sitting here first."' :
                    cardType === 'Blame' ? 'e.g., "My boss really hated your joke."' :
                    'e.g., "Id be pissed if I were you."'
                  }
                  required
                  className="max-w-xl mx-auto"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !agreed || !authState.isLoggedIn}
                className="w-full max-w-xl mx-auto block"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Card'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;