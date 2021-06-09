import { getHeaders } from '../lib/auth';
import _ from 'lodash';
import { deleteWelcomeFile, openWelcomeFile, getWelcomeFile } from './file.service';
import Settings from '../lib/settings';
import history from '../lib/history';
 interface IFolders {
  bucket: string
  color: string
  createdAt: Date
  encrypt_version: string
  icon: string
  iconId: any
  icon_id: any
  id: number
  isDownloading: boolean
  isFolder: boolean
  isLoading: boolean
  isSelected: boolean
  name: string
  parentId: number
  parent_id: number
  updatedAt: Date
  userId: number
  user_id: number
}

//  interface IFiles {
//   bucket: string
//   createdAt: Date
//   created_at: Date
//   deleted: boolean
//   deletedAt: null
//   encrypted_version: string
//   fileId: string
//   folderId: number
//   folder_id: number
//   id: number
//   name: string
//   type: string
//   updatedAt: Date
// }
 interface IChildrens {
  bucket: string
  color: string
  createdAt: Date
  encrypt_version: string
  icon: string
  iconId: any
  icon_id: any
  id: number
  name: string
  parentId: number
  parent_id: number
  updatedAt: Date
  userId: number
  user_id: number
}
 interface IContentFolder {
  bucket: string
  children: IChildrens[]
  color: string
  createdAt: Date
  encrypt_version: string
  files: any[]
  icon: string
  iconId: any
  icon_id: any
  id: number
  name: string
  parentId: number
  parent_id: number
  updatedAt: Date
  userId: number
  user_id: number

}

function fetchContentFolder(rootId: string, isTeam: boolean): Promise<IContentFolder> {
  return fetch(`/api/storage/folder/${rootId}`, {
    method: 'get',
    headers: getHeaders(true, true, isTeam)
  }).then((res) => {
    if (res.status !== 200) {
      throw new Error(`Server failed with status ${res.status}`);
    }
    return res.json();
  });
}

function extendUIPropertiesOf(contentFolder: IContentFolder) {
  const folders: IFolders[] = _.map(contentFolder.children, (o: IFolders) =>
    _.extend({ isFolder: true, isSelected: false, isLoading: false, isDowloading: false }, o)
  );

  return { newCommanderFolders: folders, newCommanderFiles: contentFolder.files };
}

export async function getContentFolderService(rootId: string, isTeam: boolean) {
  try {
    const contentFolders = await fetchContentFolder(rootId, isTeam);

    if (contentFolders) {
      const welcomeFile = await getWelcomeFile(isTeam);
      const newCommanderFolders = extendUIPropertiesOf(contentFolders).newCommanderFolders;
      let newCommanderFiles = extendUIPropertiesOf(contentFolders).newCommanderFiles;

      if (!contentFolders.parentId && welcomeFile) {
        newCommanderFiles = _.concat([{
          id: 0,
          file_id: '0',
          fileId: '0',
          name: 'Welcome',
          type: 'pdf',
          size: 0,
          isDraggable: false,
          get onClick() {
            return () => {
              openWelcomeFile();
            };
          },
          onDelete: async () => {
            await deleteWelcomeFile(false);
          }
        }], newCommanderFiles);
      }
      return { contentFolders, newCommanderFolders, newCommanderFiles };
    }
  } catch (err) {
    if (err.status && err.status === 401) {
      Settings.clear();
      history.push('/login');
      return;
    }
    throw err;
  }
}