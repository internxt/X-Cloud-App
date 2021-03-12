import React from 'react';
import Popup from 'reactjs-popup';
import './PopupWalletConnect.scss';
import CloseIcon from '../../../../assets/Dashboard-Icons/close-tab.svg';
import { WalletLink } from '../../connectors/Connectors';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';

interface PopupWalletConnectProps {
  onClose: any
  open: any
  isTeam: boolean
}

const PopupWalletConnect = ({ onClose, open, isTeam } : PopupWalletConnectProps) => {

  const tryActivateWallet = async (connector) => {

    activate(connector, undefined, true).then(res => {
      console.log(res);
    }).catch(error => {
      if (error instanceof UnsupportedChainIdError) {
        activate(connector);
      }
    });
  };

  const { activate } = useWeb3React();

  return (<Popup open={open} >
    <div className="ShareContainer">

      <div className="ShareHeader">
        <div className="ShareName">
          <h3>Connect to Wallet</h3>
        </div>
        <div className="ShareClose">
          <img src={CloseIcon} onClick={e => { onClose(false); }} alt="Close" />
        </div>
      </div>

      <div className="ShareBody">
        <div
          style={styles.infoCard}
          onClick={ () => tryActivateWallet(WalletLink)}
        >
          Coinbase Wallet
        </div>
      </div>

      <div className="ShareFooter">
        <div>
          <p>Loading </p>
        </div>
      </div>
    </div>
  </Popup>);
};

export default PopupWalletConnect;

const styles = {
  infoCard: {
    backgroundColor: 'transparent',
    padding: '1rem',
    outline: 'none',
    border: '1px solid',
    borderRadius: '12px',
    borderColor: 'blue',
    width: '100% !important',
    $nest: {
      '&:focus': {
        boxShadow: '0 0 0 1px red'
      }
    },
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
};