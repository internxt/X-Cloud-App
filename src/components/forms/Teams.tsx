import React from 'react';
import { Container, ListGroup } from 'react-bootstrap';
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
import { Route } from 'react-router-dom';
import XCloud from '../xcloud/XCloud';
import { async } from 'async';
import logo from '../../assets/drive-logo.svg';
import './Teams.scss';
import { isTemplateExpression, parseConfigFileTextToJson } from 'typescript';

const openpgp = require('openpgp');


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
    dataSource: Item[]
}

interface Item {
    isMember: Boolean
    isInvitation: Boolean
    user: string
}

class Teams extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        let renderOption = this.props.match.params.option

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
            templateOption: renderOption,
            template: () => { },
            dataSource: []

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

    componentDidMount() {
        if (!this.isLoggedIn()) {
            history.push('/login');
        }

        const user = JSON.parse(localStorage.xUser);

        switch (this.state.templateOption) {
            case 'settings':
                this.setState({ template: this.renderTeamSettings.bind(this) })
                break;

            default:
                this.setState({ template: this.renderPlans.bind(this) })
                break;
        }

        const idTeam = JSON.parse(localStorage.getItem('xTeam') || '{}').idTeam;
        return fetch(`/api/teams/members/${idTeam}`, {
            method: 'get',
            headers: getHeaders(true, false),
        }).then((response) => {
            response.json().then((response) => {

                this.setState({ dataSource: response })
                console.log('respuesta', response)
            }).catch((error) => {
                console.log(error);
            });
        }).catch((error) => {
            console.log();
        });


    }

    sendEmailTeamsMember = async (mail) => {
        await fetch(`/api/user/keys/${mail}`, {
            method: 'GET',
            headers: getHeaders(true, false),
        }).then((response) => {
            response.json().then(async (rp) => {
                //Datas
                const bridgePass = JSON.parse(localStorage.getItem("xTeam") || "{}").password;
                const mnemonicTeam = JSON.parse(localStorage.getItem("xTeam") || "{}").mnemonic;
                const publicKeyArmored = Buffer.from(rp.publicKey, 'base64').toString()

                //Encrypt
                const EncryptBridgePass = await openpgp.encrypt({
                    message: openpgp.message.fromText(bridgePass),
                    publicKeys: ((await openpgp.key.readArmored(publicKeyArmored)).keys),
                });
                const EncryptMnemonicTeam = await openpgp.encrypt({
                    message: openpgp.message.fromText(mnemonicTeam),
                    publicKeys: ((await openpgp.key.readArmored(publicKeyArmored)).keys),

                });

                const base64bridge_password = Buffer.from(EncryptBridgePass.data).toString('base64')
                const base64Mnemonic = Buffer.from(EncryptMnemonicTeam.data).toString('base64')


                await fetch('/api/teams/team-invitations', {
                    method: 'POST',
                    headers: getHeaders(true, false, true),
                    body: JSON.stringify({
                        email: mail,
                        bridgePass: base64bridge_password,
                        mnemonicTeam: base64Mnemonic,
                    })
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

            }).catch((error) => {
                console.log('Error RP', error);
            });
        }).catch((error) => {
            console.log('Error getting pubKey', error);
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

    deletePeople = (item: Item) => {
        const idTeam = JSON.parse(localStorage.getItem("xTeam") || "{}").idTeam
        fetch(`/api/teams/${item.isMember ? 'member' : 'invitation'}`, {
            method: 'delete',
            headers: getHeaders(true, false),
            body: JSON.stringify({
                item: item,
                idTeam: idTeam
            })
        }).then((response) => {
            if (response.status == 200) {
                toast.info('The user has been successfully deleted');
            }
           console.log(response)
        }).catch(err => {
            toast.warn(`Error: ${err.error ? err.error : 'Internal Server Error'}`);
        });
    }






    renderTeamSettings = (): JSX.Element => {
        return <div>
            <NavigationBar navbarItems={<h5>Teams</h5>} isTeam={true} showSettingsButton={true} showFileButtons={false} />
            <div className="Teams">
                <Container className="teams-box p-5">
                    <Form className="form-register" onSubmit={this.sendInvitation}>

                        <div className="teams-title">Manage your Team</div>
                        <div className="teams-description py-3">Welcome to ''My team'' Drive account. Here you can add and remove team members.</div>
                        <Container className="mail-container mt-4">
                            <div className="row">
                                <div className="col-10 pl-0">
                                    <Form.Control className="mail-box" type="email" placeholder="example@example.com" value={this.state.email} onChange={this.handleEmailChange} />
                                </div>
                                <Button className="invite-button col-2" type="submit" onClick={() => {

                                }}>Invite</Button>
                            </div>
                        </Container>
                    </Form>
                    <Container fluid className="lista-container mt-4">
                            <ListGroup className='teams-lista'>
                                {this.state.dataSource.map(item => {
                                    return <ListGroup.Item >
                                        <div className="row">
                                            <div className='col-11'><span>{item.user}</span></div>
                                            <div className='col-1'><span onClick={this.deletePeople.bind(this, item)}><i className="far fa-trash-alt"></i></span></div>
                                        </div>


                                    </ListGroup.Item>
                                })}


                            </ListGroup>
                    </Container>

                </Container>
            </div>
        </div>
    }

    renderActivation = (): JSX.Element => {
        return (
            <div className="activation">
                <NavigationBar navbarItems={<h5>Teams</h5>} isTeam={false} showSettingsButton={true} showFileButtons={false} />

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
                {this.renderTeamSettings()}
            </div>
        );
    }
}

export default Teams;