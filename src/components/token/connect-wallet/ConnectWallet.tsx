import React from 'react';
import PopupWalletConnect from './popup/PopupWalletConnect';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

const getLibrary = (provider : any) => {
  const library = new Web3Provider(provider);

  library.pollingInterval = 12000;
  return library;
};

const ConnectWallet = ({ modalHandler, modalOpener }) => {

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <PopupWalletConnect
        isTeam={false}
        open={modalOpener}
        onClose={modalHandler}
      />
    </Web3ReactProvider>
  );
};

export default ConnectWallet;