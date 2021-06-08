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