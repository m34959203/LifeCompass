import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Ошибка авторизации');
      }
      setLoading(false);
    }, 400);
  };

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
