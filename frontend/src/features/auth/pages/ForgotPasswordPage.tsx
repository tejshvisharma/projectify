import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      try {
        const res = await authApi.forgotPassword(email);
        // If backend returns success: false, treat as error
        if (res.data && res.data.success === false) {
          const err: any = new Error(res.data.message || 'Failed to send reset link.');
          err.response = { data: res.data };
          
          throw err;
        }
        return res;
      } catch (err: any) {
        throw err;
      }
    },
    onSuccess: (res: any) => {
      setSuccess(res.data.message || 'If your email exists, a reset link has been sent.');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to send reset link.');
      setSuccess('');
    },
    onSettled: () => {
      // Always reset loading state
      // (React Query handles isPending, but this ensures UI updates)
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {success && (
              <div className="rounded-md bg-emerald-100 p-3 text-sm text-emerald-700">{success}</div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
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
                disabled={forgotPasswordMutation.isPending}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
              {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
