import React from 'react';
import { Spinner, Row, Button } from 'react-bootstrap';
import { connect } from 'react-redux';

import InxtContainerOption from './InxtContainerOption';
import iconCloseTab from '../assets/Dashboard-Icons/close-tab.svg';
import iconStripe from '../assets/PaymentBridges/stripe.svg';
import iconInxt from '../assets/PaymentBridges/inxt.svg';
import iconPayPal from '../assets/PaymentBridges/paypal.svg';
import { getHeaders } from '../lib/auth';

import SessionStorage from '../lib/sessionStorage';
import { RootState } from '../store';
import analyticsService from '../services/analytics.service';
import { UserSettings } from '../models/interfaces';

const stripeGlobal = window.Stripe;

const PaymentBridges = [
  {
    name: 'Card',
    logo: iconStripe,
    border: 'linear-gradient(88deg, #ea001b, #f7a934)'
  },
  {
    name: 'PayPal',
    logo: iconPayPal,
    border: 'linear-gradient(88deg, #003087, #009cde)'
  },
  {
    name: 'INXT',
    logo: iconInxt,
    border: 'linear-gradient(88deg, #000000, #686868)'
  }
];

interface StoragePlansProps {
  currentPlan: any;
  user: UserSettings
}

interface StoragePlansState {
  statusMessage: string;
  storageStep: number;
  productsLoading: boolean | any;
  plansLoading: boolean | any;
  availableProducts: any[] | null;
  availablePlans: any[] | null;
  selectedProductToBuy: any | null;
  selectedPlanToBuy: any | null;
  paymentMethod: any | null;
}

class StoragePlans extends React.Component<StoragePlansProps, StoragePlansState> {
  constructor(props) {
    super(props);

    this.state = {
      statusMessage: '',
      storageStep: 1,

      productsLoading: true,
      plansLoading: true,

      availableProducts: null,
      availablePlans: null,

      selectedProductToBuy: null,
      selectedPlanToBuy: null,

      paymentMethod: null
    };
  }

  loadAvailableProducts() {
    return fetch('/api/stripe/products' + (process.env.NODE_ENV !== 'production' ? '?test=true' : ''), {
      headers: getHeaders(true, false)
    }).then(response => response.json()).then(products => {
      this.setState({
        availableProducts: products,
        productsLoading: false
      });
    }).catch(err => {

    });
  }

  loadAvailablePlans() {
    const body: { product: string, test?: boolean } = { product: this.state.selectedProductToBuy.id };

    if (process.env.NODE_ENV !== 'production') {
      body.test = true;
    }
    return fetch('/api/stripe/plans', {
      method: 'post',
      headers: getHeaders(true, false),
      body: JSON.stringify(body)
    }).then(res => res.json()).then(res => {
      this.setState({ availablePlans: res, plansLoading: false });
    }).catch(err => {
      console.log('Error loading price plans', err.message);
    });
  }

  componentDidMount() {
    this.loadAvailableProducts();
  }

  handleStripePayment() {
    this.setState({ statusMessage: 'Purchasing...' });

    const stripe = new stripeGlobal(process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_STRIPE_TEST_PK : process.env.REACT_APP_STRIPE_PK);

    const body: { plan: string, product: string, test?: boolean } = {
      plan: this.state.selectedPlanToBuy.id,
      product: this.state.selectedProductToBuy.id
    };

    if (/^pk_test_/.exec(stripe._apiKey)) {
      body.test = true;
    }

    fetch('/api/stripe/session', {
      method: 'POST',
      headers: getHeaders(true, false),
      body: JSON.stringify(body)
    }).then(result => result.json()).then(result => {
      if (result.error) {
        throw Error(result.error);
      }
      analyticsService.userEnterPayments();
      this.setState({ statusMessage: 'Redirecting to Stripe...' });
      SessionStorage.del('limitStorage');
      stripe.redirectToCheckout({ sessionId: result.id }).then(result => {
      }).catch(err => {
        this.setState({ statusMessage: 'Failed to redirect to Stripe. Reason:' + err.message });
      });
    }).catch(err => {
      console.error('Error starting Stripe session. Reason: %s', err);
      this.setState({ statusMessage: 'Please contact us. Reason: ' + err.message });
    });
  }

  render() {
    if (this.state.storageStep === 1) {
      return (<div>
        <p className="title1">Storage Plans</p>

        {this.state.productsLoading === true ? <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" size="sm" style={{ fontSize: 1 }} />
        </div> : ''}
        {this.state.productsLoading === 'error' ? 'There was an error loading the available plans: The server was unreachable. Please check your network connection and reload.' : ''}

        <Row className='mt-4'>
          {this.state.availableProducts ?
            this.state.availableProducts.map((entry, i) => {
              // Print the list of available products
              return <InxtContainerOption
                key={'plan' + i}
                isChecked={this.props.currentPlan === entry.metadata.size_bytes * 1}
                header={entry.metadata.simple_name}
                onClick={() => {
                  // Can't select the current product or lesser
                  this.setState({ selectedProductToBuy: entry, storageStep: 2, plansLoading: true, availablePlans: null });
                }}
                text={entry.metadata.price_eur === '0.00' ? 'Free' : <span>€{entry.metadata.price_eur}<span style={{ color: '#7e848c', fontWeight: 'normal' }}>/month</span></span>} />;
            })
            : ''}
        </Row>
      </div>);
    }

    if (this.state.storageStep === 2) {
      if (this.state.availablePlans == null) {
        this.loadAvailablePlans();
      }
      return <div>
        <p className="close-modal" onClick={e => this.setState({ storageStep: 1 })}><img src={iconCloseTab} alt="Close" /></p>
        <p className="title1">Select payment length <span style={{ fontWeight: 'normal', color: '#7e848c' }}>| {this.state.selectedProductToBuy.metadata.simple_name} Plan</span></p>

        {this.state.plansLoading === true ? <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" size="sm" />
        </div> : ''}
        {this.state.plansLoading === 'error' ? 'There was an error loading the available plans: The server was unreachable. Please check your network connection and reload.' : ''}

        {console.log(this.state.availablePlans)}
        <Row className='mt-4'>
          {this.state.availablePlans ?
            this.state.availablePlans.map((entry, i) => {
              // Convert to months
              if (entry.interval === 'year') {
                entry.interval_count *= 12;
                entry.interval = 'month';
              }

              const fixedPrice = ((entry.price / 100) / entry.interval_count).toFixed(2);

              // Print the list of available plans
              return <InxtContainerOption
                key={'plan' + i}
                isChecked={false}
                header={'€' + fixedPrice}
                onClick={() => {
                  analyticsService.planSubscriptionSelected({
                    price: fixedPrice,
                    plan_type: entry.name,
                    payment_type: PaymentBridges[0].name,
                    plan_length: entry.interval_count,
                    email: this.props.user.email
                  });
                  this.setState({ selectedPlanToBuy: entry, storageStep: 4, paymentMethod: PaymentBridges[0].name });
                }}
                text={<span><span style={{ color: '#7e848c', fontWeight: 'normal' }}>Prepay{entry.interval_count === 1 ? ' per' : ''}</span>&nbsp;{entry.interval_count !== 1 ? entry.interval_count + ' ' : ''}month{entry.interval_count > 1 ? 's' : ''}</span>} />;
            })
            : ''}
        </Row>
      </div>;
    }

    if (this.state.storageStep === 3) {
      return <div>
        <p className="close-modal" onClick={e => this.setState({ storageStep: 2 })}><img src={iconCloseTab} alt="Close" /></p>
        <p className="title1">Select payment <span style={{ fontWeight: 'normal', color: '#7e848c' }}>| {this.state.selectedProductToBuy.metadata.simple_name} Plan, {this.state.selectedPlanToBuy.name}</span></p>

        <Row className='mt-4'>
          {
            PaymentBridges.map((entry, i) => {
              return <InxtContainerOption
                key={'bridge' + i}
                style={entry.border}
                header={<img src={entry.logo} alt="Logo" />}
                text={entry.name}
                onClick={() => {
                  this.setState({ storageStep: 4, paymentMethod: entry.name });
                }}
              />;
            })
          }
        </Row>
      </div>;
    }

    if (this.state.storageStep === 4) {
      return <div>
        <p className="close-modal" onClick={e => this.setState({ storageStep: 2 })}><img src={iconCloseTab} alt="Close" /></p>
        <p className="title1">Order summary <span style={{ fontWeight: 'normal', color: '#7e848c' }}>| {this.state.selectedProductToBuy.metadata.simple_name} Plan, {this.state.selectedPlanToBuy.name}, {this.state.paymentMethod}</span></p>

        <div>
          {this.state.paymentMethod === 'Card' ? <div style={{ textAlign: 'center' }}>
            <Button
              type="submit"
              size="sm"
              onClick={this.handleStripePayment.bind(this)}
              style={{
                width: '28%',
                height: '40px',
                background: 'linear-gradient(74deg, #096dff, #00b1ff)',
                borderWidth: '0px'
              }}>Subscribe</Button>

          </div>
            : <div style={{ textAlign: 'center' }}>Comming soon...</div>}
          <p className="mt-4" style={{ textAlign: 'center', fontSize: 14 }}>{this.state.statusMessage}</p>
        </div>
      </div>;
    }
  }
}

export default connect((state: RootState) => ({
  user: state.user.user
}))(StoragePlans);