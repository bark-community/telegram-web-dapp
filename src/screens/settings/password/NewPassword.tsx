import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { Paths } from '@/common/routing';
import { PasswordForm, TitleText } from '@/components';
import { backupMnemonic, getStoreName } from '@/common/wallet';
import { MNEMONIC_STORE } from '@/common/utils/constants';

export default function NewPasswordPage() {
  const { BackButton } = useTelegram();
  const { mainButton, addMainButton, reset } = useMainButton();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBackButtonClick = () => {
      navigate(Paths.SETTINGS_CHANGE_PASSWORD);
    };

    BackButton?.show();
    BackButton?.onClick(handleBackButtonClick);
    mainButton?.show();
    mainButton?.disable();

    return () => {
      BackButton?.offClick(handleBackButtonClick);
      reset();
    };
  }, [BackButton, mainButton, navigate, reset]);

  const handleSubmit = (password: string) => {
    mainButton?.enable();
    const mainCallback = () => {
      navigate(Paths.SETTINGS_PASSWORD_CONFIRMATION);
      const mnemonic = secureLocalStorage.getItem(getStoreName(MNEMONIC_STORE));
      backupMnemonic(mnemonic as string, password);
    };

    addMainButton(mainCallback);
  };

  return (
    <div className="flex flex-col items-center pt-14">
      <TitleText>Enter your new password</TitleText>
      <PasswordForm onSubmit={handleSubmit} />
    </div>
  );
}
