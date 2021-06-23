import * as React from 'react';
import { Link } from 'react-router-dom';
import { isMobile, isAndroid, isIOS } from 'react-device-detect';
import $ from 'jquery';
import _ from 'lodash';
import fileDownload from 'js-file-download';
import update from 'immutability-helper';
import Popup from 'reactjs-popup';
import async from 'async';

import FileCommander from './FileCommander';
import NavigationBar from '../navigationBar/NavigationBar';
import history from '../../lib/history';
import { encryptText, removeAccents, getFilenameAndExt, renameFile } from '../../lib/utils';
import closeTab from '../../assets/Dashboard-Icons/close-tab.svg';

import PopupShare from '../PopupShare';
import './XCloud.scss';

import { getHeaders } from '../../lib/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getUserData } from '../../lib/analytics';
import Settings from '../../lib/settings';

import { Network, getEnvironmentConfig } from '../../lib/network';
import * as userService from '../../services/user.service';
import * as teamsService from '../../services/teams.service';
import * as filesService from '../../services/file.service';
import * as foldersService from '../../services/folder.service';
import * as tracksService from '../../services/tracks.service';
class XCloud extends React.Component {

  state = {
    email: '',
    isAuthorized: false,
    isInitialized: false,
    isTeam: false,
    token: '',
    chooserModalOpen: false,
    rateLimitModal: false,
    currentFolderId: null,
    currentFolderBucket: null,
    currentCommanderItems: [],
    namePath: [],
    sortFunction: null,
    searchFunction: null,
    popupShareOpened: false,
    showDeleteItemsPopup: false,
    isLoading: true,
    isAdmin: true,
    isMember: false
  };

  moveEvent = {};

  componentDidMount = () => {
    this.redirectForMobile();
    this.startFileExplorer();
  };

  startFileExplorer = () => {
    // When user is not signed in, redirect to login
    if (!this.props.user || !this.props.isAuthenticated) {
      history.push('/login');
    } else {
      if (!this.props.user.root_folder_id) {
        // Initialize user in case that is not done yet
        this.initializeUser();
      } else {
        console.log('getFolderContent 4');
        teamsService.storeTeamsInfo().finally(() => {
          this.setCurrentFolderId();
        }).catch(() => {
          Settings.del('xTeam');
          this.setState({
            isTeam: false
          });
        });
      }
    }
  }

  setCurrentFolderId = () => {
    if (Settings.exists('xTeam') && !this.state.isTeam && Settings.get('workspace') === 'teams') {
      this.handleChangeWorkspace();
    } else {
      this.getContentFolder(this.props.user.root_folder_id);
      this.setState({ currentFolderId: this.props.user.root_folder_id });
    }
    const team = Settings.getTeams();

    if (team && !team.root_folder_id) {
      this.setState({ currentFolderId: this.props.user.root_folder_id });
    }

    this.setState({ isInitialized: true });
  }

  handleChangeWorkspace = () => {
    const xTeam = Settings.getTeams();
    const xUser = Settings.getUser();

    if (!Settings.exists('xTeam')) {
      toast.warn('You cannot access the team');
      this.setState({
        isTeam: false
      });
    }

    if (this.state.isTeam) {
      this.setState({ namePath: [{ name: 'All files', id: xUser.root_folder_id }] }, () => {
        this.getContentFolder(xUser.root_folder_id, false, true, false);
      });
    } else {
      this.setState({ namePath: [{ name: 'All files', id: xTeam.root_folder_id }] }, () => {
        this.getContentFolder(xTeam.root_folder_id, false, true, true);
      });
    }

    const isTeam = !this.state.isTeam;

    this.setState({ isTeam: isTeam }, () => {
      Settings.set('workspace', isTeam ? 'teams' : 'individual');
    });
  }

  redirectForMobile = () => {
    if (isMobile) {
      if (isAndroid) {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.internxt.cloud';
      } else if (isIOS) {
        window.location.href = 'https://apps.apple.com/us/app/internxt-drive-secure-file-storage/id1465869889';
      }
    }
  }

  initializeUser = () => {
    this.userInitialization().then((resultId) => {
      console.log('getFolderContent 3');
      this.getContentFolder(resultId);
    }).catch((error) => {
      const errorMsg = error ? error : '';

      toast.warn('User initialization error ' + errorMsg);
      history.push('/login');
    });
  }

  userInitialization = async () => {
    try {
      const initializedUser = await userService.initialize(this.props.user.email);

      if (initializedUser) {
        this.setState({ isInitialized: true });
        let updatedUser = this.props.user;

        updatedUser.root_folder_id = initializedUser.user.root_folder_id;
        this.props.handleKeySaved(updatedUser);
        this.getContentFolder(initializedUser.user.root_folder_id);
      }
    } catch (err) {
      throw new Error(err);
    }
  };

  setSortFunction = (newSortFunc) => {
    // Set new sort function on state and call getFolderContent for refresh files list
    this.setState({ sortFunction: newSortFunc });
    console.log('getFolderContent 8');
    this.getContentFolder(this.state.currentFolderId, false, true);
  };

  setSearchFunction = (e) => {
    // Set search function depending on search text input and refresh items list
    const searchString = removeAccents(e.target.value.toString()).toLowerCase();

    let func = null;

    if (searchString) {
      func = function (item) {
        return item.name.toLowerCase().includes(searchString);
      };
    }
    this.setState({ searchFunction: func });
    console.log('getFolderContent 9');
    this.getContentFolder(this.state.currentFolderId, false, true, this.state.isTeam);
  };

  createFolder = async () => {
    try {
      let folderName = prompt('Please enter folder name');

      if (folderName && folderName !== '') {

        const newNameIfExists = this.renameIfExistsFolders(folderName);

        if (newNameIfExists !== undefined) {
          folderName = newNameIfExists;
        }

        const cratedFolder = await foldersService.createFolder(this.state.isTeam, this.state.currentFolderId, folderName);

        if (cratedFolder) {
          window.analytics.track('folder-created', {
            email: getUserData().email,
            platform: 'web'
          });
          this.getContentFolder(this.state.currentFolderId, false, true, this.state.isTeam);
        }
      }
    } catch (err) {
      console.log(err);
      toast.warn(`Error creating folder ${err}`);
    }
  }

  renameIfExistsFolders = (newFolderName) => {
    if (this.folderNameExists(newFolderName)) {
      newFolderName = this.getNewName(newFolderName);
    }
    return newFolderName;
  }

  folderNameExists = (folderName) => {
    return this.state.currentCommanderItems.find(
      (item) => item.isFolder && item.name === folderName
    );
  };

  fileNameExists = (fileName, type) => {
    return this.state.currentCommanderItems.some(
      (item) => !item.isFolder && item.name === fileName && item.type === type
    );
  };

  getNextNewName = (originalName, i) => `${originalName} (${i})`;

  getNewFolderName = (name) => {
    let exists = false;

    let i = 1;
    const currentFolder = this.state.currentCommanderItems.filter((item) => item.isFolder);

    let finalName = name;

    const foldName = name.replace(/ /g, '');

    currentFolder.map((folder) => {
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

      exists = currentFolder.find((folder) => folder.name === newName);
      i += 1;
      finalName = newName;
    }

    return finalName;
  };

  getNewFileName = (name, type) => {
    let exists = true;

    let i = 1;

    let finalName;
    const currentFiles = this.state.currentCommanderItems.filter((item) => !item.isFolder);

    while (exists) {
      const newName = this.getNextNewName(name, i);

      exists = currentFiles.find((file) => file.name === newName && file.type === type);
      finalName = newName;
      i += 1;
    }

    return finalName;
  };

  getNewName = (name, type) => {
    // if has type is file
    if (type) {
      return this.getNewFileName(name, type);
    }

    return this.getNewFolderName(name);
  };

  createFolderByName = async (folder, parentFolderId) => {
    let folderName = folder.name;

    // No parent id implies is a directory created on the current folder, so let's show a spinner
    if (!parentFolderId) {
      let itemsFileExplorer;

      const newFolderNameIfExists = this.renameIfExistsFolders(folderName);

      if (newFolderNameIfExists !== undefined) {
        folderName = newFolderNameIfExists;
      }

      itemsFileExplorer = this.state.currentCommanderItems;
      itemsFileExplorer.push({
        name: folderName,
        isLoading: true,
        isFolder: true
      });

      this.setState({ currentCommanderItems: itemsFileExplorer });
    } else {
      folderName = this.getNewName(folderName);
    }

    parentFolderId = parentFolderId || this.state.currentFolderId;

    return foldersService.createFolder(this.state.isTeam, parentFolderId, folderName);
  };

  openFolder = (e) => {
    return new Promise((resolve) => {
      console.log('getFolderContent 11');
      this.getContentFolder(e, true, true, this.state.isTeam);
      resolve();
    });
  };

  getContentFolder = async (rootId, updateNamePath = true, showLoading = true, isTeam = false) => {
    try {
      await new Promise((resolve) => this.setState({ isLoading: showLoading }, () => resolve()));
      await filesService.getWelcomeFile();
      const content = await foldersService.getContentFolderService(rootId, isTeam);

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
        currentCommanderItems: _.concat(content.newCommanderFolders, content.newCommanderFiles),
        currentFolderId: content.contentFolders.id,
        currentFolderBucket: content.contentFolders.bucket,
        isLoading: false
      });

      if (updateNamePath) {
        // Only push path if it is not the same as actual path
        const folderName = this.UpdateNamesPaths(this.props.user, content.contentFolders, this.state.namePath);

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

  UpdateNamesPaths = (user, contentFolders, namePath) => {
    if (namePath.length === 0 || namePath[namePath.length - 1].id !== contentFolders.id) {
      return user.root_folder_id === contentFolders.id ? 'All Files' : contentFolders.name;
    }
  }

  updateMeta = async (metadata, itemId, isFolder) => {
    try {
      // Apply changes on metadata depending on type of item
      const data = JSON.stringify({ metadata });

      if (isFolder) {
        const updatedMetaFolder = await foldersService.updateMetaData(data, itemId, this.state.isTeam);

        if (updatedMetaFolder) {
          window.analytics.track('file-rename', {
            file_id: itemId,
            email: getUserData().email,
            platform: 'web'
          });
          console.log('getFolderContent 13');
          this.getContentFolder(this.state.currentFolderId, false, true, this.state.isTeam);
        }

      } else {
        const updatedMetaFile = await filesService.updateMetaData(data, itemId, this.state.isTeam);

        if (updatedMetaFile) {
          window.analytics.track('file-rename', {
            file_id: itemId,
            email: getUserData().email,
            platform: 'web'
          });
          console.log('getFolderContent 13');
          this.getContentFolder(this.state.currentFolderId, false, true, this.state.isTeam);
        }
      }
    } catch (err) {
      toast.warn(err);
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
          window.analytics.track(`${keyOp}-move`.toLowerCase(), {
            file_id: response.item.id,
            email: getUserData().email,
            platform: 'web'
          });
          // Remove myself
          let currentCommanderItems = this.state.currentCommanderItems.filter((commanderItem) =>
            item.isFolder
              ? !commanderItem.isFolder ||
              (commanderItem.isFolder && !(commanderItem.id === item.id))
              : commanderItem.isFolder ||
              (!commanderItem.isFolder && !(commanderItem.fileId === item.fileId))
          );
          // update state for updating commander items list

          this.setState({ currentCommanderItems });
        }

        if (moveEvent.total === 0) {
          this.clearMoveOpEvent(moveOpId);
          // If empty folder list move back
          if (!this.state.currentCommanderItems.length) {
            this.folderTraverseUp();
          }
        }
      });
    });
  };

  downloadFile = async (id, _class, pcb) => {
    const fileId = pcb.props.rawItem.fileId;
    const fileName = pcb.props.rawItem.name;
    const fileSize = pcb.props.rawItem.size;
    const folderId = pcb.props.rawItem.folder_id;
    const fileType = pcb.props.type;

    const completeFilename = fileType ? `${fileName}.${fileType}` : `${fileName}`;

    try {
      tracksService.trackFileDownloadStart(fileId, fileName, fileSize, fileType, folderId);

      const { bridgeUser, bridgePass, encryptionKey, bucketId } = getEnvironmentConfig(this.state.isTeam);
      const network = new Network(bridgeUser, bridgePass, encryptionKey);

      const fileBlob = await network.downloadFile(bucketId, fileId, {
        progressCallback: (progress) => pcb.setState({ progress })
      });

      fileDownload(fileBlob, completeFilename);

      tracksService.trackFileDownloadFinished(id, fileSize);
    } catch (err) {
      tracksService.trackFileDownloadError(fileId, err.message);

      toast.warn(`Error downloading file: \n Reason is ${err.message} \n File id: ${fileId}`);
    } finally {
      pcb.setState({ progress: 0 });
    }
  };

  openUploadFile = () => {
    $('input#uploadFileControl').val(null);
    $('input#uploadFileControl').trigger('click');
  };

  upload = async (file, parentFolderId, folderPath) => {
    if (!parentFolderId) {
      throw new Error('No folder ID provided');
    }

    try {
      tracksService.trackFileUploadStart(file, parentFolderId);

      const { bridgeUser, bridgePass, encryptionKey, bucketId } = getEnvironmentConfig(this.state.isTeam);
      const network = new Network(bridgeUser, bridgePass, encryptionKey);

      const relativePath = folderPath + file.name;
      const content = new Blob([file.content], { type: file.type });

      const fileId = await network.uploadFile(bucketId, {
        filepath: relativePath,
        filesize: file.size,
        filecontent: content,
        progressCallback: () => { }
      });

      const name = encryptText(file.name);
      const folder_id = parentFolderId;
      const { size, type } = file;
      const encrypt_version = '';
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

      tracksService.trackFileUploadFinished({ size, type, id: data.id });

      return { res, data };

    } catch (err) {
      tracksService.trackFileUploadError(file, parentFolderId, err.message);
      toast.warn(`File upload error. Reason: ${err.message}`);

      throw err;
    }
  };

  handleUploadFiles = async (files, parentFolderId, folderPath = null) => {
    files = Array.from(files);

    const filesToUpload = [];
    const MAX_ALLOWED_UPLOAD_SIZE = 1024 * 1024 * 1024;
    const showSizeWarning = files.some(file => file.size >= MAX_ALLOWED_UPLOAD_SIZE);

    console.log('File size trying to be uplodaded is %s bytes', files.reduce((accum, file) => accum + file.size, 0));

    if (showSizeWarning) {
      toast.warn('File too large.\nYou can only upload or download files of up to 1GB through the web app');
      return;
    }

    let currentFolderId = this.state.currentFolderId;

    parentFolderId = parentFolderId || currentFolderId;

    files.forEach(file => {
      const { filename, extension } = getFilenameAndExt(file.name);

      filesToUpload.push({ name: filename, size: file.size, type: extension, isLoading: true, content: file });
    });

    for (const file of filesToUpload) {
      let fileNameExists = this.fileNameExists(file.name, file.type);

      if (parentFolderId === currentFolderId) {
        this.setState({ currentCommanderItems: [...this.state.currentCommanderItems, file] });

        if (fileNameExists) {
          file.name = this.getNewName(file.name, file.type);
          // File browser object don't allow to rename, so you have to create a new File object with the old one.
          file.content = renameFile(file.content, file.name);
        }
      }
    }

    let fileBeingUploaded;

    let uploadErrors = [];

    try {
      await async.eachLimit(filesToUpload, 1, (file, nextFile) => {
        fileBeingUploaded = file;

        let relativePath = this.state.namePath.map((pathLevel) => pathLevel.name).slice(1).join('/');

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
          .then(({ res, data }) => {
            if (parentFolderId === currentFolderId) {
              const index = this.state.currentCommanderItems.findIndex((obj) => obj.name === file.name);
              const filesInFileExplorer = [...this.state.currentCommanderItems];

              filesInFileExplorer[index].isLoading = false;
              filesInFileExplorer[index].fileId = data.fileId;
              filesInFileExplorer[index].id = data.id;

              this.setState({ currentCommanderItems: filesInFileExplorer });
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
    const index = this.state.currentCommanderItems.findIndex((obj) => obj.name === filename);

    if (index === -1) {
      // prevent undesired removals
      return;
    }

    this.setState({ currentCommanderItems: Array.from(this.state.currentCommanderItems).splice(index, 1) });
  }

  uploadFile = (e) => {
    this.handleUploadFiles(e.target.files).then(() => {
      this.getContentFolder(this.state.currentFolderId, false, false, this.state.isTeam);
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

    const deletionRequests = foldersService.deleteItems(this.state.isTeam, selectedItems);

    async.parallel(deletionRequests, (err, result) => {
      if (err) {
        throw err;
      } else {
        console.log('getFolderContent 16');
        this.getContentFolder(this.state.currentFolderId, false, true, this.state.isTeam);
      }
    });
  };

  selectItems = (items, isFolder, unselectOthers = true) => {
    if (typeof items === 'number') {
      items = [items];
    }

    this.state.currentCommanderItems.forEach((item) => {
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

    this.setState({ currentCommanderItems: this.state.currentCommanderItems });
  };

  deselectAll() {
    this.state.currentCommanderItems.forEach((item) => {
      item.isSelected = false;
    });
    this.setState({ currentCommanderItems: this.state.currentCommanderItems });
  }

  getSelectedItems() {
    return this.state.currentCommanderItems.filter((o) => o.isSelected === true);
  }

  folderTraverseUp() {
    this.setState(this.popNamePath(), () => {
      this.getContentFolder(_.last(this.state.namePath).id, false, true, this.state.isTeam);
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

  goToStorage = () => {
    history.push('/storage');
  };

  showTeamSettings = () => {
    history.push('/teams/settings');
  }

  render() {
    // Check authentication
    if (this.props.isAuthenticated && this.state.isInitialized) {
      return (
        <div className="App flex-column" style={{ minHeight: '100%', height: 'auto', display: 'flex' }}>
          <NavigationBar
            showFileButtons={true}
            showSettingsButton={true}
            createFolder={this.createFolder}
            uploadFile={this.openUploadFile}
            uploadHandler={this.uploadFile}
            deleteItems={this.deleteItems}
            setSearchFunction={this.setSearchFunction}
            shareItem={this.shareItem}
            showTeamSettings={this.showTeamSettings}
            handleChangeWorkspace={this.handleChangeWorkspace}
            isTeam={this.state.isTeam}
            style
          />

          <FileCommander
            currentCommanderItems={this.state.currentCommanderItems}
            openFolder={this.openFolder}
            downloadFile={this.downloadFile}
            selectItems={this.selectItems}
            namePath={this.state.namePath}
            handleFolderTraverseUp={this.folderTraverseUp.bind(this)}
            uploadDroppedFile={this.uploadDroppedFile}
            createFolderByName={this.createFolderByName}
            setSortFunction={this.setSortFunction}
            move={this.move}
            updateMeta={this.updateMeta}
            currentFolderId={this.state.currentFolderId}
            getFolderContent={this.getContentFolder}
            isLoading={this.state.isLoading}
            isTeam={this.state.isTeam}
          />

          {this.getSelectedItems().length > 0 && this.state.popupShareOpened ? (
            <PopupShare
              isTeam={this.state.isTeam}
              open={this.state.popupShareOpened}
              item={this.getSelectedItems()[0]}
              onClose={() => {
                this.setState({ popupShareOpened: false });
              }}
            />
          ) : ''}

          <Popup
            open={this.state.showDeleteItemsPopup}
            closeOnDocumentClick
            onClose={() => this.setState({ showDeleteItemsPopup: false })}
            className="popup--full-screen"
          >
            <div className="popup--full-screen__content">
              <div className="popup--full-screen__close-button-wrapper">
                <img
                  src={closeTab}
                  onClick={() => this.setState({ showDeleteItemsPopup: false })}
                  alt="Close tab"
                />
              </div>
              <div className="message-wrapper">
                <h1>Delete item{this.getSelectedItems().length > 1 ? 's' : ''}</h1>
                <h2>
                  Please confirm you want to delete this item
                  {this.getSelectedItems().length > 1 ? 's' : ''}. This action can’t be undone.
                </h2>
                <div className="buttons-wrapper">
                  <div
                    className="default-button button-primary"
                    onClick={() => {
                      this.confirmDeleteItems();
                      this.setState({ showDeleteItemsPopup: false });
                    }}
                  >
                    Confirm
                  </div>
                </div>
              </div>
            </div>
          </Popup>

          <Popup open={this.state.chooserModalOpen} closeOnDocumentClick onClose={this.closeModal}>
            <div>
              <a href={'inxt://' + this.state.token + '://' + JSON.stringify(this.props.user)}>
                Open mobile app
              </a>
              <a href="/" onClick={this.closeModal}>
                Use web app
              </a>
            </div>
          </Popup>

          <Popup
            open={this.state.rateLimitModal}
            closeOnDocumentClick
            onClose={this.closeRateLimitModal}
            className="popup--full-screen"
          >
            <div className="popup--full-screen__content">
              <div className="popup--full-screen__close-button-wrapper">
                <img src={closeTab} onClick={this.closeRateLimitModal} alt="Close tab" />
              </div>
              <div className="message-wrapper">
                <h1> You have run out of storage. </h1>
                <h2>
                  In order to start uploading more files please click the button below to upgrade
                  your storage plan.
                </h2>
                <div className="buttons-wrapper">
                  <div className="default-button button-primary" onClick={this.goToStorage}>
                    Upgrade my storage plan
                  </div>
                </div>
              </div>
            </div>
          </Popup>
        </div>
      );
    } else {
      // Cases of access error
      // Not authenticated
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

export default XCloud;
