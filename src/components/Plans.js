import Header from "../Header";
import React, { Component } from 'react';
import { Container, Row, ProgressBar, Col, Card, Button } from "react-bootstrap";

import './Plans.css'
import Circle from "./Circle";

class Plans extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            PlanDetails: []
        }
    }

    componentDidMount() {
        fetch('http://116.203.99.12:8000/api/plans', {
            method: 'post'
        }).then(response => {
            return response.json();
        }).then(pay => {
            this.setState({
                PlanDetails: pay
            });
        });
    }


    render() {
        return (
            <Container fluid>


                <Container className="mt-3" style={{ maxWidth: '784px' }}>
                    <h2><strong>Storage Space</strong></h2>
                    <p color="#404040" className="mt-3">Used storage space</p>
                    <ProgressBar now={60} />

                    <Row className="mt-3">
                        <Col xs={12} md={6} sm={6}>
                            <Circle color="#007bff" /> Used storage space (8GB)
                </Col>

                        <Col xs={12} md={6} sm={6}>
                            <Circle color="#e9ecef" /> Unused storage space (1GB)
                </Col>
                    </Row>

                    <hr className="mt-5" />

                    <h2 className="mt-4">
                        <strong>Storage Plans</strong>
                    </h2>

                    <Row className="mt-4">
                        {this.state.PlanDetails.map(entry => <Col xs={12} md={4} sm={6}>
                            <Card onClick={(e) => { this.props.planHandler(entry); }}>
                                <Card.Header><h2>{entry.name}</h2></Card.Header>
                                <Card.Text>{entry.price_eur == 0 ? 'Free' : '€' + entry.price_eur + ' per month'}</Card.Text>
                            </Card>
                        </Col>)}
                    </Row>

                    <hr />

                    <p>Permanently Delete Account</p>

                </Container>


            </Container>);
    }
};

export default Plans;