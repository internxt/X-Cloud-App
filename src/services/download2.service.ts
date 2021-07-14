import fileDownload from 'js-file-download';
import { toast } from 'react-toastify';
import { getEnvironmentConfig, Network } from '../lib/network';
import { FileActionTypes, FileStatusTypes } from '../models/enums';
import fileLogger from './fileLogger';

const downloadFile = async (totalPathItem: string, id, fileManager, isTeam: boolean) => {
  //STATUS: DECRYPTING DOWNLOAD FILE
  //this.props.dispatch(addFileToHistory({ action: FileActionTypes.Download, status: FileStatusTypes.Decrypting, filePath: totalPathItem, isFolder: false }));
  fileLogger.push({ action: FileActionTypes.Download, status: FileStatusTypes.Decrypting, filePath: totalPathItem });

  const fileId = fileManager.props.rawItem.fileId;
  const fileName = fileManager.props.rawItem.name;
  const fileSize = fileManager.props.rawItem.size;
  const folderId = fileManager.props.rawItem.folder_id;
  const fileType = fileManager.props.type;

  const completeFilename = fileType ? `${fileName}.${fileType}` : `${fileName}`;

  try {
    //trackFileDownloadStart(fileId, fileName, fileSize, fileType, folderId);
    const { bridgeUser, bridgePass, encryptionKey, bucketId } = getEnvironmentConfig(isTeam);
    const network = new Network(bridgeUser, bridgePass, encryptionKey);

    const fileBlob = await network.downloadFile(bucketId, fileId, {
      //STATUS: DOWNLOAD PROGRESS FILE AND DOWNLOADING
      progressCallback: ((progress) => {
        fileLogger.push({ action: FileActionTypes.Download, status: FileStatusTypes.Downloading, filePath: totalPathItem, progress });
        fileManager.setState({ progress });
      })
    });

    //STATUS: FINISHED DOWNLOADING FILE
    fileLogger.push({ action: FileActionTypes.Download, status: FileStatusTypes.Success, filePath: totalPathItem });
    fileDownload(fileBlob, completeFilename);

    //trackFileDownloadFinished(id, fileSize);
  } catch (err) {
    //STATUS: ERROR DOWNLOAD FILE
    //this.props.dispatch(updateFileStatus({ filePath: totalPathItem, status: FileStatusTypes.Error }));
    fileLogger.push({ action: FileActionTypes.Download, status: FileStatusTypes.Error, filePath: totalPathItem, message: err.message });

    //trackFileDownloadError(fileId, err.message);

    toast.warn(`Error downloading file: \n Reason is ${err.message} \n File id: ${fileId}`);
  } finally {
    fileManager.setState({ progress: 0 });
  }
};

export default downloadFile;
