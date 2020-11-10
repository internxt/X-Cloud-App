import React from 'react';
import history from '../../lib/history';
import { getHeaders } from '../../lib/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container } from 'react-bootstrap';
import './Login.scss';
import './Reset.scss';
import { Form, Col, Button } from 'react-bootstrap';
import NavigationBar from './../navigationBar/NavigationBar';
import { encryptText, decryptTextWithKey, decryptText, passToHash } from '../../lib/utils';
import { getTeamMembersByUser } from '../../services/TeamMemberService';

interface Props {
  match: any
}

interface State {
  isTeamActivated: Boolean | null
  isTeamError: Boolean
  member?: string,
  teamPassword?: string
}

class JoinTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isTeamActivated: null,
      isTeamError: false,
      member: "",
      teamPassword: ""

    };
    this.redirect = this.redirect.bind(this)

  }

  componentDidMount() {
    this.joinToTheTeam(this.props.match.params.token);
  }

  joinToTheTeam(token) {

    fetch(`/api/teams/join/${token}`, {
      method: 'post',
      headers: getHeaders(false, false),
      body: JSON.stringify({
        member:  this.state.member,
        teamPassword: this.state.teamPassword
      })
    }).then(response => {
      if (response.status === 200) {
        this.setState({ isTeamActivated: true });
        toast.info("You've been joined succesfully to the team!");
        history.push('/');
      } else {
        console.log(response)
        // Wrong activation
        this.setState({ isTeamActivated: false })
        console.log('error', token)
        toast.info("You've been NOT joined succesfully to the team!");
        console.log('error', token)
      }

    }).catch(error => {
      this.setState({ isTeamActivated: false })
      console.log('Activation error: ' + error);

    })
  }

  redirect = () => {

    if (this.state.isTeamActivated) {
      toast.info('You have been joined succesfully to the team!', { className: 'xcloud-toast-info' })
    } else {
      toast.warn('Invalid token code')
      toast.warn('Your activation code is invalid. Maybe you have used this link before and your account is already activated.')
    }
    history.push("/");
  }

  render() {
    return(<div />)
  }
}

export default JoinTeam;