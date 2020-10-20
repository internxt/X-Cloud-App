import React from 'react';
import { Nav, Navbar, Dropdown, ProgressBar } from 'react-bootstrap';

// Assets
import account from '../../assets/Dashboard-Icons/Account.svg';
import logo from '../../assets/drive-logo.svg';

import search from '../../assets/Dashboard-Icons/Search.svg';
import uploadFileIcon from '../../assets/Dashboard-Icons/Upload.svg';
import newFolder from '../../assets/Dashboard-Icons/Add-folder.svg';
import deleteFile from '../../assets/Dashboard-Icons/Delete.svg';
import share from '../../assets/Dashboard-Icons/Share.svg';
import PrettySize from 'prettysize';

import HeaderButton from './HeaderButton';

import { analytics, getUserData, getUuid } from '../../lib/analytics'

import "./NavigationBar.scss";
import history from '../../lib/history';

import { getHeaders } from '../../lib/auth';
import { getTeamById } from './../../services/TeamService';
import { getTeamMembersByUser } from './../../services/TeamMemberService';

interface NavigationBarProps {
    navbarItems: JSX.Element
    showFileButtons?: Boolean
    showSettingsButton?: Boolean
    setSearchFunction?: any
    uploadFile?: any
    createFolder?: any
    deleteItems?: any
    shareItem?: any
    uploadHandler?: any
    isTeam?: boolean
}

interface Team {
    team: {}
}

interface NavigationBarState {
    navbarItems: JSX.Element
    teamBar: any
    menuButton: any
    barLimit: number
    barUsage: number
    teamName: string
    team: {
        name: string
        component: JSX.Element
        barLimit: number
        barUsage: number
    }
}

class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> {
    constructor(props: NavigationBarProps) {
        super(props);

        this.state = {
            menuButton: null,
            navbarItems: props.navbarItems,
            barLimit: 1024 * 1024 * 1024 * 2,
            barUsage: 0,
            teamName: '',
            teamBar: null,
            team: {
                name: '',
                component: <div />,
                barLimit: 1024 * 1024 * 1024 * 2,
                barUsage: 0
            }
        };
    }

    identifyPlan(bytes: number): string {
        if (bytes <= 1073741824) {
            return "Free 2GB"
        }
        if (bytes === 21474836480) {
            return "20GB"
        }

        if (bytes === 2199023255552) {
            return "2TB"
        }

        if (bytes === 214748364800) {
            return "200GB"
        }

        return "Unknown"
    }

    componentDidMount() {
        let user = null;
        try {
            user = JSON.parse(localStorage.xUser).email;
            if (user == null) {
                throw new Error();
            }

            getTeamMembersByUser(user).then((teamMember: any) => {
                getTeamById(teamMember.id_team).then((team: any) => {

                    fetch(`/api/limit/${team.id}`, {
                        method: 'get',
                        headers: getHeaders(true, false)
                    }
                    ).then(res => {
                        return res.json();
                    }).then(res1 => {

                        fetch(`/api/usage/${team.id}`, {
                            method: 'get',
                            headers: getHeaders(true, false)
                        }
                        ).then(res => {
                            return res.json();
                        }).then(res2 => {
                            this.setState(prevState => ({
                                team: {
                                    ...prevState.team,
                                    component: this.getTeamBar({
                                        name: team.name,
                                        totalSpace: res1.maxSpaceBytes,
                                        usedSpace: res2.total
                                    })
                                }
                            }));
                        }).catch(err => {
                            console.log('Error on fetch /api/usage', err);
                        });

                    }).catch(err => {
                        console.log('Error on fetch /api/limit', err);
                    });

                }).catch(err => console.log(err));
            }).catch(err => {
                console.log(err);
            });
        } catch {
            history.push('/login');
            return;

        }

        if (this.props.showFileButtons) {
            this.setState({
                navbarItems: <Nav className="m-auto">
                    <div className="top-bar">
                        <div className="search-container">
                            <input alt="Search files" className="search" required style={{ backgroundImage: 'url(' + search + ')' }} onChange={this.props.setSearchFunction} />
                        </div>
                    </div>

                    <HeaderButton icon={uploadFileIcon} name="Upload file" clickHandler={this.props.uploadFile} />
                    <HeaderButton icon={newFolder} name="New folder" clickHandler={this.props.createFolder} />
                    <HeaderButton icon={deleteFile} name="Delete" clickHandler={this.props.deleteItems} />
                    <HeaderButton icon={share} name="Share" clickHandler={this.props.shareItem} />
                    <input id="uploadFileControl" type="file" onChange={this.props.uploadHandler} multiple={true} />
                </Nav>
            })
        }


        fetch('/api/limit', {
            method: 'get',
            headers: getHeaders(true, false)
        }
        ).then(res => {
            return res.json();
        }).then(res2 => {
            analytics.identify(getUuid(), {
                email: getUserData().email,
                plan: this.identifyPlan(res2.maxSpaceBytes)
            })
            this.setState({ barLimit: res2.maxSpaceBytes })
        }).catch(err => {
            console.log('Error on fetch /api/limit', err);
        });

        fetch('/api/usage', {
            method: 'get',
            headers: getHeaders(true, false)
        }
        ).then(res => {
            return res.json();
        }).then(res2 => {
            this.setState({ barUsage: res2.total })
        }).catch(err => {
            console.log('Error on fetch /api/usage', err);
        });
    }

    getTeamBar(team: {
        name: string
        usedSpace: number,
        totalSpace: number
    }): JSX.Element {
        return (
            <div>
                <Dropdown.Divider />
                <div className="dropdown-menu-group info">
                    <p className="name-lastname">{team.name}</p>
                    <ProgressBar className="mini-progress-bar" now={team.usedSpace} max={team.totalSpace} />
                    <p className="space-used">Used <strong>{PrettySize(team.usedSpace)}</strong> of <strong>{PrettySize(team.totalSpace)}</strong></p>
                </div>
            </div>
        );
    }

    render() {
        let user: any = null;
        try {
            user = JSON.parse(localStorage.xUser || '{}');
            if (user == null) {
                throw new Error();
            }
        } catch {
            history.push('/login');
            return "";
        }

        return (
            <Navbar id="mainNavBar">
                <Navbar.Brand>
                    <a href="/"><img src={logo} alt="Logo" /></a>
                </Navbar.Brand>
                <Nav className="m-auto">
                    {this.state.navbarItems}
                </Nav>
                <Nav style={{ margin: '0 13px 0 0' }}>
                    <Dropdown drop="left" className="settingsButton">
                        <Dropdown.Toggle id="1"><HeaderButton icon={account} name="Menu" /></Dropdown.Toggle>
                        <Dropdown.Menu>
                            <div className="dropdown-menu-group info">
                                <p className="name-lastname">{user.name} {user.lastname}</p>
                                <ProgressBar className="mini-progress-bar" now={this.state.barUsage} max={this.state.barLimit} />
                                <p className="space-used">Used <strong>{PrettySize(this.state.barUsage)}</strong> of <strong>{PrettySize(this.state.barLimit)}</strong></p>
                            </div>
                            {this.state.team.component}
                            <Dropdown.Divider />
                            <div className="dropdown-menu-group">
                                <Dropdown.Item onClick={(e) => { history.push('/storage'); }}>Storage</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { history.push('/settings'); }}>Settings</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { history.push('/security'); }}>Security</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { history.push('/invite'); }}>Referrals</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { history.push('/teams'); }}>Teams</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { 
                                    function getOperatingSystem() {
                                        let operatingSystem = 'Not known';
                                        if (window.navigator.appVersion.indexOf('Win') !== -1) { operatingSystem = 'WindowsOS'; }
                                        if (window.navigator.appVersion.indexOf('Mac') !== -1) { operatingSystem = 'MacOS'; }
                                        if (window.navigator.appVersion.indexOf('X11') !== -1) { operatingSystem = 'UNIXOS'; }
                                        if (window.navigator.appVersion.indexOf('Linux') !== -1) { operatingSystem = 'LinuxOS'; }

                                        return operatingSystem;
                                    }

                                    console.log(getOperatingSystem());

                                    switch (getOperatingSystem()) {
                                        case 'WindowsOS':
                                            window.location.href = 'https://internxt.com/downloads/drive.exe';
                                            break;
                                        case 'MacOS':
                                            window.location.href = 'https://internxt.com/downloads/drive.dmg';
                                            break;
                                        case 'Linux':
                                        case 'UNIXOS':
                                            window.location.href = 'https://internxt.com/downloads/drive.deb';
                                            break;
                                        default:
                                            window.location.href = 'https://internxt.com/downloads/';
                                            break;
                                    }

                                }}>Download</Dropdown.Item>
                                <Dropdown.Item href="mailto:hello@internxt.com">Contact</Dropdown.Item>
                            </div>
                            <Dropdown.Divider />
                            <div className="dropdown-menu-group">
                                <Dropdown.Item onClick={(e) => {
                                    analytics.track('signout', {
                                        userId: getUuid(),
                                        email: getUserData().email
                                    })
                                    localStorage.clear();
                                    history.push('/login');
                                }}>Sign out</Dropdown.Item>
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </Navbar>
        );
    }
}

export default NavigationBar;

