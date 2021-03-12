import React, { useState } from 'react';
import './PayForm.scss';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import NavigationBar from '../navigationBar/NavigationBar';
import ConnectWallet from './connect-wallet/ConnectWallet';

const PayToken = () => {

  const [modal, handleModal] = useState(false);

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

            <div
              className="referred-description py-3"
            >
              Market price of Internxt Tokens:
            </div>
            <Form className="form-payment">
              <Form.Row>
                <Form.Group as={Col} controlId="paymentType">
                  <Form.Label>Payment Type</Form.Label>
                  <Form.Control
                    as="select"
                    name="currency"
                  >
                    <option>INXT</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group as={Col} controlId="planSelector">
                  <Form.Label>What plan would you like to pay for</Form.Label>
                </Form.Group>
              </Form.Row>

              <Form.Row>
                <Form.Group as={Col} controlId="email">
                  <Form.Label>Email Address for account to apply payment to</Form.Label>
                </Form.Group>
                <Form.Group as={Col} controlId="paySelector">
                  <Form.Label>How many months would you like to pay for?</Form.Label>
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col} controlId="wallet">
                  <Form.Label>Wallet from which you are send the INXT tokens</Form.Label>
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col} controlId="message">
                  <Form.Label>Optionally include a message with your request</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="message"
                  />
                </Form.Group>
              </Form.Row>

              <Container style={{ textAlign: 'right' }}>
                <Row>
                  <Col sm={10}> EUR to pay:</Col>
                  <Col> 10 €</Col>
                </Row>
                <Row>
                  <Col sm={10}> 10% Discount: </Col>
                  <Col>10 €</Col>
                </Row>
                <Row>
                  <Col sm={10}> Total </Col>
                  <Col> 10 €</Col>
                </Row>
                <Row style={{ fontSize: '25px', fontWeight: 600 }}>
                  <Col sm={10}> INXT to pay:</Col>
                  <Col>  10 </Col>
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
