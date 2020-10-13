import React from 'react';
import { Container } from 'react-bootstrap';
import './Login.scss';
import './Reset.scss';
import { Form, Col, Button } from 'react-bootstrap';
import NavigationBar from './../navigationBar/NavigationBar';
import { ReactMultiEmail, isEmail } from 'react-multi-email';
import 'react-multi-email/style.css';
import history from '../../lib/history';
import { getTeamByUserOwner } from './../../services/TeamService';
import { getTeamMembersByIdTeam, saveTeamsMembers } from './../../services/TeamMemberService';
import InxtContainer from './../InxtContainer';
import TeamsPlans from './../TeamPlans';
import { getHeaders } from '../../lib/auth';
//saveTeamsMembersimport { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';


interface Props {
    match?: any
    isAuthenticated: Boolean
}

interface State {
    user: {
        email: string
    }
    teamName: string
    email: string
    menuTitle: string
    visibility: string
    idTeam: number
    showDescription: boolean
    template: any
}

class Teams extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            user: {
                email: ''
            },
            teamName: '',
            email: '',
            menuTitle: 'Create',
            visibility: '',
            idTeam: 0,
            showDescription: false,
            template: () => { }
        }
    }

    handleShowDescription = (_showDescription) => {
        this.setState({ showDescription: _showDescription });
    }

    handleChangeName = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({ teamName: event.currentTarget.value });
    }

    isLoggedIn = () => {
        return !(!localStorage.xToken);
    }

    componentDidMount() {
        if (!this.isLoggedIn()) {
            history.push('/login');
        }

        const user = JSON.parse(localStorage.xUser);
        this.setState({ user: user });

        getTeamByUserOwner(user.email).then((team: any) => {
            this.setState({
                template: this.renderTeamSettings.bind(this),
                menuTitle: 'Manage',
                visibility: 'd-none',
                idTeam: team.id,
                teamName: team.name
            });
            
            //Cogemos id de cada team, y entonces a los miembros de cualquier tipo
            getTeamMembersByIdTeam(team.id).then((members: any) => {
                //decimos que es un string en los remoteMembers
                let remoteMembers: string = ''
                //por cada miembro de tipo usuario string le meteremos los miembros

                members.forEach((member: { user: string }) => {
                    remoteMembers.concat(member.user);
                    
                });

                this.setState({
                    email: remoteMembers
                });

            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            this.setState({
                template: this.renderPlans.bind(this)
            });
        });
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
                toast.warn(`Invitation email sent to ${mail}`);
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


    formRegisterSubmit(e: any) {
        e.preventDefault();

        if (this.state.email.length > 0) {
            saveTeamsMembers(this.state.idTeam, this.state.email).then((teamsMembers) => {
                console.log(teamsMembers);
            }).catch((err: any) => { });
        }
    }


    renderTeamSettings = (): JSX.Element => {
        return <div>
            <NavigationBar navbarItems={<h5>Teams</h5>} showSettingsButton={true} showFileButtons={false} />

            <Container className="login-main">
                <Container className="login-container-box edit-password-box" style={{ minHeight: '430px', height: 'auto' }}>
                    <div className="container-register">
                        <p className="container-title edit-password" style={{ marginLeft: 0 }}>
                            {this.state.menuTitle} your team
                            </p>

                        <Form className="form-register" onSubmit={(this.formRegisterSubmit.bind(this))}>

                            <Form.Row>
                                <Form.Group as={Col} controlId="teamName">
                                    <Form.Control placeholder="Team's name" name="team-name" value={this.state.teamName} onChange={this.handleChangeName} readOnly={true} />
                                </Form.Group>
                            </Form.Row>

                            <Form.Row>
                                <Form.Group as={Col} controlId="invitedMember">
                                    <div>
                                        <input className="mail-box" type="email" placeholder="example@example.com" value={this.state.email} onChange={this.handleEmailChange} />
                                    </div>
                                
                                  
                                </Form.Group>
                            </Form.Row>

                            <Form.Row className="form-register-submit">
                                <Form.Group as={Col}>
                                   
                                    <Button className="send-button" type="button" onClick={() => {
                                        const mails = this.state.email;
                                        if (mails !== undefined) {
                                            console.log(mails)
                                            this.sendEmailTeamsMember(mails)
                                        } else {
                                            toast.warn(`Please, enter a valid email before sending out the invite`);
                                        }
                                    }}>Invite</Button>

                                </Form.Group>
                            </Form.Row>
                        </Form>
                    </div>
                </Container>
            </Container>
        </div>;
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