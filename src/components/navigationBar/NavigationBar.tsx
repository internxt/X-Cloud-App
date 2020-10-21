import React from 'react';
import { Nav, Navbar, Dropdown, ProgressBar, DropdownButton } from 'react-bootstrap';

// Assets
import account from '../../assets/Dashboard-Icons/Account.svg';
import logo from '../../assets/drive-logo.svg';

import search from '../../assets/Dashboard-Icons/Search.svg';
import uploadFileIcon from '../../assets/Dashboard-Icons/Upload.svg';
import newFolder from '../../assets/Dashboard-Icons/Add-folder.svg';
import deleteFile from '../../assets/Dashboard-Icons/Delete.svg';
import share from '../../assets/Dashboard-Icons/Share.svg';
import teams from '../../assets/Dashboard-Icons/teams.png';
import PrettySize from 'prettysize';

import HeaderButton from './HeaderButton';

import { analytics, getUserData, getUuid } from '../../lib/analytics'

import "./NavigationBar.scss";
import history from '../../lib/history';

import { getHeaders } from '../../lib/auth';

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
    teamSettings?: any
    isTeam: Boolean
    handleChangeWorkspace?: any
}


interface NavigationBarState {
    navbarItems: JSX.Element
    workspace: string
    teamBar: any
    menuButton: any
    barLimit: number
    barUsage: number
    spaceBar: JSX.Element
    isTeam: Boolean
    teamName: string
    team: {
        name: string
        barLimit: number
        barUsage: number
        maxSpaceBytes: number
        usedSpace: number
    }
}

class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> {
    constructor(props: NavigationBarProps) {
        super(props);

        this.state = {
            menuButton: null,
            navbarItems: props.navbarItems,
            workspace: 'My Workspace',
            barLimit: 1024 * 1024 * 1024 * 2,
            barUsage: 0,
            spaceBar: <div />,
            isTeam: this.props.isTeam,
            teamName: '',
            teamBar: null,
            team: {
                name: '',
                barLimit: 1024 * 1024 * 1024 * 2,
                barUsage: 0,
                maxSpaceBytes: 0,
                usedSpace: 0
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

            if (this.state.isTeam) {
                this.setState({ workspace: 'Team Workspace' })
                const idTeam = JSON.parse(localStorage.xTeam).team_id;

                fetch(`/api/limit/${idTeam}`, {
                    method: 'get',
                    headers: getHeaders(true, false)
                }
                ).then(res => {
                    return res.json();
                }).then(res1 => {

                    fetch(`/api/usage/${idTeam}`, {
                        method: 'get',
                        headers: getHeaders(true, false)
                    }
                    ).then(res => {
                        return res.json();
                    }).then(res2 => {
                        this.setState({ team: { ...this.state.team, maxSpaceBytes: res1.maxSpaceBytes}});
                        this.setState({ team: { ...this.state.team, usedSpace: res2.usedSpace}});   
                    }).catch(err => {
                        console.log('Error on fetch /api/usage', err);
                    });

                }).catch(err => {
                    console.log('Error on fetch /api/limit', err);
                });
            }
        } catch {
            history.push('/login');
            return;
        }

        this.renderBar();
        if (this.props.showFileButtons) {
            this.renderFileButtons();
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

    componentDidUpdate(prevProps) {
        if (this.props.isTeam !== prevProps.isTeam) {
            this.setState({ isTeam: this.props.isTeam });
            this.renderFileButtons();
            this.renderBar();
        }
    }

    renderBar() {
        if (this.props.isTeam) {
            this.setState({ spaceBar:
                <div>
                    <div className="dropdown-menu-group info">
                        <p className="name-lastname">My Team</p>
                        <ProgressBar className="mini-progress-bar" now={this.state.team.usedSpace} max={this.state.team.maxSpaceBytes} />
                        <p className="space-used">Used <strong>{PrettySize(this.state.team.usedSpace)}</strong> of <strong>{PrettySize(this.state.team.maxSpaceBytes)}</strong></p>
                    </div>
                </div>
            });
        } else {
            const user = JSON.parse(localStorage.xUser || '{}');
            this.setState({ spaceBar: 
                <div>
                    <div className="dropdown-menu-group info">
                        <p className="name-lastname">{user.name} {user.lastname}</p>
                        <ProgressBar className="mini-progress-bar" now={this.state.barUsage} max={this.state.barLimit} />
                        <p className="space-used">Used <strong>{PrettySize(this.state.barUsage)}</strong> of <strong>{PrettySize(this.state.barLimit)}</strong></p>
                    </div>
                </div>           
            });
        }
    }



    renderFileButtons() {
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
                {this.props.isTeam ? <HeaderButton icon={teams} name="Team settings" clickHandler={this.props.teamSettings} /> : ''}
            </Nav>
        })
    }

    handleChangeWorkspace(e) {
        let event = false;
        if (e === 'personal') {
            this.setState({ workspace: 'My Workspace'});
            event = false;;
        } else {
            this.setState({ workspace: 'Team Workspace'});
            event = true;
        }          
        console.log("CAMBIANDO DE WORKSPACE");
        console.log(e);
        this.props.handleChangeWorkspace && this.props.handleChangeWorkspace(event);
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
                
                <Dropdown className="dropdownButton" >
                    <DropdownButton id="1"  className="dropdownButton" title={this.state.workspace} onSelect={this.handleChangeWorkspace.bind(this)} type="toggle">
                        <Dropdown.Item eventKey="personal">My Workspace</Dropdown.Item>
                        <Dropdown.Item eventKey="team">Team Workspace</Dropdown.Item>
                    </DropdownButton>   
                </Dropdown>
                <Nav className="m-auto">
                    {this.state.navbarItems}
                </Nav>
                <Nav style={{ margin: '0 13px 0 0' }}>
                    <Dropdown drop="left" className="settingsButton">
                        <Dropdown.Toggle id="1"><HeaderButton icon={account} name="Menu" /></Dropdown.Toggle>
                        <Dropdown.Menu>
                            {this.state.spaceBar}
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

