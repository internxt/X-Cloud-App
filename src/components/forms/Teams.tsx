import React from 'react';
import { Container } from 'react-bootstrap';
import './Login.scss';
import './Reset.scss';
import { Form, Col, Button } from 'react-bootstrap';
import NavigationBar from './../navigationBar/NavigationBar';
import history from '../../lib/history';
import InxtContainer from './../InxtContainer';
import TeamsPlans from './../TeamPlans';
import { getHeaders } from '../../lib/auth';
//saveTeamsMembersimport { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import logo from '../../assets/drive-logo.svg';


interface Props {
    match?: any
    isAuthenticated: Boolean
    templateOption?: string
}

interface State {
    user: {
        email: string,
        isAdmin: Boolean,
        isTeamMember: Boolean
    }
    team: {
        bridgeUser: string,
        teamPassword: string
    }
    idTeam: number
    teamName: string
    email: string
    isTeamActivated: boolean
    menuTitle: string
    visibility: string
    showDescription: boolean
    template: any
    templateOption?: string
}

class Teams extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props); 

        this.state = {
            user: {
                email: '',
                isAdmin: false,
                isTeamMember: false
            },
            team: {
                bridgeUser: '',
                teamPassword: ''
            },
            idTeam: 0,
            teamName: '',
            email: '',
            isTeamActivated: false,
            menuTitle: 'Create',
            visibility: '',
            showDescription: false,
            templateOption: this.props.match.params.option,
            template: () => { }
        }

        this.handleChangePass = this.handleChangePass.bind(this);
    }

    handleShowDescription = (_showDescription) => {
        this.setState({ showDescription: _showDescription });
    }

    handleChangePass = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({ team: { ...this.state.team, teamPassword: event.currentTarget.value } });
    }


    handlePassword = (password: any) => {
        console.log(password)
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


    componentDidMount() {
        if (!this.isLoggedIn()) {
            history.push('/login');
        }

        switch (this.state.templateOption) {
            case 'settings':
                this.setState({ template: this.renderTeamSettings.bind(this) })
                break;
            case 'password':
                this.setState({ template: this.renderPassword.bind(this) })
                break;
            case 'plans':
                this.setState({ template: this.renderPlans.bind(this) })
                break;
            default:
                this.setState({ template: this.renderPlans.bind(this) })
                break;
        }
        this.render();
    }


    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.option !== this.props.match.params.option) {
            this.setState({ 
                template: this.renderPassword.bind(this),
            })
        }
    }


    sendEmailTeamsMember = (mail) => {
        fetch('/api/team-invitations', {
            method: 'POST',
            headers: getHeaders(true, false),
            body: JSON.stringify({ email: mail })
        }).then(async res => {
            return { response: res, data: await res.json() };
        }).then(res => {
            if (res.response.status !== 200) {
                throw res.data;
            } else {
                toast.info(`Invitation email sent to ${mail}`);
            }
        }).catch(err => {
            toast.warn(`Error: ${err.error ? err.error : 'Internal Server Error'}`);
        });
    }


    handleEmailChange = (event) => {
        this.setState({
            email: event.target.value
        });
    }

    formRegisterSubmit = (e: any) => {
        e.preventDefault();

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
                <NavigationBar navbarItems={<h5>Teams</h5>} isTeam={false} showSettingsButton={true} showFileButtons={false} />

                <InxtContainer>
                    <TeamsPlans handleShowDescription={this.handleShowDescription} />
                </InxtContainer>

                {this.renderProductDescription()}
            </div>
        );
    }

    handleChangeName = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({ teamName: event.currentTarget.value });
    }


    handleKeySaved = (user: JSON) => {
        localStorage.setItem('xUser', JSON.stringify(user));
    }

    validateEmailInvitations = (email) => {
        // eslint-disable-next-line no-control-regex
        const emailPattern = /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*"))@((?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/
        return emailPattern.test(email.toLowerCase());
    }

    sendInvitation = (e: any) => {
        e.preventDefault()
        const mails = this.state.email;
        if (mails !== undefined && this.validateEmailInvitations(mails)) {
            this.sendEmailTeamsMember(mails)
        } else {
            toast.warn(`Please, enter a valid email before sending out the invite`);
        }
        return
    }


    renderTeamSettings = (): JSX.Element => {
        return (<div>
            <NavigationBar navbarItems={<h5>Teams</h5>} isTeam={true} showSettingsButton={true} showFileButtons={false} />

            <Container className="login-container-box management-container" style={{ minHeight: '350px', height: 'auto' }}>
                <div className="container-register">
                    <p className="container-title edit-password" style={{ marginLeft: 0 }}>
                        Manage your team
                    </p>

                    <Form className="form-register" onSubmit={this.sendInvitation}>
                        <Form.Row>
                            <Form.Group as={Col} controlId="invitedMember">
                                <Form.Control placeholder="example@example.com" name="team-name" type="email" required value={this.state.email} onChange={this.handleEmailChange}/>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Button className="on btn-block" type="submit">Invite</Button>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row className="form-register-submit">
                            <Form.Group as={Col}>
                                <Button className="on btn-block" type="submit">Invite</Button>
                            </Form.Group>
                        </Form.Row>
                    </Form>
                    </div>
                </Container>
        </div>
        );
    }


    renderPassword = (): JSX.Element => {
        return (
            <div className="password">
                <NavigationBar navbarItems={<h5>Teams</h5>} isTeam={true} showSettingsButton={true} showFileButtons={false} />

                <Container className="login-container-box edit-password-box">
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
                <NavigationBar navbarItems={<h5>Teams</h5>} isTeam={true} showSettingsButton={true} showFileButtons={false} />

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