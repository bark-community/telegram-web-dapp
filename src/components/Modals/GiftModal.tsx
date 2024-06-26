import { useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import Lottie from 'react-lottie-player';

import { useChainRegistry } from '@/common/chainRegistry';
import { useGlobalContext, useTelegram } from '@/common/providers';
import { getGiftInfo, formatAmount, formatBalance } from '@/common/utils';
import { AssetType, PublicKey } from '@/common/types';
import { BigTitle, Icon, Shimmering } from '@/components';
import { ChainAsset, ConnectionStatus } from '@/common/chainRegistry/types';
import { useAssetHub } from '@/common/utils/hooks';
import { useQueryService } from '@/common/queryService/QueryService';
import { useExtrinsic, TransactionType } from '@/common/extrinsicService';

enum GiftStatus {
  NotClaimed,
  Claimed,
}

type GiftStatusType = {
  [key in GiftStatus]: { text: string; btnText: string };
};

const GIFTS: GiftStatusType = {
  [GiftStatus.NotClaimed]: { text: 'Claim your gift', btnText: 'Claim' },
  [GiftStatus.Claimed]: { text: 'Gift was claimed', btnText: 'Okay' },
};
let timeoutId: ReturnType<typeof setTimeout>;

export default function GiftModal() {
  const { publicKey, isGiftClaimed, setIsGiftClaimed } = useGlobalContext();
  const { startParam, webApp } = useTelegram();
  const { sendTransaction, handleFee } = useExtrinsic();
  const { getAssetBySymbol, connectionStates } = useChainRegistry();
  const { getFreeBalance } = useQueryService();
  const { getGiftBalanceStatemine } = useAssetHub();

  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [giftSymbol, setGiftSymbol] = useState('');
  const [giftBalance, setGiftBalance] = useState('');
  const [giftStatus, setGiftStatus] = useState<GiftStatus | null>(null);

  const lottieRef = useRef();

  const getGiftBalance = async (chain: ChainAsset, giftAddress: string) => {
    const timerID = setTimeout(() => {
      setGiftBalance('-');
    }, 5500);

    const giftBalance = await getFreeBalance(giftAddress, chain.chain.chainId);
    if (giftBalance === '0') {
      clearTimeout(timerID);

      return '0';
    }
    const fee = await handleFee(chain.chain.chainId, TransactionType.TRANSFER_ALL);
    clearTimeout(timerID);
    const rawBalance = +giftBalance - fee;
    const formattedBalance = formatBalance(rawBalance.toString(), chain.asset.precision).formattedValue;

    return formattedBalance;
  };

  useEffect(() => {
    if (isGiftClaimed || !startParam || !publicKey) {
      return;
    }
    setIsOpen(true);

    (async () => {
      const { giftAddress, chain, symbol } = await getGiftInfo(publicKey, startParam, getAssetBySymbol);
      if (connectionStates[chain.chain.chainId].connectionStatus === ConnectionStatus.NONE) {
        return;
      }

      const balance =
        chain.asset?.type === AssetType.STATEMINE
          ? await getGiftBalanceStatemine(chain.chain.chainId, chain.asset, giftAddress)
          : await getGiftBalance(chain, giftAddress);

      setGiftStatus(balance === '0' ? GiftStatus.Claimed : GiftStatus.NotClaimed);
      setGiftSymbol(balance === '0' ? '' : symbol);

      setGiftBalance(balance);
    })();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [startParam, publicKey, isGiftClaimed, connectionStates]);

  const handleClose = () => {
    clearTimeout(timeoutId);
    setIsOpen(false);
    if (giftBalance) {
      setIsGiftClaimed(true);
    }
  };

  const handleGiftClaim = async () => {
    setIsDisabled(true);
    if (giftBalance === '0') {
      handleClose();

      return;
    }
    clearTimeout(timeoutId);
    if (lottieRef.current) {
      // @ts-expect-error no types
      lottieRef.current.play();
    }

    const { chainAddress, chain, keyring } = await getGiftInfo(
      publicKey as PublicKey,
      startParam as string,
      getAssetBySymbol,
    );

    sendTransaction({
      destinationAddress: chainAddress,
      chainId: chain.chain.chainId,
      transferAmount: formatAmount(giftBalance, chain.asset.precision),
      asset: chain.asset,
      keyring,
      transferAll: true,
    })
      .catch(() => {
        webApp?.showAlert('Something went wrong. Failed to claim gift');
        handleClose();
      })
      .finally(() => {
        setIsGiftClaimed(true);
        // @ts-expect-error no types
        if (lottieRef.current && lottieRef.current.totalFrames - 1 === lottieRef.current.currentFrame) {
          setIsOpen(false);
        }
      });
  };

  const handleFrame = () => {
    // @ts-expect-error no types
    if (lottieRef.current && lottieRef.current.currentFrame === 0) {
      // @ts-expect-error no types
      timeoutId = setTimeout(() => lottieRef.current && lottieRef.current.pause(), 3015);
    }
  };

  const handleComplete = () => {
    if (lottieRef.current && isGiftClaimed) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        size="xs"
        placement="center"
        isDismissable={false}
        classNames={{
          header: 'p-4 pb-1',
          footer: 'p-4 pt-1',
          closeButton: 'mt-[10px]',
        }}
        className="h-[450px]"
        onClose={handleClose}
      >
        <ModalContent>
          {giftStatus !== null ? (
            <>
              <ModalHeader className="text-center">
                <BigTitle> {GIFTS[giftStatus].text}</BigTitle>
              </ModalHeader>
              <ModalBody>
                {giftStatus === GiftStatus.NotClaimed ? (
                  <Lottie
                    path={`/gifs/Gift_claim_${giftSymbol}.json`}
                    play
                    className="w-[248px] h-[248px] m-auto"
                    ref={lottieRef}
                    loop={false}
                    onEnterFrame={handleFrame}
                    onComplete={handleComplete}
                  />
                ) : (
                  <Icon name="GiftClaimed" className="w-[248px] h-[248px] m-auto" />
                )}
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button
                  color="primary"
                  className="w-full h-[50px] rounded-full"
                  isDisabled={isDisabled}
                  isLoading={!giftBalance}
                  onPress={handleGiftClaim}
                >
                  {GIFTS[giftStatus].btnText}{' '}
                  {giftStatus === GiftStatus.NotClaimed && `${giftBalance} ${giftSymbol}`}
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader className="text-center">
                <Shimmering width={200} height={30} className="rounded-full" />
              </ModalHeader>
              <ModalBody>
                <Icon name="PendingGift" className="w-[170px] h-[170px] m-auto" />
              </ModalBody>
              <ModalFooter className="justify-center">
                <Shimmering height={50} width={300} className="w-full rounded-full" />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
