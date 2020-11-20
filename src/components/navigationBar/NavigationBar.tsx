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
import teamsIcon from '../../assets/Dashboard-Icons/teamsIcon.svg';
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
    showTeamSettings?: any
    isTeam: Boolean
    handleChangeWorkspace?: any
}


interface NavigationBarState {
    navbarItems: JSX.Element
    workspace: string
    menuButton: any
    barLimit: number
    barUsage: number
    isTeam: Boolean
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
            isTeam: this.props.isTeam,
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

    async getUsage(isTeam: Boolean = false) {

        const limit = await fetch('/api/limit/', {
            headers: getHeaders(true, false, isTeam)
        }).then(res => res.json())

        const usage = await fetch('/api/usage/', {
            headers: getHeaders(true, false, isTeam)
        }).then(res3 => res3.json())

        this.setState({
            barUsage: usage.total,
            barLimit: limit.maxSpaceBytes
        })

    }

    componentDidMount() {
        let user = null;
        try {
            user = JSON.parse(localStorage.xUser).email;
            if (user == null) {
                throw new Error();
            }
        } catch {
            history.push('/login');
            return;
        }
        if (this.props.showFileButtons) {
            this.renderFileButtons();
        }
        this.getUsage(this.state.isTeam);

    }

    componentDidUpdate(prevProps) {
        if (this.props.isTeam !== prevProps.isTeam) {
            this.getUsage(this.props.isTeam);
            this.setState({ isTeam: this.props.isTeam });
            this.renderFileButtons();

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
                {this.props.isTeam ? <HeaderButton icon={teamsIcon} name="Team settings" clickHandler={this.props.showTeamSettings} /> : ''}
            </Nav>
        })
    }

    handleChangeWorkspace(e) {
        let event = false;
        if (e === 'personal') {
            this.setState({ workspace: 'My Workspace' });
            event = false;;
        } else {
            this.setState({ workspace: 'Team Workspace' });
            event = true;
        }
        console.log("CAMBIANDO DE WORKSPACE");
        console.log(e);
        this.props.handleChangeWorkspace && this.props.handleChangeWorkspace(event);
    }


    handleTeamSection() {
        const team = JSON.parse(localStorage.xTeam || "{}");
        const user = JSON.parse(localStorage.xUser);

        console.log(team)
        console.log(user)

        if (team && team.admin === user.email) {
            history.push("/teams/password");
        } else {
            history.push("/teams");
        }
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
                    <DropdownButton id="1" className="dropdownButton" title={this.state.workspace} onSelect={this.handleChangeWorkspace.bind(this)} type="toggle">
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
                            <div className="dropdown-menu-group info">
                                <p className="name-lastname"> {this.state.isTeam ? 'My Team' : `${user.name} ${user.lastname}`} </p>
                                <ProgressBar className="mini-progress-bar" now={this.state.barUsage} max={this.state.barLimit} />
                                <p className="space-used">Used <strong>{PrettySize(this.state.barUsage)}</strong> of <strong>{PrettySize(this.state.barLimit)}</strong></p>
                            </div>
                            <Dropdown.Divider />
                            <div className="dropdown-menu-group">
                                <Dropdown.Item onClick={(e) => { history.push('/storage'); }}>Storage</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { history.push('/settings'); }}>Settings</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { history.push('/security'); }}>Security</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { history.push('/invite'); }}>Referrals</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { history.push('/teams');; }}>Teams</Dropdown.Item>
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

