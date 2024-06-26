import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from '@nextui-org/react';

import { useTelegram, useGlobalContext } from '@common/providers';
import { Paths } from '@/common/routing';
import { useMainButton } from '@/common/telegram/useMainButton';
import {
  HeadlineText,
  Icon,
  Identicon,
  LargeTitleText,
  Plate,
  BodyText,
  MediumTitle,
  TruncateAddress,
} from '@/components';
import { formatAmount, formatBalance } from '@/common/utils/balance';
import { IconNames } from '@/components/Icon/types';
import { useExtrinsic } from '@/common/extrinsicService/useExtrinsic';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { sendTransaction } = useExtrinsic();
  const { reset, addMainButton, mainButton } = useMainButton();
  const { BackButton } = useTelegram();
  const { selectedAsset } = useGlobalContext();

  useEffect(() => {
    if (!selectedAsset) return;

    const mainCallback = async () => {
      mainButton.showProgress(false);
      await sendTransaction({
        destinationAddress: selectedAsset.destinationAddress!,
        chainId: selectedAsset.chainId!,
        transferAll: selectedAsset.transferAll,
        transferAmount: formatAmount(selectedAsset.amount!, selectedAsset.asset!.precision),
        asset: selectedAsset.asset!,
      })
        .then(() => {
          navigate(Paths.TRANSFER_RESULT);
        })
        .catch((error) => alert(`Error: ${error.message}\nTry to reload`));
    };
    const backCallback = () => {
      navigate(Paths.TRANSFER_AMOUNT);
    };

    BackButton?.show();
    BackButton?.onClick(backCallback);

    mainButton.show();
    addMainButton(mainCallback, 'Confirm');

    return () => {
      mainButton.hideProgress();
      reset();
      BackButton?.offClick(backCallback);
    };
  }, [selectedAsset]);

  const symbol = selectedAsset?.asset?.symbol;
  const fee = formatBalance((selectedAsset?.fee || 0).toString(), selectedAsset?.asset?.precision)?.formattedValue;
  const details = [
    {
      title: 'Recipients address',
      value: selectedAsset?.destinationAddress,
    },
    {
      title: 'Fee',
      value: `${fee} ${symbol}`,
    },
    {
      title: 'Total amount',
      value: `${(Number(selectedAsset?.amount) + +fee).toFixed(5)} ${symbol}`,
    },
    {
      title: 'Network',
      value: selectedAsset?.chainName,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-[40px,1fr] items-center">
        <Identicon address={selectedAsset?.destinationAddress} />
        <HeadlineText className="flex gap-1">
          Send to
          <TruncateAddress address={selectedAsset?.destinationAddress} className="max-w-[130px]" />
        </HeadlineText>
      </div>
      <div className="my-6 grid grid-cols-[40px,1fr,auto] items-center gap-2">
        <Icon name={symbol as IconNames} className="w-10 h-10" />
        <LargeTitleText>{symbol}</LargeTitleText>
        <LargeTitleText>{selectedAsset?.amount}</LargeTitleText>
      </div>
      <Plate className="w-full pr-0">
        {details.map(({ title, value }, index) => (
          <div key={title}>
            {index !== 0 && <Divider className="my-4 h-[0.5px] w-auto" />}
            <div className="grid gap-2 break-all pr-4">
              <BodyText align="left" className="text-text-hint">
                {title}
              </BodyText>
              <MediumTitle>{value}</MediumTitle>
            </div>
          </div>
        ))}
      </Plate>
    </>
  );
}
