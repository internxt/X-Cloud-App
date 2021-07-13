import { getHeaders } from '../lib/auth';

/**
 * Calls drive API to get Storage limit of a client
 * @param {String} maxCalls - Max number of API calls that it can be made (Default 5 calls)
 *
 */
export function getLimit(isTeam: boolean, maxCalls : number = 5) {
  return fetch('/api/limit', {
    method: 'get',
    headers: getHeaders(true, false, isTeam)
  }).then(res => {
    if (res.status !== 200) {
      throw res;
    }
    return res.json();
  }).then(res1 => {
    return res1.maxSpaceBytes;
  }).catch(err => {
    if (maxCalls > 0) {
      return getLimit(isTeam, maxCalls - 1);
    }
    console.log('Error getting /api/limit for App', err);
  });
}

export function getContentFolder(rootId) {
  console.log('rootid', rootId);
  return fetch(`/api/storage/folder/${rootId}`, {
    method: 'get',
    headers: getHeaders(true, true)
  }).then((res) => {
    if (res.status !== 200) {
      throw res;
    } else {
      return res.json();
    }
  }).then(async (data) => {
    return data;
  })
    .catch((err) => {
      console.log('ERR get content foolder', err);
    });
}

export function getTreeFolders(rootId) {
  return getContentFolder(rootId).then((res) => {
    return res;
  });
}