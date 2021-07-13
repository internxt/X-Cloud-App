function saveFileEntry(file) {
  // save a file to DB
}

function saveFileList(fileList) {
  if (fileList.length > 0) {
    fileList.map(file => saveFileEntry);
  }
}

function saveFolderEntry(folder) {
  // save folder to DB
}

function saveFolderList(folderList) {
  if (folderList.length > 0) {
    folderList.map(folder => saveFolderEntry);
  }
}

async function saveDirectoryLevel(folderId = null) {
  // Call to GET api/storage/folder/folderId
  const { children, files, folderId } = null // return value from the call
  saveFolderList(children);
  saveFileList(files);
  if (children.length > 0) {
    // it should be an async map but we can start with a synch one
    const jobQueue = children.map(child => {
      saveDirectoryLevel(child.id);
    });
  }
}