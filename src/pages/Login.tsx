import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { motion } from 'framer-motion';

export default function Login() {
  const { signIn, signUp, verifyOtp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignUp) {
      const result = await signUp(email, password, displayName, phoneNumber);
      if (result.error) {
        setError(result.error.message);
      } else {
        setOtpStep(true);
        setSuccess('A verification code has been sent to your email. Please enter it below.');
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) setError(result.error.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyOtp(email, otpCode);
    if (result.error) {
      setError(result.error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary font-mono text-primary-foreground text-2xl font-bold mb-4">
            S
          </div>
          <h1 className="text-3xl font-bold">
            SQL<span className="text-primary">Arena</span>
          </h1>
          <p className="text-muted-foreground mt-2">Master SQL through practice challenges</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {otpStep ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-1">Verify Your Email</h2>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
              </div>

              {success && (
                <p className="text-sm text-primary text-center">{success}</p>
              )}

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading || otpCode.length !== 6}>
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>

              <button
                type="button"
                onClick={() => { setOtpStep(false); setOtpCode(''); setError(''); setSuccess(''); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to sign up
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Display Name</label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                  />
                </div>
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Mobile Number</label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
