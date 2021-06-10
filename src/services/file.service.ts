import fileDownload from 'js-file-download';
import { getHeaders } from '../lib/auth';

export async function getWelcomeFile(isTeam: boolean) {
  return fetch('/api/welcome', {
    method: 'get',
    headers: getHeaders(true, false, isTeam)
  }).then(res => {
    return res.json();
  }).then(body => {
    return body.file_exists;
  });
}

export async function openWelcomeFile() {
  window.analytics.track('file-welcome-open');
  return fetch('/Internxt.pdf').then(res => res.blob()).then(obj => {
    fileDownload(obj, 'Welcome.pdf');
  }).catch((err) => {
    throw new Error(`File cannot be opened ${err.message}`);
  });
}

export async function deleteWelcomeFile(isTeam: boolean) {
  window.analytics.track('file-welcome-delete');
  return fetch('/api/welcome', {
    method: 'delete',
    headers: getHeaders(true, false, isTeam)
  }).catch(err => {
    throw new Error(`Cannot delete welcome file ${err.message}`);
  });
}

export function updateMetaData(data: any, itemId: number, isTeam: boolean) {
  return fetch(`/api/storage/file/${itemId}/meta`, {
    method: 'post',
    headers: getHeaders(true, true, isTeam),
    body: data
  })
    .then()
    .catch((err) => {
      throw new Error(`Cannot update metadata file ${err}`);
    });
}