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
import teamsIcon from '../../assets/Dashboard-Icons/teamsIcon.svg';
import personalIcon from '../../assets/Dashboard-Icons/personalIcon.svg';


import PrettySize from 'prettysize';

import HeaderButton from './HeaderButton';

import { analytics, getUserData } from '../../lib/analytics'

import "./NavigationBar.scss";
import history from '../../lib/history';

import { getHeaders } from '../../lib/auth'
import { clearLocalStorage } from '../../lib/localStorageUtils';

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
    isAdmin: Boolean
    isMember: Boolean
}


interface NavigationBarState {
    navbarItems: JSX.Element
    workspace: string
    menuButton: any
    barLimit: number
    barUsage: number
    isTeam: Boolean
    isAdmin: Boolean
    isMember: Boolean
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
            isAdmin: this.props.isAdmin,
            isMember: this.props.isMember,
        };
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

        if (localStorage.getItem('xTeam')) {
            const usuario1 = JSON.parse(localStorage.getItem('xUser') || '{}').email
            const usuario2 = JSON.parse(localStorage.getItem('xTeam') || '{}').admin
            if (usuario1 === usuario2) {
                this.setState({ isAdmin: true });
            } else {
                this.setState({ isMember: false });
            }
        } else {
            this.setState({ isAdmin: true });
        }


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

        this.getUsage(this.state.isTeam);

    }

    componentDidUpdate(prevProps) {
        if (this.props.isTeam !== prevProps.isTeam) {
            this.getUsage(this.props.isTeam);
            this.setState({ isTeam: this.props.isTeam });
        }
    }




    handleChangeWorkspace(e) {
        if (this.state.isTeam) {
            this.setState({ workspace: 'My Workspace', isTeam: false }, () => {
                this.props.handleChangeWorkspace && this.props.handleChangeWorkspace(this.state.isTeam);
            });
        } else {
            this.setState({ workspace: 'Team Workspace', isTeam: true }, () => {
                this.props.handleChangeWorkspace && this.props.handleChangeWorkspace(this.state.isTeam);
            });
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
                <Nav className="m-auto">
                    {
                        this.props.showFileButtons
                            ?
                            <Nav className="m-auto">
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
                                <HeaderButton icon={this.state.isTeam ? personalIcon : teamsIcon} name="Team" clickHandler={this.handleChangeWorkspace.bind(this)} />
                            </Nav>
                            : this.props.navbarItems
                    }

                </Nav>
                <Nav style={{ margin: '0 13px 0 0' }}>
                    <Dropdown drop="left" className={`settingsButton${this.props.showSettingsButton ? '' : ' d-none'}`}>
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
                                {this.state.isAdmin ? <Dropdown.Item onClick={(e) => { history.push('/teams');; }}>Teams</Dropdown.Item> : ''}
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
                                    analytics.track('user-signout', {
                                        email: getUserData().email
                                    })
                                    clearLocalStorage();
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

