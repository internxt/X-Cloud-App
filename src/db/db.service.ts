import db from '../database/DB';
import { getTreeFolders } from '../services/storage.service';

export function saveItemList(folderId, fileList, folderList, path) {
  const folderEntryList = folderList.map((folder) => {
    console.log('FOLDER', folder);
    const folderEntry = computeFolderMetadata(folder, path);

    saveItem(folderEntry);
    return folderEntry.folder;
  });

  const fileEntryList = fileList.map((file) => {
    const fileEntry = computeFileMetadata(file, path);

    saveItem(fileEntry);
    return fileEntry.file;
  });

  const items = {
    folderId,
    files: fileEntryList,
    folders: folderEntryList,
    fullPath: path
  };

  db.putEntryValue('levels', items);

}

function resolvePath (path) {
  if (path) {
    path += '/';
  }
  return path;
}

export async function saveDirectoryLevel(folderId = null, child = null) {
  // Call to GET api/storage/folder/folderId
  const dataFolder = await getTreeFolders(folderId);

  const { children, files } = dataFolder; // return value from the call

  folderId = dataFolder.id;

  let path = child === null ? '' : child.path ;

  // size = files.reduce((acc, file) => acc + file.size);

  //saveFolderList(children);
  saveItemList(folderId, files, children, path/*, size*/);
  if (children.length > 0) {
    // it should be an async map but we can start with a synch one
    const jobQueue = children.map(child => {
      path = resolvePath(path);
      child.path = path + child.name;
      saveDirectoryLevel(child.id, child);
    });
  }
  // return size;
}

function computeFileMetadata (file, path) {
  path = resolvePath(path);
  const fullPath = path + file.name + '.' + file.type;

  file.fullPath = fullPath;

  return { fullPath, file };
}

function computeFolderMetadata (folder, path) {
  folder.fullPath = path;
  return { fullPath: path, folder };
}

function saveItem (item) {
  console.log('ITEMS', item);
  db.putEntryValue('items', item);
}
