import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@nextui-org/react';

import { useTelegram } from '@/common/providers/telegramProvider';
import { useMainButton } from '@/common/telegram/useMainButton';
import { Paths } from '@/common/routing';
import { TitleText } from '@/components';
import { initializeWalletFromCloud } from '@/common/wallet';
import { MNEMONIC_STORE } from '@/common/utils/constants';

export default function ChangePasswordPage() {
  const { BackButton, webApp } = useTelegram();
  const { mainButton, addMainButton, reset, hideMainButton } = useMainButton();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  useEffect(() => {
    const handleBackButtonClick = () => {
      navigate(Paths.SETTINGS_BACKUP);
    };

    BackButton?.show();
    BackButton?.onClick(handleBackButtonClick);
    mainButton.show();
    mainButton.disable();

    return () => {
      BackButton?.offClick(handleBackButtonClick);
      hideMainButton();
    };
  }, [BackButton, hideMainButton, mainButton, navigate]);

  useEffect(() => {
    const validatePassword = () => {
      if (password.length < 8) {
        setIsPasswordValid(false);
        return;
      }

      webApp?.CloudStorage.getItem(MNEMONIC_STORE, (_err, value) => {
        const decryptedMnemonic = initializeWalletFromCloud(password, value);
        setIsPasswordValid(Boolean(decryptedMnemonic));

        if (decryptedMnemonic) {
          navigate(Paths.SETTINGS_NEW_PASSWORD);
        }
      });
    };

    if (password.length >= 1) {
      mainButton.enable();
      addMainButton(validatePassword);
    } else {
      mainButton.disable();
    }

    return () => {
      reset();
    };
  }, [addMainButton, mainButton, navigate, password, reset, webApp]);

  return (
    <div className="flex flex-col items-center pt-14">
      <TitleText>Enter your current password</TitleText>
      <Input
        isClearable
        variant="flat"
        placeholder="Enter Password Here"
        type="password"
        className="max-w-sm text-left mt-8"
        classNames={{
          inputWrapper: [
            'bg-bg-input border-1 shadow-none',
            'rounded-lg group-data-[focus=true]:bg-bg-input group-data-[focus=true]:border-border-active',
          ],
          clearButton: ['text-text-hint'],
        }}
        value={password}
        isInvalid={!isPasswordValid}
        errorMessage={!isPasswordValid && 'It seems your password is incorrect.'}
        onValueChange={setPassword}
        onClear={() => setPassword('')}
      />
    </div>
  );
}
