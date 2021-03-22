import React from 'react';//, { useState } from 'react';
import './PayForm.scss';
import { Container } from 'react-bootstrap';
import NavigationBar from '../navigationBar/NavigationBar';
import ConnectWallet from './connect-wallet/ConnectWallet';

// const plans = ['200GB - €3.49/month', '2TB - €8.99/month'];
// const planB = ['prepay 6 months - €3.99/month', 'prepay 12 months - €3.49/month'];
// // const totalPlanB = [3.99*6, 3.49*12];
// const planC = ['prepay 6 months - €9.49/month', 'prepay 12 months - €8.99/month'];
// // const totalPlanC = [9.49*6, 8.99*12];

const PayToken = () => {

  // const [modal, handleModal] = useState(false);
  // const [email, handleEmail] = useState(Settings.getUser().email);
  // const [plan, handlePlan] = useState(0);
  // const [lenght, handleLenght] = useState(0);

  // const renderSwitch = () => {
  //   console.log(lenght);
  //   switch (plan) {
  //     case 0:
  //       return planB.map((item, index) => <option value={index}>{item}</option>);
  //     case 1:
  //       return planC.map((item, index) => <option value={index}>{item}</option>);
  //   }
  // };

  return (
    <div>
      <NavigationBar navbarItems={<h5>Token</h5>} isTeam={false} isMember={false} isAdmin={false} />
      <Container className="form-main">
        <Container className="form-container-box pay-crypto-box">
          <div className="container-form">
            <p className="container-title">Get 10% discount with INXT</p>
          </div>
          <ConnectWallet/>
        </Container>
      </Container>
    </div>
  );
};

export default PayToken;
