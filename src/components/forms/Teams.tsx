import React from 'react';
import { Container } from 'react-bootstrap';
import './Login.scss';
import './Reset.scss';
import { Form, Col, Button } from 'react-bootstrap';
import NavigationBar from './../navigationBar/NavigationBar';
import { ReactMultiEmail, isEmail } from 'react-multi-email';
import 'react-multi-email/style.css';
import history from '../../lib/history';
import { getTeamMembersByIdTeam, saveTeamsMembers } from './../../services/TeamMemberService';
import InxtContainer from './../InxtContainer';
import TeamsPlans from './../TeamPlans';
import { getHeaders } from '../../lib/auth';
import { Route } from 'react-router-dom';
import XCloud from '../xcloud/XCloud';
import { async } from 'async';
import logo from '../../assets/drive-logo.svg';


interface Props {
    match?: any
    isAuthenticated: Boolean
}

interface State {
    user: {
        isAdmin: boolean,
        isTeamMember: boolean
    }
    team: {
        bridgeUser: string,
        teamPassword: string
    }
    idTeam: number
    teamName: string
    isTeamActivated: boolean
    emails: Array<string>
    menuTitle: string
    visibility: string
    showDescription: boolean
    template: any
}

class Teams extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            user: {
                isAdmin: false,
                isTeamMember: false
            },
            team: {
                bridgeUser: '',
                teamPassword: ''
            },
            idTeam: 0,
            teamName: '',
            isTeamActivated: false,
            emails: [],
            menuTitle: 'Create',
            visibility: '',
            showDescription: false,
            template: () => { }
        }

        this.handleChangePass = this.handleChangePass.bind(this);
    }

    handleShowDescription = (_showDescription) => {
        this.setState({ showDescription: _showDescription });
    }

    handleChangePass = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({ team: {...this.state.team, teamPassword: event.currentTarget.value} });
    }


    handlePassword = (password: any) => {
        return new Promise((resolve, reject) => {
            
        });
    }


    isLoggedIn = () => {
        return !(!localStorage.xToken);
    }

    getTeamByMember = (memberEmail: string) => {
        return new Promise((resolve, reject) => {
            fetch(`/api/teams-members/${memberEmail}`, {
                method: 'get',
                headers: getHeaders(true, false)
            }).then((result: Response) => {
                if (result.status !== 200) { throw result }
                return result.json()
            }).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }

    getTeamByUserOwner = (ownerEmail: string) => {
        return new Promise((resolve, reject) => {
            fetch(`/api/teams/${ownerEmail}`, {
                method: 'get',
                headers: getHeaders(true, false)
            }).then((result: Response) => {
                if (result.status !== 200) { throw result }
                return result.json()
            }).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }

    isBridgeUserActivated = async (bridgeUserEmail) => {
        return await new Promise( (resolve, reject) => {                       
            console.log("BRIDGE USER", bridgeUserEmail); //debug                       
    
            fetch(`/api/user/isactivated/${bridgeUserEmail}`, {
                method: 'get',
                headers: getHeaders(true, false)
            }).then((responseTeam) => {                           
                responseTeam.json().then((teamProps) => {
                    console.log("TEAM PROPS", teamProps); //debug 
                    resolve(teamProps);
                }).catch((error) => {
                    console.log('No team props', error);
                })
            }).catch((err) => { reject(err) })                                                   

        });
    }

    componentDidMount() {
        if (!this.isLoggedIn()) {
            history.push('/login');
        }

        const user = JSON.parse(localStorage.xUser);      
    }

    renderProductDescription = (): JSX.Element => {
        if (this.state.showDescription) {
            return (
                <InxtContainer>
                    <p className="title1">Plans Description</p>

                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ paddingRight: 12 }}>
                                <p className="title1">20GB</p>
                                <p>Secure file sharing</p>
                                <p>Access anywhere</p>
                                <p>End-to-end encryption</p>
                                <p>Collaboration</p>
                                <p>Administration tools</p>
                            </div>

                            <div style={{ border: 'solid 1px #eaeced' }}></div>
                        </div>

                        <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ paddingRight: 12 }}>
                                <p className="title1">200GB</p>
                                <p>Secure file sharing</p>
                                <p>Access anywhere</p>
                                <p>End-to-end encryption</p>
                                <p>Collaboration</p>
                                <p>Administration tools</p>
                            </div>

                            <div style={{ border: 'solid 1px #eaeced' }}></div>
                        </div>

                        <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{}}>
                                <p className="title1">2TB</p>
                                <p>Secure file sharing</p>
                                <p>Access anywhere</p>
                                <p>End-to-end encryption</p>
                                <p>Collaboration</p>
                                <p>Administration tools</p>
                            </div>
                        </div>
                    </div>
                </InxtContainer>
            );
        } else {
            return <div></div>
        }
    }

    renderPlans = (): JSX.Element => {
        return (
            <div className="settings">
                <NavigationBar navbarItems={<h5>Teams</h5>} showSettingsButton={true} showFileButtons={false} />

                <InxtContainer>
                    <TeamsPlans handleShowDescription={this.handleShowDescription} />
                </InxtContainer>

                {this.renderProductDescription()}
            </div>
        );
    }

    renderTeamWorkspace = (): JSX.Element => {
        return (
            <div className="member-workspace">
                <InxtContainer>
                    <XCloud 
                        isAuthenticated={true}
                        user={this.state.team.bridgeUser}
                        isActivated={this.state.isTeamActivated}
                        handleKeySaved={this.handleKeySaved} 
                    />
                </InxtContainer>

            </div>
        );
    }

    renderTeamAdminWorkspace = (): JSX.Element => {

        return (
            <div className="admin-workspace">

                <InxtContainer>
                    <XCloud 
                        isAuthenticated={true}
                        user={this.state.team.bridgeUser}
                        isActivated={this.state.isTeamActivated}
                        handleKeySaved={this.handleKeySaved} 
                    />
                </InxtContainer>

            </div>
        ); 
    }

    handleKeySaved = (user: JSON) => {
        localStorage.setItem('xUser', JSON.stringify(user));
    }

    renderTeamSettings = (): JSX.Element => {
        return <div>
            <NavigationBar navbarItems={<h5>Teams</h5>} showSettingsButton={true} showFileButtons={false} />

            <Container className="login-main">
                <Container className="login-container-box edit-password-box" style={{ minHeight: '430px', height: 'auto' }}>
                    <div className="container-register">
                        <p className="container-title edit-password" style={{ marginLeft: 0 }}>
                            Manage your team
                        </p>

                        <Form className="form-register" onSubmit={(e: any) => {
                            e.preventDefault();

                            if (this.state.emails.length > 0) {
                                saveTeamsMembers(this.state.idTeam, this.state.emails).then((teamsMembers) => {
                                    // TODO: Notify user about result. e.x. "Invitations sent"
                                    console.log(teamsMembers);
                                }).catch((err: any) => { });
                            }
                        }} >
                            <Form.Row>
                                <Form.Group as={Col} controlId="teamName">
                                    <Form.Control placeholder="Team's name" name="team-name" value={this.state.teamName} onChange={this.handleChangePass} readOnly={true} />
                                </Form.Group>
                            </Form.Row>

                            <Form.Row>
                                <Form.Group as={Col} controlId="invitedMember">
                                    <ReactMultiEmail
                                        placeholder="Invite members (Example: member@internxt.com)"
                                        emails={this.state.emails}
                                        onChange={(_emails: Array<string>) => {
                                            this.setState({ emails: _emails });
                                        }}
                                        validateEmail={email => {
                                            return isEmail(email);
                                        }}
                                        getLabel={(
                                            email: string,
                                            index: number,
                                            removeEmail: (index: number) => void,
                                        ) => {
                                            return (
                                                <div data-tag key={index}>
                                                    {email}
                                                    <span data-tag-handle onClick={() => {
                                                        removeEmail(index)
                                                    }}>
                                                        <i className="far fa-trash-alt"></i>
                                                    </span>
                                                </div>
                                            );
                                        }}
                                    />
                                </Form.Group>
                            </Form.Row>

                            <Form.Row className="form-register-submit">
                                <Form.Group as={Col}>
                                    <Button className="on btn-block" type="submit">Save</Button>
                                </Form.Group>
                            </Form.Row>
                        </Form>
                    </div>
                </Container>
            </Container>
        </div>;
    }

    renderPassword = (): JSX.Element => {
        return (
            <div className="password">
                <NavigationBar navbarItems={<h5>Teams</h5>} showSettingsButton={true} showFileButtons={false} />

                <Container className="login-container-box edit-password-box" style={{height:'350px'}}>
                    <div className="container-register">
                        <p className="container-title edit-password">Enter your team password</p>
                        <Form className="form-register" onSubmit={this.handlePassword} >
                            <Form.Row>
                                <Form.Group as={Col} controlId="teamPassword">
                                    <Form.Control placeholder="Team password" required type="password" onChange={this.handleChangePass} value={this.state.team.teamPassword} autoFocus />
                                </Form.Group>
                            </Form.Row>
                            <Form.Row className="form-register-submit">
                                <Form.Group as={Col}>
                                    <Button className="on btn-block" type="submit">Enter password</Button>
                                </Form.Group>
                            </Form.Row>
                        </Form>
                    </div>
                </Container>

            </div>
        );
    }

    renderActivation = (): JSX.Element => {
        return (
            <div className="activation">
                <NavigationBar navbarItems={<h5>Teams</h5>} showSettingsButton={true} showFileButtons={false} />
              
                <p className="logo"><img src={logo} alt="Logo" /></p>
                <p className="container-title">Activation Team</p>
                <p className="privacy-disclaimer">Please check your email and follow the instructions to activate your team so you can start using Internxt Drive Teams.</p>
                <ul className="privacy-remainders" style={{ paddingTop: '20px' }}>By creating an account, you are agreeing to our Terms &amp; Conditions and Privacy Policy</ul>
                <button className="btn-block on" onClick={() => {
                    //this.resendEmail(this.state.register.email);
                }}>Re-send activation email</button>
            </div>);          
    }

    render() {
        return (
            <div>
                {this.state.template()}
            </div>
        );
    }
}

export default Teams;