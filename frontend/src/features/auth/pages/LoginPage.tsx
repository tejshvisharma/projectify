import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/features/auth/api';
import { resendVerificationEmail } from '../resendVerification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resendUrl, setResendUrl] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendUrl(null);
    setResendStatus('');

    try {
      await loginMutation.mutateAsync({ email, password });
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      // If backend provides resendEmailLink, show resend button
      const resend = err.response?.data?.errors?.resendEmailLink;
      if (resend) {
        setResendUrl(resend);
      }
    }
  };

  const handleResend = async () => {
    if (!resendUrl) return;
    setResendStatus('');
    try {
      const  resendRes = await resendVerificationEmail(resendUrl, email);
      setResendStatus(resendRes.data.message ||'Verification email sent. Please check your inbox.');
    } catch (err: any) {
      setResendStatus('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
                {resendUrl && (
                  <div className="mt-2">
                    <Button type="button" variant="outline" onClick={handleResend} disabled={!!resendStatus}>
                      Resend Verification Email
                    </Button>
                    {resendStatus && (
                      <div className="mt-2 text-xs text-emerald-700">{resendStatus}</div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loginMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginMutation.isPending}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
