'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/app');
    }
  }, [isLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await signIn(email, password);
      router.replace('/app');
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Shreeji</p>
          <h1>Sign in</h1>
        </div>
        <label className="field">
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            autoComplete="current-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" disabled={isSubmitting || isLoading} type="submit">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}