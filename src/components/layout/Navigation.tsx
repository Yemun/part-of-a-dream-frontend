import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import NavigationClient from './NavigationClient';

export default function Navigation() {
  const t = useTranslations('navigation');

  return (
    <nav className="w-full max-w-5xl">
      <div className="flex flex-row items-center justify-between w-full">
        <NavigationClient 
          blogText={t('blog')} 
          profileText={t('profile')} 
        />
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
