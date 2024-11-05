'use client';
import { useState, useEffect, useRef } from 'react';
import { CardSubmission } from '@/utils/airtable';
import { Magic } from 'magic-sdk';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ThumbsUp, PartyPopper } from "lucide-react";

let magic: Magic | null = null;

const Notification = ({ message }: { message: string }) => {
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <ThumbsUp className="h-5 w-5" />
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
};

const SuccessScreen = ({ onSubmitAnother }: { onSubmitAnother: () => void }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6">
        <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Thanks for Your Submission!</h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Your card has been successfully submitted to the Dramanoes team for review. We'll be in touch soon!
      </p>
      <Button onClick={onSubmitAnother} size="lg">
        Submit Another Card
      </Button>
    </div>
  );
};

const CardTypeOption = ({ type, isSelected, onClick }: { 
  type: string; 
  isSelected: boolean; 
  onClick: () => void;
}) => (
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

export default function Home() {
  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [cardType, setCardType] = useState<'Annoy' | 'Blame' | 'Flaw' | ''>('');
  const [subType, setSubType] = useState('');
  const [cardText, setCardText] = useState('');
  const [flawName, setFlawName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  // Verification state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMagicReady, setIsMagicReady] = useState(false);
  const [farcasterFid, setFarcasterFid] = useState('');
  const [isFarcasterVerified, setIsFarcasterVerified] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Reference for the Farcaster container
  const farcasterContainerRef = useRef<HTMLDivElement>(null);

  const displayNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const initializeFarcasterButton = () => {
    if (farcasterContainerRef.current) {
      farcasterContainerRef.current.innerHTML = '';
      const buttonDiv = document.createElement('div');
      buttonDiv.className = 'neynar_signin';
      buttonDiv.setAttribute('data-client_id', process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || '');
      buttonDiv.setAttribute('data-success-callback', 'onSignInSuccess');
      buttonDiv.setAttribute('data-theme', 'light');
      farcasterContainerRef.current.appendChild(buttonDiv);

      // Reload the Neynar script
      const script = document.createElement('script');
      script.src = 'https://neynarxyz.github.io/siwn/raw/1.2.0/index.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
      console.error('Magic API key not found');
      return;
    }
    
    magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY);
    magic.preload().then(() => {
      console.log('Magic SDK ready');
      setIsMagicReady(true);
    });

    (window as any).onSignInSuccess = (data: any) => {
      console.log("Farcaster sign-in success:", data);
      setFarcasterFid(data.fid);
      setIsFarcasterVerified(true);
      setIsVerified(true);
      displayNotification("Farcaster account verified successfully!");
    };

    initializeFarcasterButton();

    return () => {
      delete (window as any).onSignInSuccess;
    };
  }, []);

  const handleEmailVerification = async () => {
    if (!email || !magic || !isMagicReady) return;

    try {
      setIsVerifyingEmail(true);
      console.log('Starting email verification for:', email);

      await magic.auth.loginWithMagicLink({ 
        email,
        showUI: true
      });

      setIsEmailVerified(true);
      setIsVerified(true);
      displayNotification("Email verified successfully!");
    } catch (error) {
      console.error('Verification error:', error);
      displayNotification("Error verifying email. Please try again.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      displayNotification("Please verify your identity using either Email or Farcaster");
      return;
    }

    if (!agreed) {
      displayNotification("Please agree to the terms before submitting");
      return;
    }

    if (!name || !cardType || !cardText || (cardType === 'Flaw' && !flawName)) {
      let missingFields = [];
      if (!name) missingFields.push('Name');
      if (!cardType) missingFields.push('Card Type');
      if (!cardText) missingFields.push('Card Text');
      if (cardType === 'Flaw' && !flawName) missingFields.push('Flaw Name');
      displayNotification(`Please fill in these required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    const submitData: CardSubmission = {
      ...(isEmailVerified && { email }),
      name,
      CardType: cardType,
      cardText,
      agreedToTerms: agreed,
      ...(cardType === 'Annoy' && { 
        subTypeAnnoy: subType as 'Duck' | 'Skip' | 'Steal' | 'Undo' 
      }),
      ...(['Blame', 'Flaw'].includes(cardType) && { 
        subTypePersonality: subType as 'Arrogant' | 'Condescending' | 'Meddling' | 'Obnoxious' | 'Odd' | 'Tactless' 
      }),
      ...(cardType === 'Flaw' && { flawName }),
      ...(isFarcasterVerified && { farcasterFid })
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

  const handleSubmitAnother = () => {
    // Reset all form fields
    setEmail('');
    setName('');
    setCardType('');
    setSubType('');
    setCardText('');
    setFlawName('');
    setAgreed(false);
    
    // Reset all verification states
    setIsEmailVerified(false);
    setIsFarcasterVerified(false);
    setIsVerified(false);
    setFarcasterFid('');
    setIsVerifyingEmail(false);
    
    // Reset submission states
    setIsSubmissionComplete(false);
    setIsSubmitting(false);
    
    // Reset notification state
    setShowNotification(false);
    setNotificationMessage('');

    // Reinitialize Farcaster button
    setTimeout(() => {
      initializeFarcasterButton();
    }, 0);
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

        <div className="max-w-xl mx-auto">
          <p className="mt-2 text-sm text-muted-foreground text-center">
            <i>Please choose a verification method: Email or Farcaster. We will contact you via email or Warpcast Direct-Cast.</i>
          </p>
        </div>

        {/* Verification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Email Verification Card */}
          <Card 
            className={`transition-all duration-200 ${isEmailVerified ? "border-green-500 border-2" : ""} 
            ${isFarcasterVerified ? "opacity-50 grayscale pointer-events-none" : ""}`}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 text-center">Email Verification</h3>
              {!isFarcasterVerified && (
                <div className="flex flex-col space-y-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isEmailVerified}
                  />
                  {!isEmailVerified && (
                    <Button
                      onClick={handleEmailVerification}
                      disabled={isVerifyingEmail || !email || !isMagicReady}
                      className="w-full"
                    >
                      {isVerifyingEmail ? 'Verifying...' : 
                       !isMagicReady ? 'Loading...' : 
                       'Verify Email'}
                    </Button>
                  )}
                </div>
              )}
              {isEmailVerified && (
                <p className="text-green-600 font-medium">✓ Verified: {email}</p>
              )}
            </CardContent>
          </Card>

          {/* Farcaster Verification Card */}
          <Card 
            className={`transition-all duration-200 ${isFarcasterVerified ? "border-green-500 border-2" : ""}
            ${isEmailVerified ? "opacity-50 grayscale pointer-events-none" : ""}`}
          >
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 text-center">Farcaster Verification</h3>
              {!isEmailVerified && !isFarcasterVerified && (
                <div className="flex justify-center" ref={farcasterContainerRef}>
                  {/* Farcaster button will be initialized here */}
                </div>
              )}
              {isFarcasterVerified && (
                <p className="text-green-600 font-medium">✓ Verified FID: {farcasterFid}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Your Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Card Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <CardTypeOption 
                    type="Annoy"
                    isSelected={cardType === 'Annoy'}
                    onClick={() => setCardType('Annoy')}
                  />
                  <CardTypeOption 
                    type="Blame"
                    isSelected={cardType === 'Blame'}
                    onClick={() => setCardType('Blame')}
                  />
                  <CardTypeOption 
                    type="Flaw"
                    isSelected={cardType === 'Flaw'}
                    onClick={() => setCardType('Flaw')}
                  />
                </div>
              </div>

              {cardType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                  {cardType === 'Annoy' ? 'Annoy Type' : 
                     cardType === 'Blame' ? 'Blame a Flaw' : 
                     'Flaw Type'}
                  </label>
                  <Select value={subType} onValueChange={setSubType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cardType === 'Annoy' ? (
                        <>
                          <SelectItem value="Duck">Duck</SelectItem>
                          <SelectItem value="Skip">Skip</SelectItem>
                          <SelectItem value="Steal">Steal</SelectItem>
                          <SelectItem value="Undo">Undo</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Arrogant">Arrogant</SelectItem>
                          <SelectItem value="Condescending">Condescending</SelectItem>
                          <SelectItem value="Meddling">Meddling</SelectItem>
                          <SelectItem value="Obnoxious">Obnoxious</SelectItem>
                          <SelectItem value="Odd">Odd</SelectItem>
                          <SelectItem value="Tactless">Tactless</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {cardType === 'Flaw' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Flaw Name
                  </label>
                  <Input
                    type="text"
                    value={flawName}
                    onChange={(e) => setFlawName(e.target.value)}
                    placeholder="e.g., Pot Stirrer"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Card Text
                </label>
                <Textarea
                  value={cardText}
                  onChange={(e) => setCardText(e.target.value)}
                  rows={4}
                  placeholder={
                    cardType === 'Annoy' ? 'e.g., "I was sitting here first."' :
                    cardType === 'Blame' ? 'e.g., "My boss really hated your joke."' :
                    'e.g., "I\'d be pissed if I were you."'
                  }
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  required
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to waive my IP rights and join the Dramanoes royalty program <span className="text-destructive">*</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !agreed}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Card'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}