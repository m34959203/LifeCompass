import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

declare const google: any;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export const Login: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Ошибка авторизации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      // Fetch Google Client ID from server
      const configRes = await fetch('/api/google-config');
      if (!configRes.ok) {
        setError('Google вход не настроен на сервере');
        setLoading(false);
        return;
      }
      const { clientId } = await configRes.json();
      if (!clientId) {
        setError('Google Client ID не настроен');
        setLoading(false);
        return;
      }

      // Wait for GIS script to load
      if (typeof google === 'undefined' || !google.accounts) {
        setError('Google сервис не загружен. Попробуйте обновить страницу.');
        setLoading(false);
        return;
      }

      // Use token client for popup flow
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            setError('Ошибка авторизации Google');
            setLoading(false);
            return;
          }

          try {
            // Fetch user info with access token
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const userInfo = await res.json();

            const result = loginWithGoogle({
              id: userInfo.sub,
              name: userInfo.name || userInfo.email,
              email: userInfo.email,
            });

            if (result.success) {
              navigate('/dashboard');
            } else {
              setError('Не удалось войти через Google');
            }
          } catch {
            setError('Ошибка получения данных Google');
          }
          setLoading(false);
        },
      });

      client.requestAccessToken();
    } catch {
      setError('Ошибка подключения к Google');
      setLoading(false);
    }
  }, [loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">LifeCompass Uni</h1>
          <p className="text-slate-500 text-sm mt-1">Вход в личный кабинет</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1d2830] rounded-2xl border border-slate-200 dark:border-[#283843] p-8 shadow-lg">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 dark:border-[#283843] bg-white dark:bg-[#131b20] hover:bg-slate-50 dark:hover:bg-[#1a2530] disabled:opacity-60 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
          >
            <GoogleIcon />
            Войти через Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-[#283843]"></div>
            <span className="text-xs text-slate-400">или</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-[#283843]"></div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#283843] bg-background-light dark:bg-background-dark text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="student@university.kz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#283843] bg-background-light dark:bg-background-dark text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Введите пароль"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-bold transition-colors shadow-lg shadow-primary/20 mt-2"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Зарегистрироваться
          </Link>
        </p>

        {/* Back to landing */}
        <p className="text-center mt-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600 text-xs flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            На главную
          </Link>
        </p>
      </div>
    </div>
  );
};
