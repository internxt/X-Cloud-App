import React, { Fragment, ReactNode } from 'react';

import FileDropdownActions from '../../FileDropdownActions/FileDropdownActions';
import sizeService from '../../../../services/size.service';

import './FileListItem.scss';
import { Dropdown } from 'react-bootstrap';
import dateService from '../../../../services/date.service';
import iconService, { IconType } from '../../../../services/icon.service';

interface FileListItemProps {
  item: any;
}

interface FileListItemState {
  isEditingName: boolean;
  dirtyName: string;
  nameInputRef: React.RefObject<HTMLInputElement>;
}

class FileListItem extends React.Component<FileListItemProps, FileListItemState> {
  constructor(props: FileListItemProps) {
    super(props);

    this.state = {
      isEditingName: false,
      dirtyName: '',
      nameInputRef: React.createRef()
    };

    this.onNameDoubleClicked = this.onNameDoubleClicked.bind(this);
    this.onNameBlurred = this.onNameBlurred.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onEnterKeyPressed = this.onEnterKeyPressed.bind(this);
    this.onRenameButtonClicked = this.onRenameButtonClicked.bind(this);
    this.onDownloadButtonClicked = this.onDownloadButtonClicked.bind(this);
    this.onShareButtonClicked = this.onShareButtonClicked.bind(this);
    this.onInfoButtonClicked = this.onInfoButtonClicked.bind(this);
    this.onDeleteButtonClicked = this.onDeleteButtonClicked.bind(this);
  }

  get nameNode(): JSX.Element {
    const { item } = this.props;
    const { isEditingName, dirtyName, nameInputRef } = this.state;
    const spanDisplayClass: string = !isEditingName ? 'block' : 'hidden';

    return (
      <Fragment>
        <input className={isEditingName ? 'block' : 'hidden'} ref={nameInputRef} type="text" value={dirtyName} placeholder="Change name folder" onChange={this.onNameChanged} onBlur={this.onNameBlurred} onKeyPress={this.onEnterKeyPressed} autoFocus />
        <span className={`${spanDisplayClass} text-neutral-900 text-sm px-1`} onDoubleClick={this.onNameDoubleClicked}>{item.name}</span>
      </Fragment>
    );
  }

  get itemIconSrc(): string {
    return this.props.item.isFolder ?
      iconService.getIcon(IconType.FolderBlue) :
      iconService.getIcon(IconType.DefaultFile);
  }

  onNameDoubleClicked(): void {
    const { item } = this.props;
    const { nameInputRef } = this.state;

    this.setState(
      { isEditingName: true, dirtyName: item.name },
      () => nameInputRef.current && nameInputRef.current.focus()
    );
  }

  onNameBlurred(): void {
    this.setState({ isEditingName: false });
  }

  onNameChanged(e: any): void {
    this.setState({ dirtyName: e.target.value });
  }

  onEnterKeyPressed(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') {
      // TODO: save name change
    }
  }

  onRenameButtonClicked(): void {
    const { item } = this.props;
    const { nameInputRef } = this.state;

    this.setState(
      { isEditingName: true, dirtyName: item.name },
      () => setTimeout(() => nameInputRef.current && nameInputRef.current.focus(), 0)
    );
  }

  onDownloadButtonClicked(): void {
    console.log('download button clicked!');
  }

  onShareButtonClicked(): void {
    console.log('share button clicked!');
  }

  onInfoButtonClicked(): void {
    console.log('info button clicked!');
  }

  onDeleteButtonClicked(): void {
    console.log('delete button clicked!');
  }

  render(): ReactNode {
    const { item } = this.props;

    return (
      <tr className="group file-list-item hover:bg-blue-10 border-b border-l-neutral-30 text-sm">
        <td className="px-4">
          <input type="checkbox" />
        </td>
        <td>
          <img className="type-icon" src={this.itemIconSrc} />
        </td>
        <td>
          <div>
            <div className="mb-1">
              {this.nameNode}
            </div>
            <span className="block text-blue-60 text-xs px-1">Updated {dateService.fromNow(item.updatedAt)}</span>
          </div>
        </td>
        <td>{dateService.format(item.updatedAt, 'DD MMMM YYYY. HH:mm')}</td>
        <td>{sizeService.bytesToString(item.size, false).toUpperCase()}</td>
        <td>
          <div className="flex justify-center">
            <button onClick={this.onDownloadButtonClicked} className="hover-action mr-4">D</button>
            <button onClick={this.onShareButtonClicked} className="hover-action mr-4">S</button>
            <button onClick={this.onDeleteButtonClicked} className="hover-action">R</button>
          </div>
        </td>
        <td>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic" className="file-list-item-actions-button text-blue-60 bg-l-neutral-20 font-bold rounded-2xl">
              ···
            </Dropdown.Toggle>
            <FileDropdownActions
              onRenameButtonClicked={this.onRenameButtonClicked}
              onDownloadButtonClicked={this.onDownloadButtonClicked}
              onShareButtonClicked={this.onShareButtonClicked}
              onInfoButtonClicked={this.onInfoButtonClicked}
              onDeleteButtonClicked={this.onDeleteButtonClicked}
            />
          </Dropdown>
        </td>
      </tr>
    );
  }
}

export default FileListItem;