import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import _ from 'lodash';
import update from 'immutability-helper';
import async from 'async';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import FileActivity from '../../components/FileActivity/FileActivity';
import AppHeader from '../../components/AppHeader/AppHeader';
import FileView from '../../components/FileView/FileView';

import { removeAccents, getFilenameAndExt, renameFile, encryptFilename } from '../../lib/utils';

import { getHeaders } from '../../lib/auth';

import localStorageService from '../../services/localStorage.service';
import { Network, getEnvironmentConfig } from '../../lib/network';
import { storeTeamsInfo } from '../../services/teams.service';
import history from '../../lib/history';

import { UserSettings } from '../../models/interfaces';
import SideNavigator from '../../components/SideNavigator/SideNavigator';
import FileLogger from '../../components/FileLogger';
import deviceService from '../../services/device.service';
import analyticsService from '../../services/analytics.service';
import { DevicePlatform } from '../../models/enums';

import { setHasConnection } from '../../store/slices/networkSlice';
import { setIsLoading, setItems, selectItem, resetSelectedItems } from '../../store/slices/storageSlice';
import fileService from '../../services/file.service';
import folderService, { ICreatedFolder } from '../../services/folder.service';
import { RootState } from '../../store';

import './NewXCloud.scss';

interface NewXCloudProps {
  user: UserSettings | any,
  isLoadingItems: boolean,
  currentItems: any[],
  isAuthenticated: boolean;
  isActivated: boolean;
  handleKeySaved: (user: JSON) => void;
  setHasConnection: (value: boolean) => void;
  setIsLoadingItems: (value: boolean) => void;
  setItems: (items: any[]) => void;
  selectItem: (itemId: number) => void;
  resetSelectedItems: () => void
}

interface NewXCloudState {
  email: string;
  isAuthorized: boolean;
  isInitialized: boolean;
  isTeam: boolean;
  token: string;
  chooserModalOpen: boolean;
  rateLimitModal: boolean;
  currentFolderId: number | null;
  currentFolderBucket: string | null;
  namePath: any[];
  sortFunction: any;
  searchFunction: any;
  popupShareOpened: boolean,
  showDeleteItemsPopup: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

class NewXCloud extends React.Component<NewXCloudProps, NewXCloudState> {
  constructor(props: NewXCloudProps) {
    super(props);

    this.state = {
      email: '',
      isAuthorized: false,
      isInitialized: false,
      isTeam: false,
      token: '',
      chooserModalOpen: false,
      rateLimitModal: false,
      currentFolderId: null,
      currentFolderBucket: null,
      namePath: [],
      sortFunction: null,
      searchFunction: null,
      popupShareOpened: false,
      showDeleteItemsPopup: false,
      isAdmin: true,
      isMember: false
    };
  }

  moveEvent = {};

  componentDidMount = () => {
    window.addEventListener('offline', () => {
      this.props.setHasConnection(false);
    });
    window.addEventListener('online', () => {
      this.props.setHasConnection(true);
    });

    deviceService.redirectForMobile();

    // When user is not signed in, redirect to login
    if (!this.props.user || !this.props.isAuthenticated) {
      history.push('/login');
    } else {
      if (!this.props.user.root_folder_id) {
        // Initialize user in case that is not done yet
        this.userInitialization().then((resultId) => {
          console.log('getFolderContent 3');
          this.getFolderContent(resultId);
        }).catch((error) => {
          const errorMsg = error ? error : '';

          toast.warn('User initialization error ' + errorMsg);
          history.push('/login');
        });
      } else {
        console.log('getFolderContent 4');
        storeTeamsInfo().finally(() => {
          if (localStorageService.exists('xTeam') && !this.state.isTeam && localStorageService.get('workspace') === 'teams') {
            this.handleChangeWorkspace();
          } else {
            this.getFolderContent(this.props.user.root_folder_id);
            this.setState({ currentFolderId: this.props.user.root_folder_id });
          }
          const team: any = localStorageService.getTeams();

          if (team && !team.root_folder_id) {
            this.setState({ currentFolderId: this.props.user.root_folder_id });
          }

          this.setState({ isInitialized: true });
        }).catch(() => {
          localStorageService.del('xTeam');
          this.setState({
            isTeam: false
          });
        });
      }

    }
  };

  handleChangeWorkspace = () => {
    const xTeam: any = localStorageService.getTeams();
    const xUser: any = localStorageService.getUser();

    if (!localStorageService.exists('xTeam')) {
      toast.warn('You cannot access the team');
      this.setState({
        isTeam: false
      });
    }

    if (this.state.isTeam) {
      this.setState({ namePath: [{ name: 'All files', id: xUser.root_folder_id }] }, () => {
        this.getFolderContent(xUser.root_folder_id, false, true, false);
      });
    } else {
      this.setState({ namePath: [{ name: 'All files', id: xTeam.root_folder_id }] }, () => {
        this.getFolderContent(xTeam.root_folder_id, false, true, true);
      });
    }

    const isTeam = !this.state.isTeam;

    this.setState({ isTeam: isTeam }, () => {
      localStorageService.set('workspace', isTeam ? 'teams' : 'individual');
    });
  }

  userInitialization = () => {
    return new Promise((resolve, reject) => {
      fetch('/api/initialize', {
        method: 'post',
        headers: getHeaders(true, true),
        body: JSON.stringify({
          email: this.props.user.email,
          mnemonic: localStorageService.get('xMnemonic')
        })
      }).then((response) => {
        if (response.status === 200) {
          // Successfull intialization
          this.setState({ isInitialized: true });
          // Set user with new root folder id
          response.json().then((body) => {
            const updatedUser = this.props.user;

            updatedUser.root_folder_id = body.user.root_folder_id;
            this.props.handleKeySaved(updatedUser);
            resolve(body.user.root_folder_id);
          });
        } else {
          reject(null);
        }
      }).then(folderId => {
        console.log('getFolderContent 7');
        this.getFolderContent(folderId);
      })
        .catch((error) => {
          reject(error);
        });
    });
  };

  getTeamByUser = () => {
    return new Promise((resolve, reject) => {
      const user: any = localStorageService.getUser();

      fetch(`/api/teams-members/${user.email}`, {
        method: 'get',
        headers: getHeaders(true, false)
      }).then((result) => {
        if (result.status !== 200) {
          return;
        }
        return result.json();
      }).then(result => {
        if (result.admin === user.email) {
          result.rol = 'admin';
          this.setState({ isAdmin: true, isMember: false });
        } else {
          result.rol = 'member';
          this.setState({ isAdmin: false, isMember: true });
        }
        resolve(result);
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    });
  }

  setSortFunction = (newSortFunc) => {
    // Set new sort function on state and call getFolderContent for refresh files list
    this.setState({ sortFunction: newSortFunc });
    console.log('getFolderContent 8');
    this.getFolderContent(this.state.currentFolderId, false, true);
  };

  setSearchFunction = (e) => {
    const searchString = removeAccents(e.target.value.toString()).toLowerCase();
    let func: ((item: any) => void) | null = null;

    if (searchString) {
      func = function (item) {
        return item.name.toLowerCase().includes(searchString);
      };
    }

    this.setState({ searchFunction: func });
    console.log('getFolderContent 9');
    this.getFolderContent(this.state.currentFolderId, false, true, this.state.isTeam);
  };

  createFolder = () => {
    const { isTeam, currentFolderId, namePath } = this.state;
    const folderName = prompt('Please enter folder name');

    if (folderName && folderName !== '') {
      folderService.createFolder(isTeam, currentFolderId, folderName)
        .then((response: ICreatedFolder[]) => {
          this.getFolderContent(currentFolderId, false, true, isTeam);
        }).catch((err) => {
          if (err.includes('already exists')) {
            toast.warn('Folder with same name already exists');
          } else {
            toast.warn(`"${err}"`);
          }
        });
    } else {
      toast.warn('Invalid folder name');
    }
  };

  folderNameExists = (folderName) => {
    return this.props.currentItems.find(
      (item: any) => item.isFolder && item.name === folderName
    );
  };

  fileNameExists = (fileName, type) => {
    return this.props.currentItems.some(
      (item: any) => !item.isFolder && item.name === fileName && item.type === type
    );
  };

  getNextNewName = (originalName, i) => `${originalName} (${i})`;

  getNewFolderName = (name) => {
    let exists = false;

    let i = 1;
    const currentFolder = this.props.currentItems.filter((item: any) => item.isFolder);

    let finalName = name;

    const foldName = name.replace(/ /g, '');

    currentFolder.map((folder: any) => {
      const fold = folder.name.replace(/ /g, '');

      if (foldName === fold) {
        exists = true;
      } else {
        exists = false;
        finalName = name;
      }
    });

    while (exists) {
      const newName = this.getNextNewName(name, i);

      exists = currentFolder.find((folder: any) => folder.name === newName) !== undefined;
      i += 1;
      finalName = newName;
    }

    return finalName;
  };

  getNewFileName = (name, type) => {
    let exists = true;

    let i = 1;

    let finalName;
    const currentFiles = this.props.currentItems.filter((item: any) => !item.isFolder);

    while (exists) {
      const newName = this.getNextNewName(name, i);

      exists = currentFiles.find((file: any) => file.name === newName && file.type === type) !== undefined;
      finalName = newName;
      i += 1;
    }

    return finalName;
  };

  getNewName = (name, type = undefined) => {
    // if has type is file
    if (type) {
      return this.getNewFileName(name, type);
    }

    return this.getNewFolderName(name);
  };

  createFolderByName = (folderName, parentFolderId) => {
    let newFolderName = folderName;

    // No parent id implies is a directory created on the current folder, so let's show a spinner
    if (!parentFolderId) {
      const items: any[] = this.props.currentItems;

      if (this.folderNameExists(newFolderName)) {
        newFolderName = this.getNewName(newFolderName);
      }

      items.push({
        name: newFolderName,
        isLoading: true,
        isFolder: true
      });

      this.props.setItems(items);
    } else {
      newFolderName = this.getNewName(newFolderName);
    }

    parentFolderId = parentFolderId || this.state.currentFolderId;

    return new Promise((resolve, reject) => {
      fetch('/api/storage/folder', {
        method: 'post',
        headers: getHeaders(true, true, this.state.isTeam),
        body: JSON.stringify({
          parentFolderId,
          folderName: newFolderName,
          teamId: _.last(this.state.namePath) && _.last(this.state.namePath).hasOwnProperty('id_team') ? _.last(this.state.namePath).id_team : null
        })
      })
        .then(async (res) => {
          const data = await res.json();

          if (res.status !== 201) {
            throw data;
          }
          return data;
        })
        .then(resolve)
        .catch(reject);
    });
  };

  openFolder = (e): Promise<void> => {
    return new Promise((resolve) => {
      console.log('getFolderContent 11');
      this.getFolderContent(e, true, true, this.state.isTeam);
      resolve();
    });
  };

  getFolderContent = async (rootId, updateNamePath = true, showLoading = true, isTeam = false): Promise<any> => {
    try {
      this.props.setIsLoadingItems(true);

      await fileService.fetchWelcomeFile(isTeam);
      const content = await folderService.fetchFolderContent(rootId, isTeam);

      this.deselectAll();

      // Apply search function if is set
      if (this.state.searchFunction) {
        content.newCommanderFolders = content.newCommanderFolders.filter(this.state.searchFunction);
        content.newCommanderFiles = content.newCommanderFiles.filter(this.state.searchFunction);
      }
      // Apply sort function if is set
      if (this.state.sortFunction) {
        content.newCommanderFolders.sort(this.state.sortFunction);
        content.newCommanderFiles.sort(this.state.sortFunction);
      }

      this.setState({
        currentFolderId: content.contentFolders.id,
        currentFolderBucket: content.contentFolders.bucket
      });

      this.props.setItems(_.concat(content.newCommanderFolders, content.newCommanderFiles));
      this.props.setIsLoadingItems(false);

      if (updateNamePath) {
        // Only push path if it is not the same as actual path
        const folderName = this.updateNamesPaths(this.props.user, content.contentFolders, this.state.namePath);

        this.setState({
          namePath: this.pushNamePath({
            name: folderName,
            id: content.contentFolders.id,
            bucket: content.contentFolders.bucket,
            id_team: content.contentFolders.id_team
          }),
          isAuthorized: true
        });
      }
    } catch (err) {
      toast.warn(err);
    }
  };

  updateNamesPaths = (user, contentFolders, namePath) => {
    if (namePath.length === 0 || namePath[namePath.length - 1].id !== contentFolders.id) {
      return user.root_folder_id === contentFolders.id ? 'All Files' : contentFolders.name;
    }
  }

  updateMeta = (metadata, itemId, isFolder) => {
    const { isTeam, currentFolderId } = this.state;
    const data = JSON.stringify({ metadata });

    if (isFolder) {
      folderService.updateMetaData(itemId, isTeam, data)
        .then(() => {
          this.getFolderContent(currentFolderId, false, true, isTeam);
        })
        .catch((error) => {
          console.log(`Error during folder customization. Error: ${error} `);
        });
    } else {
      fileService.updateMetaData(itemId, isTeam, data).then(() => {
        this.getFolderContent(currentFolderId, false, true, isTeam);
      })
        .catch((error) => {
          console.log(`Error during file customization. Error: ${error} `);
        });
    }
  };

  clearMoveOpEvent = (moveOpId) => {
    delete this.moveEvent[moveOpId];
  };

  decreaseMoveOpEventCounters = (isError, moveOpId) => {
    this.moveEvent[moveOpId].errors += isError;
    this.moveEvent[moveOpId].total -= 1;
    this.moveEvent[moveOpId].resolved += 1;
  };

  move = (items, destination, moveOpId) => {
    // Don't want to request this...
    if (
      items
        .filter((item) => item.isFolder)
        .map((item) => item.id)
        .includes(destination)
    ) {
      return toast.warn('You can\'t move a folder inside itself\'');
    }

    // Init default operation properties
    if (!this.moveEvent[moveOpId]) {
      this.moveEvent[moveOpId] = {
        total: 0,
        errors: 0,
        resolved: 0,
        itemsLength: items.length
      };
    }

    // Increment operation property values
    this.moveEvent[moveOpId].total += items.length;

    // Move Request body
    const data = { destination };

    let keyOp; // Folder or File
    // Fetch for each first levels items

    items.forEach((item) => {
      keyOp = item.isFolder ? 'Folder' : 'File';
      data[keyOp.toLowerCase() + 'Id'] = item.fileId || item.id;
      fetch(`/api/storage/move${keyOp}`, {
        method: 'post',
        headers: getHeaders(true, true, this.state.isTeam),
        body: JSON.stringify(data)
      }).then(async (res) => {
        const response = await res.json();
        const success = res.status === 200;
        const moveEvent = this.moveEvent[moveOpId];

        // Decreasing counters...
        this.decreaseMoveOpEventCounters(!success, moveOpId);

        if (!success) {
          toast.warn(`Error moving ${keyOp.toLowerCase()} '${response.item.name}`);
        } else {
          analyticsService.trackMoveItem(keyOp, {
            file_id: response.item.id,
            email: this.props.user.email,
            platform: DevicePlatform.Web
          });
          // Remove myself
          const items = this.props.currentItems.filter((commanderItem: any) =>
            item.isFolder
              ? !commanderItem.isFolder ||
              (commanderItem.isFolder && !(commanderItem.id === item.id))
              : commanderItem.isFolder ||
              (!commanderItem.isFolder && !(commanderItem.fileId === item.fileId))
          );
          // update state for updating commander items list

          this.props.setItems(items);
        }

        if (moveEvent.total === 0) {
          this.clearMoveOpEvent(moveOpId);
          // If empty folder list move back
          if (!this.props.currentItems.length) {
            this.folderTraverseUp();
          }
        }
      });
    });
  };

  openUploadFile = () => {
    $('input#uploadFileControl').val(null);
    $('input#uploadFileControl').trigger('click');
  };

  trackFileUploadStart = (file, parentFolderId) => {
    analyticsService.trackFileUploadStart({
      file_size: file.size,
      file_type: file.type,
      folder_id: parentFolderId,
      email: this.props.user.email,
      platform: DevicePlatform.Web
    });
  }

  trackFileUploadError = (file, parentFolderId, msg) => {
    analyticsService.trackFileUploadError({
      file_size: file.size,
      file_type: file.type,
      folder_id: parentFolderId,
      email: this.props.user.email,
      msg,
      platform: DevicePlatform.Web
    });
  }

  trackFileUploadFinished = (file) => {
    analyticsService.trackFileUploadFinished({
      email: this.props.user.email,
      file_size: file.size,
      file_type: file.type,
      file_id: file.id
    });
  }

  upload = async (file, parentFolderId, folderPath) => {
    if (!parentFolderId) {
      throw new Error('No folder ID provided');
    }

    try {
      this.trackFileUploadStart(file, parentFolderId);

      const { bridgeUser, bridgePass, encryptionKey, bucketId } = getEnvironmentConfig(this.state.isTeam);

      if (!bucketId) {
        // coming from auto-login or something else that is not loading all required data
        window.analytics.track('file-upload-bucketid-undefined', {
          email: this.props.user.email,
          platform: DevicePlatform.Web
        });

        toast.warn('Login again to start uploading files');
        localStorageService.clear();
        history.push('/login');
        return;
      }

      const network = new Network(bridgeUser, bridgePass, encryptionKey);

      const relativePath = folderPath + file.name + (file.type ? '.' + file.type : '');
      const content = new Blob([file.content], { type: file.type });

      const fileId = await network.uploadFile(bucketId, {
        filepath: relativePath,
        filesize: file.size,
        filecontent: content,
        progressCallback: () => { }
      });

      const name = encryptFilename(file.name, parentFolderId);

      const folder_id = parentFolderId;
      const { size, type } = file;
      const encrypt_version = '03-aes';
      // TODO: fix mismatched fileId fields in server and remove file_id here
      const fileEntry = { fileId, file_id: fileId, type, bucket: bucketId, size, folder_id, name, encrypt_version };
      const headers = getHeaders(true, true, this.state.isTeam);

      const createFileEntry = () => {
        const body = JSON.stringify({ file: fileEntry });
        const params = { method: 'post', headers, body };

        return fetch('/api/storage/file', params);
      };

      let res;
      const data = await createFileEntry().then(response => {
        res = response;
        return res.json();
      });

      this.trackFileUploadFinished({ size, type, id: data.id });

      return { res, data };

    } catch (err) {
      this.trackFileUploadError(file, parentFolderId, err.message);
      toast.warn(`File upload error. Reason: ${err.message}`);

      throw err;
    }
  };

  handleUploadFiles = async (files, parentFolderId, folderPath = null) => {
    const currentFolderId = this.state.currentFolderId;

    files = Array.from(files);

    const filesToUpload: any[] = [];
    const MAX_ALLOWED_UPLOAD_SIZE = 1024 * 1024 * 1024;
    const showSizeWarning = files.some(file => file.size >= MAX_ALLOWED_UPLOAD_SIZE);

    console.log('File size trying to be uplodaded is %s bytes', files.reduce((accum, file) => accum + file.size, 0));

    if (showSizeWarning) {
      toast.warn('File too large.\nYou can only upload or download files of up to 1GB through the web app');
      return;
    }

    parentFolderId = parentFolderId || currentFolderId;

    files.forEach(file => {
      const { filename, extension } = getFilenameAndExt(file.name);

      filesToUpload.push({ name: filename, size: file.size, type: extension, isLoading: true, content: file });
    });

    for (const file of filesToUpload) {
      const fileNameExists = this.fileNameExists(file.name, file.type);

      if (parentFolderId === currentFolderId) {
        this.props.setItems([...this.props.currentItems, file]);

        if (fileNameExists) {
          file.name = this.getNewName(file.name, file.type);
          // File browser object don't allow to rename, so you have to create a new File object with the old one.
          file.content = renameFile(file.content, file.name);
        }
      }
    }

    let fileBeingUploaded;
    const uploadErrors: any[] = [];

    try {
      await async.eachLimit(filesToUpload, 1, (file, nextFile) => {
        fileBeingUploaded = file;

        let relativePath = this.state.namePath.map((pathLevel: any) => pathLevel.name).slice(1).join('/');

        // when a folder and its subdirectory is uploaded by drop, this.state.namePath keeps its value at the first level of the parent folder
        // so we need to add the relative folderPath (the path from parent folder uploaded to the level of the file being uploaded)
        // when uploading deeper files than the current level
        if (folderPath) {
          if (relativePath !== '') {
            relativePath += '/' + folderPath;
          } else {
            // if is the first path level, DO NOT ADD a '/'
            relativePath += folderPath;
          }
        }

        let rateLimited = false;

        this.upload(file, parentFolderId, relativePath)
          .then(({ res, data }: any) => {
            if (parentFolderId === currentFolderId) {
              const { currentItems } = this.props;
              const index = currentItems.findIndex((obj: any) => obj.name === file.name);
              const filesInFileExplorer: any[] = [...currentItems];

              filesInFileExplorer[index].isLoading = false;
              filesInFileExplorer[index].fileId = data.fileId;
              filesInFileExplorer[index].id = data.id;

              this.props.setItems(filesInFileExplorer);
            }

            if (res.status === 402) {
              this.setState({ rateLimitModal: true });
              rateLimited = true;
              throw new Error('Rate limited');
            }
          }).catch((err) => {
            uploadErrors.push(err);
            console.log(err);

            this.removeFileFromFileExplorer(fileBeingUploaded.name);
          }).finally(() => {
            if (rateLimited) {
              return nextFile(Error('Rate limited'));
            }
            nextFile(null);
          });

        if (uploadErrors.length > 0) {
          throw new Error('There were some errors during upload');
        }
      });
    } catch (err) {
      if (err.message === 'There were some errors during upload') {
        // TODO: List errors in a queue?
        return uploadErrors.forEach(uploadError => {
          toast.warn(uploadError.message);
        });
      }

      toast.warn(err.message);
    }
  };

  removeFileFromFileExplorer = (filename) => {
    const index = this.props.currentItems.findIndex((obj: any) => obj.name === filename);

    if (index === -1) {
      // prevent undesired removals
      return;
    }

    this.props.setItems(Array.from(this.props.currentItems).splice(index, 1));
  }

  uploadFile = (e) => {
    this.handleUploadFiles(e.target.files, undefined, undefined).then(() => {
      this.getFolderContent(this.state.currentFolderId, false, false, this.state.isTeam);
    });
  }

  uploadDroppedFile = (e, uuid, folderPath) => {
    return this.handleUploadFiles(e, uuid, folderPath);
  }

  shareItem = () => {
    const selectedItems = this.getSelectedItems();

    if (selectedItems && selectedItems.length === 1) {
      this.setState({ popupShareOpened: true });
    } else {
      toast.warn('Please select at least one file or folder to share');
    }
  };

  deleteItems = () => {
    if (this.getSelectedItems().length > 0) {
      this.setState({ showDeleteItemsPopup: true });
    } else {
      toast.warn('Please select at least one file or folder to delete');
    }
  };

  confirmDeleteItems = () => {
    const selectedItems = this.getSelectedItems();

    //const bucket = _.last(this.state.namePath).bucket;
    const fetchOptions = {
      method: 'DELETE',
      headers: getHeaders(true, false, this.state.isTeam)
    };

    if (selectedItems.length === 0) {
      return;
    }
    const deletionRequests = _.map(selectedItems, (v, i) => {
      if (v.onDelete) {
        return (next) => {
          v.onDelete(); next();
        };
      }
      const url = v.isFolder
        ? `/api/storage/folder/${v.id}`
        : `/api/storage/folder/${v.folderId}/file/${v.id}`;

      return (next) =>
        fetch(url, fetchOptions).then(() => {
          window.analytics.track((v.isFolder ? 'folder' : 'file') + '-delete', {
            email: this.props.user.email,
            platform: DevicePlatform.Web
          });
          next();
        }).catch(next);
    });

    async.parallel(deletionRequests, (err, result) => {
      if (err) {
        throw err;
      } else {
        console.log('getFolderContent 16');
        this.getFolderContent(this.state.currentFolderId, false, true, this.state.isTeam);
      }
    });
  };

  selectItems = (items, isFolder, unselectOthers = true) => {
    if (typeof items === 'number') {
      items = [items];
    }

    this.props.currentItems.forEach((item: any) => {
      const isTargetItem = items.indexOf(item.id) !== -1 && item.isFolder === isFolder;

      if (isTargetItem) {
        item.isSelected = !item.isSelected;
      } else {
        if (unselectOthers) {
          item.isSelected = false;
        } else {
          item.isSelected = !!item.isSelected;
        }
      }
    });

    this.props.setItems(this.props.currentItems);
  };

  deselectAll() {
    this.props.currentItems.forEach((item: any) => {
      item.isSelected = false;
    });
    this.props.setItems(this.props.currentItems);
  }

  getSelectedItems() {
    return this.props.currentItems.filter((o: any) => o.isSelected === true);
  }

  folderTraverseUp() {
    this.setState(this.popNamePath(), () => {
      this.getFolderContent(_.last(this.state.namePath).id, false, true, this.state.isTeam);
    });
  }

  pushNamePath(path) {
    return update(this.state.namePath, { $push: [path] });
  }

  popNamePath() {
    return (previousState, currentProps) => {
      return {
        ...previousState,
        namePath: _.dropRight(previousState.namePath)
      };
    };
  }

  openChooserModal() {
    this.setState({ chooserModalOpen: true });
  }

  closeModal = () => {
    this.setState({ chooserModalOpen: false });
  };

  closeRateLimitModal = () => {
    this.setState({ rateLimitModal: false });
  };

  render() {
    if (this.props.isAuthenticated && this.state.isInitialized) {
      return (
        <div className="xcloud-layout flex">
          <SideNavigator />

          <div className="flex-grow bg-l-neutral-10 px-32px">
            <AppHeader />
            <FileView />
          </div>

          <FileLogger />
          <FileActivity />
        </div>
      );
    } else {
      if (!this.props.isAuthenticated) {
        return (
          <div className="App">
            <h2>
              Please <Link to="/login">login</Link> into your Internxt Drive account
            </h2>
          </div>
        );
      }
      // If is waiting for async method return blank page
      return <div></div>;
    }
  }
}

export default connect(
  (state: RootState) => ({
    isLoadingItems: state.storage.isLoading,
    currentItems: state.storage.items,
    selectedItems: state.storage.selectedItems
  }),
  {
    setHasConnection,
    setIsLoadingItems: setIsLoading,
    setItems,
    selectItem,
    resetSelectedItems
  })(NewXCloud);