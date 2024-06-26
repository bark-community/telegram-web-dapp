import { useState } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';

import { BodyText, BigTitle, MediumTitle, Icon, Countdown } from '@/components';
import { resetWallet } from '@/common/wallet';

type Props = {
  onSubmit: () => void;
  onClose: () => void;
};

export default function ResetPassword({ onClose, onSubmit }: Props) {
  const [isDisabled, setIsDisabled] = useState(true);

  const handleClose = () => {
    setIsDisabled(true);
    onClose();
  };

  const handleSubmit = () => {
    resetWallet();
    onSubmit();
  };

  return (
    <>
      <ModalHeader className="p-4">
        <BigTitle>Forgot Password?</BigTitle>
      </ModalHeader>
      <ModalBody className="gap-4 px-4">
        <Icon name="ResetPassword" size={96} className="self-center" />
        <BodyText className="text-text-hint">
          You are the only owner of your password, which is not stored anywhere in Bark Wallet. Without a backup password,
          you cannot access your account or funds. If you lose or forget your password, the only option is to delete the
          current backup and its associated account before creating a new one.
        </BodyText>
        <BodyText className="text-text-on-button-danger font-bold">
          You will lose your funds and access to the account after deleting the backup. Deleting the backup is your only option if
          you cannot restore the password at all.
        </BodyText>
      </ModalBody>
      <ModalFooter className="flex-col justify-center">
        <Button
          className="w-full rounded-full h-[50px] bg-error"
          isDisabled={isDisabled}
          onPress={handleSubmit}
        >
          <MediumTitle className="text-white">
            Delete Backup <Countdown initValue={60} onFinish={() => setIsDisabled(false)} />
          </MediumTitle>
        </Button>
        <Button className="w-full rounded-full h-[50px] bg-success" onPress={handleClose}>
          <MediumTitle>Cancel</MediumTitle>
        </Button>
      </ModalFooter>
    </>
  );
}

