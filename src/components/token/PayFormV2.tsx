import React from 'react';
import './PayForm.scss';
import { Container } from 'react-bootstrap';
import NavigationBar from '../navigationBar/NavigationBar';
import ConnectWallet from './connect-wallet/ConnectWallet';

const PayToken = () => {

  return (
    <div>
      <NavigationBar navbarItems={<h5>Token</h5>} isTeam={false} isMember={false} isAdmin={false} />
      <Container className="form-main">
        <ConnectWallet></ConnectWallet>
        <Container className="form-container-box pay-crypto-box">
          <div className="container-form">
            <p className="container-title">
              Connect to Wallet
            </p>
            <button>Open Modal</button>
          </div>
        </Container>
      </Container>
    </div>
  );
};

export default PayToken;
