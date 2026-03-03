import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export const TermsOfService: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 mb-6">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        {t('toMain')}
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('terms.title')}</h1>
      <p className="text-slate-400 text-sm mb-8">{t('terms.updated')}</p>

      <div className="flex flex-col gap-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('terms.s1Title')}</h2>
          <p>{t('terms.s1Text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('terms.s2Title')}</h2>
          <p>{t('terms.s2Text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('terms.s3Title')}</h2>
          <p>{t('terms.s3Text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('terms.s4Title')}</h2>
          <p>{t('terms.s4Text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('terms.s5Title')}</h2>
          <p>{t('terms.s5Text')}</p>
        </section>
      </div>
    </div>
  );
};
