import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useTelegram, useGlobalContext } from '@common/providers';
import { Paths } from '@/common/routing';
import { TitleText, AssetBalance } from '@/components';

export default function ReceiveTokenPage() {
  const navigate = useNavigate();
  const { BackButton } = useTelegram();
  const { assets, setSelectedAsset } = useGlobalContext();

  useEffect(() => {
    const handleBackButtonClick = () => {
      setSelectedAsset(null);
      navigate(Paths.DASHBOARD);
    };

    BackButton?.show();
    BackButton?.onClick(handleBackButtonClick);

    return () => {
      BackButton?.offClick(handleBackButtonClick);
    };
  }, [BackButton, navigate, setSelectedAsset]);

  return (
    <>
      <TitleText className="mt-6 mb-10">Select a token to receive</TitleText>
      <div className="flex flex-col gap-2 mt-4">
        {assets.map((asset) => (
          <Link
            to={Paths.RECEIVE}
            key={asset.chainId}
            onClick={() => setSelectedAsset(asset)}
          >
            <AssetBalance
              asset={asset.asset}
              balance={asset.totalBalance}
              className="bg-white rounded-lg px-4 py-3 w-full hover:bg-bg-item-pressed active:bg-bg-item-pressed"
              name={asset.chainName}
              showArrow
            />
          </Link>
        ))}
      </div>
    </>
  );
}
