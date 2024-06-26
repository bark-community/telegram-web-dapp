import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  CheckboxGroup,
} from '@nextui-org/react';

import { Icon, BodyText, BigTitle } from '@/components';
import { IconNames } from '../Icon/types';

type CheckboxItem = {
  id: string;
  iconName: IconNames;
  label: React.ReactNode;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const checkboxes: CheckboxItem[] = [
  {
    id: 'checkbox-1',
    iconName: 'Blind',
    label: (
      <>
        Having the recovery phrase means having{' '}
        <strong className="text-text-primary">total and permanent access to all connected wallets</strong> and the money
        within them.
      </>
    ),
  },
  {
    id: 'checkbox-2',
    iconName: 'Pen',
    label: (
      <>
        Do not enter your recovery phrase or private key into any form or app. They are
        <strong className="text-text-primary"> not needed for app functionality.</strong>
      </>
    ),
  },
  {
    id: 'checkbox-3',
    iconName: 'UserBlock',
    label: (
      <>
        Support or <strong className="text-text-primary">admins will never request your recovery phrase</strong> or
        private key under any circumstances.
      </>
    ),
  },
];

const RecoveryModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleCheckboxChange = (values: string[]) => {
    setSelected(values);
  };

  const isSubmitDisabled = selected.length !== checkboxes.length;

  return (
    <Modal isOpen={isOpen} size="xs" placement="center" isDismissable={false} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <BigTitle>Read this carefully</BigTitle>
        </ModalHeader>
        <CheckboxGroup color="default" value={selected} onValueChange={handleCheckboxChange}>
          <ModalBody className="gap-6 mb-2">
            {checkboxes.map(({ id, iconName, label }) => (
              <div key={id} className="flex flex-col items-center">
                <Icon name={iconName} size={32} />
                <Checkbox value={id} className="items-start">
                  <BodyText align="left" className="text-text-hint">
                    {label}
                  </BodyText>
                </Checkbox>
              </div>
            ))}
          </ModalBody>
        </CheckboxGroup>
        <ModalFooter className="justify-center">
          <Button
            color="primary"
            className="w-full rounded-full h-[50px]"
            disabled={isSubmitDisabled}
            onPress={onSubmit}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RecoveryModal;
