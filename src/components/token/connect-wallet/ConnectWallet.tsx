import React, { useState } from 'react';
import PopupWalletConnect from './popup/PopupWalletConnect';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

const getLibrary = (provider : any) => {
  const library = new Web3Provider(provider);

  library.pollingInterval = 12000;
  return library;
};

const ConnectWallet = () => {

  const [popupOpened, setPopup] = useState(true);

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <PopupWalletConnect
        isTeam={false}
        open={popupOpened}
        onClose={setPopup}
      />
    </Web3ReactProvider>
  );
};

export default ConnectWallet;