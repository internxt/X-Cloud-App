import React, { useState } from 'react';
import './PayForm.scss';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import NavigationBar from '../navigationBar/NavigationBar';
import ConnectWallet from './connect-wallet/ConnectWallet';
import Settings from '../../lib/settings';

const plans = ['200GB - €3.49/month', '2TB - €8.99/month'];
const planB = ['prepay 6 months - €3.99/month', 'prepay 12 months - €3.49/month'];
// const totalPlanB = [3.99*6, 3.49*12];
const planC = ['prepay 6 months - €9.49/month', 'prepay 12 months - €8.99/month'];
// const totalPlanC = [9.49*6, 8.99*12];

const PayToken = () => {

  const [modal, handleModal] = useState(false);
  const [email, handleEmail] = useState(Settings.getUser().email);
  const [plan, handlePlan] = useState(0);
  const [lenght, handleLenght] = useState(0);

  const renderSwitch = () => {
    console.log(lenght);
    switch (plan) {
      case '0':
        return planB.map((item, index) => <option value={index}>{item}</option>);
      case '1':
        return planC.map((item, index) => <option value={index}>{item}</option>);
    }
  };

  return (
    <div>
      <NavigationBar navbarItems={<h5>Token</h5>} isTeam={false} isMember={false} isAdmin={false} />
      <Container className="form-main">
        <ConnectWallet modalHandler={ () => handleModal(false) } modalOpener={modal}/>
        <Container className="form-container-box pay-crypto-box">
          <div className="container-form">
            <p className="container-title">Pay with Internxt Tokens and get 10% discount</p>
            <div
              className="referred-description py-3"
            >
              We currently accept Internxt tokens for crypto payments with a minimum order size of 10€.
              <br/>
              Complete the crypto payment request form below and we'll email you with a crypto invoice.
            </div>
            <Form className="form-payment">
              <Form.Row>
                <Form.Group as={Col} controlId="plan">
                  <Form.Label>What plan would you like to pay for</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={handlePlan}
                    name="plan"
                  >
                    {plans.map((item, index) => <option value={index}>{item}</option>)}
                  </Form.Control>
                </Form.Group>
                <Form.Group as={Col} controlId="leght">
                  <Form.Label>How many months would you like to pay for?</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={handleLenght}
                    name="lenght"
                  >
                    {renderSwitch}
                  </Form.Control>
                </Form.Group>
              </Form.Row>

              <Form.Row>
                <Form.Group>
                  <Form.Label>Email Address for account to apply payment to</Form.Label>
                  <Form.Control
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleEmail}
                  />
                </Form.Group>
              </Form.Row>

              <Container style={{ textAlign: 'right' }}>
                <Row>
                  <Col sm={10}> EUR to pay:</Col>
                  <Col> </Col>
                </Row>
                <Row>
                  <Col sm={10}> 10% Discount: </Col>
                  <Col> </Col>
                </Row>
                <Row>
                  <Col sm={10}> Total </Col>
                  <Col> </Col>
                </Row>
                <Row style={{ fontSize: '25px', fontWeight: 600 }}>
                  <Col sm={10}> INXT to pay:</Col>
                  <Col> </Col>
                </Row>
              </Container>

              <Form.Row className="form-payment-submit">
                <Form.Group as={Col}>
                  <Button
                    className="on btn-block"
                    onClick={ () => handleModal(!modal) }
                  >
                    Connect to Wallet
                  </Button>
                </Form.Group>
              </Form.Row>
            </Form>
          </div>
        </Container>
      </Container>
    </div>
  );
};

export default PayToken;
