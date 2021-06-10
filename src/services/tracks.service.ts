import { getUserData } from '../lib/analytics';

interface IFileTrack {
    size: number
    type: string
    id?: number
}

export function trackFileUploadStart(file: IFileTrack, parentFolderId: number) {
  window.analytics.track('file-upload-start', {
    file_size: file.size,
    file_type: file.type,
    folder_id: parentFolderId,
    email: getUserData().email,
    platform: 'web'
  });
}

export function trackFileUploadFinished(file: IFileTrack) {
  console.log('file', file);
  window.analytics.track('file-upload-finished', {
    email: getUserData().email,
    file_size: file.size,
    file_type: file.type,
    file_id: file.id
  });
}

export function trackFileUploadError(file: IFileTrack, parentFolderId: number, msg: string) {
  window.analytics.track('file-upload-error', {
    file_size: file.size,
    file_type: file.type,
    folder_id: parentFolderId,
    email: getUserData().email,
    msg,
    platform: 'web'
  });
}

export function trackFileDownloadStart(file_id: string, file_name: string, file_size: number, file_type: string, folder_id: number) {
  const email = getUserData().email;
  const data = { file_id, file_name, file_size, file_type, email, folder_id, platform: 'web' };

  window.analytics.track('file-download-start', data);
}

export function trackFileDownloadError(file_id: string, msg: string) {
  const email = getUserData().email;
  const data = { file_id, email, msg, platform: 'web' };

  window.analytics.track('file-download-error', data);
}

export function trackFileDownloadFinished(file_id: string, file_size: number) {
  const email = getUserData().email;
  const data = { file_id, file_size, email, platform: 'web' };

  window.analytics.track('file-download-finished', data);
}

export function trackCreateFolder() {
  window.analytics.track('folder-created', {
    email: getUserData().email,
    platform: 'web'
  });
}

export function trackFileRename(itemId: number) {
  window.analytics.track('file-rename', {
    file_id: itemId,
    email: getUserData().email,
    platform: 'web'
  });

}

export function trackMoveItem(keyOp: string, itemId: number) {
  window.analytics.track(`${keyOp}-move`.toLowerCase(), {
    file_id: itemId,
    email: getUserData().email,
    platform: 'web'
  });
}

export function tracksDeleteItems(itemToDelete: any) {
  window.analytics.track((itemToDelete.isFolder ? 'folder' : 'file') + '-delete', {
    email: getUserData().email,
    platform: 'web'
  });
}
