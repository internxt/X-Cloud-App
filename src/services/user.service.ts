import { getHeaders } from '../lib/auth';
import Settings from '../lib/settings';

export function isUserActivated() {
  return fetch('/api/user/isactivated', {
    method: 'get',
    headers: getHeaders(true, false)
  }).then((response) => {
    return response.json();
  }).catch(() => {
    console.log('Error getting user activation');
  });
}

export function initialize(email: string) {
  return fetch('/api/initialize', {
    method: 'post',
    headers: getHeaders(true, true),
    body: JSON.stringify({ email, mnemonic: Settings.get('xMnemonic') })
  }).then((user)=> {
    if (user.status !== 200) {
      throw new Error (`The user cannot be initalized ${user.status} status`);
    }
    return user.json();
  }).catch((err)=>{
    throw new Error (`The user cannot be initalized ${err} status`);
  });
}