import db from '../database/DB';
import { getTreeFolders } from '../services/storage.service';

export function saveItemList(folderId, fileList, folderList, path) {

  const folderEntryList = folderList.map((folder) => {
    const folderEntry = computeFolderMetadata(folder, path);

    saveItem(folderEntry);
    return folderEntry.folder;
  });

  const fileEntryList = fileList.map((file) => {
    const fileEntry = computeFileMetadata(file, path);

    saveItem(fileEntry);
    return fileEntry.file;
  });

  const level = {
    folderId,
    files: fileEntryList,
    folders: folderEntryList,
    fullPath: path
  };

  saveLevel(level);

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
  folder.fullPath = path === '' ? path + folder.name : path + '/' + folder.name;
  return { fullPath: folder.fullPath, folder };
}

function saveItem (item) {
  db.putEntryValue('items', item).then(msg => console.log('Inserted: ', item)).catch(err => console.log('Error ', err));
}

function saveLevel (item) {
  db.putEntryValue('levels', item);
}

function removeItems (filesList, folderList) {
  if (filesList) {
    db.deleteFilesBulk(filesList);
  }
  if (folderList) {
    db.deleteFoldersBulk(folderList);
  }
}
