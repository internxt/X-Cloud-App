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


interface Props {
    match?: any
    isAuthenticated: Boolean
}

interface State {
    user: {
        email: string
    }
    teamName: string
    emails: Array<string>
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
            emails: [],
            menuTitle: 'Create',
            visibility: '',
            idTeam: 0,
            showDescription: false,
            template: () => {}
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

            getTeamMembersByIdTeam(team.id).then((members: any) => {
                let remoteMembers: Array<string> = [];

                members.forEach((member: {user: string}) => {
                    remoteMembers.push(member.user);
                });

                this.setState({
                    emails: remoteMembers
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

    renderProductDescription = (): JSX.Element => {
        if (this.state.showDescription) {
            return(
                    <InxtContainer>
                        <p className="title1">Plans Description</p>

                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                            <div style={{textAlign: 'center', display: 'flex', justifyContent: 'space-between'}}>
                                <div style={{paddingRight: 12}}>
                                    <p className="title1">20GB</p>
                                    <p>Secure file sharing</p>
                                    <p>Access anywhere</p>
                                    <p>End-to-end encryption</p>
                                    <p>Collaboration</p>
                                    <p>Administration tools</p>
                                </div>

                                <div style={{ border: 'solid 1px #eaeced'}}></div>
                            </div>

                            <div style={{textAlign: 'center', display: 'flex', justifyContent: 'space-between'}}>
                                <div style={{paddingRight: 12}}>
                                    <p className="title1">200GB</p>
                                    <p>Secure file sharing</p>
                                    <p>Access anywhere</p>
                                    <p>End-to-end encryption</p>
                                    <p>Collaboration</p>
                                    <p>Administration tools</p>
                                </div>

                                <div style={{ border: 'solid 1px #eaeced'}}></div>
                            </div>

                            <div style={{textAlign: 'center', display: 'flex', justifyContent: 'space-between'}}>
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
                        <TeamsPlans handleShowDescription={this.handleShowDescription}/>
                    </InxtContainer>

                {this.renderProductDescription()}
            </div>
        );
    }

    renderTeamSettings = (): JSX.Element => {
        return <div>
                <NavigationBar navbarItems={<h5>Teams</h5>} showSettingsButton={true} showFileButtons={false} />        

                <Container className="login-main">
                    <Container className="login-container-box edit-password-box" style={{ minHeight: '430px', height: 'auto' }}>
                        <div className="container-register">
                            <p className="container-title edit-password" style={{marginLeft: 0}}>
                                {this.state.menuTitle} your team
                            </p>

                            <Form className="form-register" onSubmit={(e: any) => {
                                e.preventDefault();

                                if (this.state.emails.length > 0) {
                                    saveTeamsMembers(this.state.idTeam, this.state.emails).then((teamsMembers) => {
                                        console.log(teamsMembers);
                                    }).catch((err: any) => {});
                                }
                            }} >
                                <Form.Row>
                                    <Form.Group as={Col} controlId="teamName">
                                        <Form.Control placeholder="Team's name" name="team-name" value={this.state.teamName} onChange={this.handleChangeName} readOnly={true} />
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

                                                            fetch('/api/teams-members', {
                                                                method: 'DELETE',
                                                                headers: getHeaders(true, false),
                                                                body: JSON.stringify({
                                                                    members: [email],
                                                                    idTeam: this.state.idTeam
                                                                })
                                                            }).then(async res => {
                                                                // return { res, data: await res.json() }
                                                            }).then(res => {
                                                                // if (res.res.status !== 200) {
                                                                //     throw res.data;
                                                                // } else {
                                                                // }
                                                            }).catch(err => {
                                                                // if (err.error) {
                                                                // } else {
                                                                //     toast.warn('Internal server error. Try again later');
                                                                // }
                                                            });
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

    render() {
        return(
            <div>
                {this.state.template()}
            </div>
        );
    }
}

export default Teams;