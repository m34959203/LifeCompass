import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 mb-6">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        {t('toMain')}
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('privacy.title')}</h1>
      <p className="text-slate-400 text-sm mb-8">{t('privacy.updated')}</p>

      <div className="flex flex-col gap-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {/* 1 */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('privacy.s1Title')}</h2>
          <p>{t('privacy.s1Text')}</p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('privacy.s2Title')}</h2>
          <p>{t('privacy.s2Text')}</p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('privacy.s3Title')}</h2>
          <p>{t('privacy.s3Text')}</p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('privacy.s4Title')}</h2>
          <p>{t('privacy.s4Text')}</p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('privacy.s5Title')}</h2>
          <p>{t('privacy.s5Text')}</p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('privacy.s6Title')}</h2>
          <p>{t('privacy.s6Text')}</p>
        </section>
      </div>
    </div>
  );
};
