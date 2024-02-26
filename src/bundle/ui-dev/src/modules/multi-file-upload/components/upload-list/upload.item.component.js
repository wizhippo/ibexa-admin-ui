import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getTranslator, getRestInfo } from '@ibexa-admin-ui/src/bundle/Resources/public/js/scripts/helpers/context.helper';
import { getContentTypeIconUrl } from '@ibexa-admin-ui/src/bundle/Resources/public/js/scripts/helpers/content.type.helper';

import ProgressBarComponent from '../progress-bar/progress.bar.component';
import { fileSizeToString } from '../../helpers/text.helper';
import { createCssClassNames } from '../../../common/helpers/css.class.names';
import Icon from '../../../common/icon/icon';

export default class UploadItemComponent extends Component {
    constructor(props) {
        super(props);

        this.handleFileSizeNotAllowed = this.handleFileSizeNotAllowed.bind(this);
        this.handleFileTypeNotAllowed = this.handleFileTypeNotAllowed.bind(this);
        this.handleContentTypeNotAllowed = this.handleContentTypeNotAllowed.bind(this);
        this.handleEditBtnClick = this.handleEditBtnClick.bind(this);
        this.handleUploadAbort = this.handleUploadAbort.bind(this);
        this.handleUploadError = this.handleUploadError.bind(this);
        this.handleUploadLoad = this.handleUploadLoad.bind(this);
        this.handleUploadProgress = this.handleUploadProgress.bind(this);
        this.handleUploadEnd = this.handleUploadEnd.bind(this);
        this.handleLoadStart = this.handleLoadStart.bind(this);
        this.handleFileDeleted = this.handleFileDeleted.bind(this);
        this.abortUploading = this.abortUploading.bind(this);
        this.initPublishFile = this.initPublishFile.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.handleContentError = this.handleContentError.bind(this);
        this.contentInfoInput = null;
        this.contentVersionInfoInput = null;
        this.contentVersionNoInput = null;
        this.contentEditBtn = null;
        this.state = {
            uploading: false,
            uploaded: props.isUploaded,
            disallowed: false,
            disallowedType: false,
            disallowedSize: false,
            disallowedContentType: false,
            aborted: false,
            failed: false,
            deleted: false,
            progress: 0,
            xhr: null,
            struct: props.data.struct || null,
            totalSize: fileSizeToString(props.data.file.size),
            uploadedSize: '0',
            isError: false,
            errorMsgs: [],
            isMultipleErrosExpanded: false,
        };
    }

    componentDidMount() {
        const {
            data,
            adminUiConfig,
            parentInfo,
            createFileStruct,
            isUploaded,
            checkCanUpload,
            contentCreatePermissionsConfig,
            currentLanguage,
        } = this.props;

        this.contentInfoInput = window.document.querySelector('#form_subitems_content_edit_content_info');
        this.contentVersionInfoInput = window.document.querySelector('#form_subitems_content_edit_version_info_content_info');
        this.contentVersionNoInput = window.document.querySelector('#form_subitems_content_edit_version_info_version_no');
        this.contentEditBtn = window.document.querySelector('#form_subitems_content_edit_create');

        if (isUploaded) {
            return;
        }

        const config = {
            ...adminUiConfig.multiFileUpload,
            contentCreatePermissionsConfig,
        };
        const callbacks = {
            fileTypeNotAllowedCallback: this.handleFileTypeNotAllowed,
            fileSizeNotAllowedCallback: this.handleFileSizeNotAllowed,
            contentTypeNotAllowedCallback: this.handleContentTypeNotAllowed,
        };

        if (!checkCanUpload(data.file, parentInfo, config, callbacks)) {
            this.setState(() => ({
                uploading: false,
                disallowed: true,
                uploaded: false,
                aborted: false,
                failed: true,
            }));

            return;
        }

        const createFileStructParams = {
            parentInfo,
            config: adminUiConfig,
            languageCode: currentLanguage,
        };

        createFileStruct(data.file, createFileStructParams, this.handleContentError).then(this.initPublishFile);
    }

    /**
     * Initializes file-based content publishing
     *
     * @method initPublishFile
     * @param {Object} restInfo config object containing token and siteaccess properties
     * @param {Object} struct
     * @memberof UploadItemComponent
     */
    initPublishFile(struct) {
        this.props.publishFile(
            struct,
            {
                upload: {
                    onabort: this.handleUploadAbort,
                    onerror: this.handleUploadError,
                    onload: this.handleUploadLoad,
                    onprogress: this.handleUploadProgress,
                },
                onloadstart: this.handleLoadStart,
                onerror: this.handleUploadError,
            },
            this.handleUploadEnd,
            this.handleContentError,
        );
    }

    handleContentError = (errorMsg, callback) => {
        this.setState((prevState) => ({
            isError: true,
            errorMsgs: [...prevState.errorMsgs, errorMsg],
        }));
    };

    // ========================================================================================================
    // TO DO: maybe put this funcstions to one, diff is
    // - disallowedType: true,
    // - disallowedSize: false,
    // - disallowedContentType: false
    // commone params
    // - uploading: false
    // - disallowed: true
    // - uploaded: false
    // - aborted: false
    // - failed: true
    handleFileTypeNotAllowed(errorMsg = '') {
        this.setState((prevState) => ({
            uploading: false,
            disallowed: true,
            disallowedType: true,
            disallowedSize: false,
            disallowedContentType: false,
            uploaded: false,
            aborted: false,
            failed: true,
            isError: true,
            errorMsgs: [...prevState.errorMsgs, errorMsg],
        }));
    }
    handleFileSizeNotAllowed(errorMsg = '') {
        this.setState((prevState) => ({
            uploading: false,
            disallowed: true,
            disallowedType: false,
            disallowedSize: true,
            disallowedContentType: false,
            uploaded: false,
            aborted: false,
            failed: true,
            isError: true,
            errorMsgs: [...prevState.errorMsgs, errorMsg],
        }));
    }
    handleContentTypeNotAllowed(errorMsg = '') {
        this.setState((prevState) => ({
            uploading: false,
            disallowed: true,
            disallowedType: false,
            disallowedSize: false,
            disallowedContentType: true,
            uploaded: false,
            aborted: false,
            failed: true,
            isError: true,
            errorMsgs: [...prevState.errorMsgs, errorMsg],
        }));
    }
    // ========================================================================================================

    handleLoadStart(event) {
        this.setState(() => ({
            uploading: true,
            disallowed: false,
            disallowedType: false,
            disallowedSize: false,
            disallowedContentType: false,
            uploaded: false,
            aborted: false,
            failed: false,
            xhr: event.target,
        }));
    }

    handleUploadAbort() {
        this.setState(() => ({
            uploading: false,
            disallowed: false,
            disallowedType: false,
            disallowedSize: false,
            disallowedContentType: false,
            uploaded: false,
            aborted: true,
            failed: false,
        }));
    }

    handleUploadError() {
        this.setState((state) => ({
            uploading: false,
            disallowed: state.disallowed,
            disallowedSize: state.disallowedSize,
            disallowedType: state.disallowedType,
            disallowedContentType: state.disallowedContentType,
            uploaded: false,
            aborted: state.aborted,
            failed: true,
        }));
    }

    handleUploadLoad() {
        this.setState(() => ({
            uploading: false,
            disallowed: false,
            disallowedType: false,
            disallowedSize: false,
            disallowedContentType: false,
            uploaded: true,
            aborted: false,
            failed: false,
        }));
    }

    handleUploadProgress(event) {
        const fraction = event.loaded / event.total;
        const progress = parseInt(fraction * 100, 10);

        this.setState(() => ({
            uploadedSize: fileSizeToString(fraction * parseInt(this.props.data.file.size, 10)),
            uploading: true,
            disallowed: false,
            disallowedType: false,
            disallowedSize: false,
            disallowedContentType: false,
            uploaded: false,
            aborted: false,
            failed: false,
            progress,
        }));
    }

    handleUploadEnd() {
        this.setState(
            (state) => {
                const struct = JSON.parse(state.xhr.response);

                return {
                    struct,
                    uploading: false,
                    disallowed: false,
                    disallowedType: false,
                    disallowedSize: false,
                    disallowedContentType: false,
                    uploaded: true,
                    aborted: false,
                    failed: false,
                };
            },
            () => {
                const { data } = this.props;

                this.props.onAfterUpload({ ...data, struct: this.state.struct });
            },
        );
    }

    abortUploading() {
        this.state.xhr.abort();
        this.props.onAfterAbort(this.props.data);
    }

    deleteFile() {
        this.setState(
            () => ({ deleted: true }),
            () => this.props.deleteFile(this.state.struct, this.handleFileDeleted),
        );
    }

    handleFileDeleted() {
        this.props.onAfterDelete(this.props.data);
    }

    getContentTypeIdentifier() {
        const { contentTypesMap, data } = this.props;

        if (!data.struct || !data.struct.Content) {
            return null;
        }

        const contentTypeHref = data.struct.Content.ContentType._href;
        const contentType = contentTypesMap ? contentTypesMap[contentTypeHref] : null;
        const contentTypeIdentifier = contentType ? contentType.identifier : null;

        return contentTypeIdentifier;
    }

    renderIcon() {
        const contentTypeIdentifier = this.getContentTypeIdentifier();

        if (!contentTypeIdentifier) {
            return null;
        }

        const contentTypeIconUrl = getContentTypeIconUrl(contentTypeIdentifier);

        return <Icon customPath={contentTypeIconUrl} extraClasses="ibexa-icon--small" />;
    }

    renderProgressBar() {
        const { uploaded, aborted, progress, totalSize, uploadedSize, disallowed } = this.state;

        if (this.props.isUploaded || uploaded || aborted || disallowed) {
            return null;
        }

        return <ProgressBarComponent progress={progress} uploaded={uploadedSize} total={totalSize} />;
    }

    renderErrorInfo() {
        const { isError, errorMsgs, uploading } = this.state;

        if (!isError) {
            return null;
        }

        const Translator = getTranslator();
        const isMultipleErros = errorMsgs.length > 1;
        const label = isMultipleErros
            ? Translator.trans(/*@Desc("Failed to upload ")*/ 'multierror.label', {}, 'ibexa_multi_file_upload')
            : errorMsgs[0];

        return (
            <div className="c-upload-list-item__message c-upload-list-item__message--error">
                <Icon name="warning" extraClasses="ibexa-icon--tiny-small" />
                {label}
                {isMultipleErros && (
                    <button
                        className="c-upload-list-item__multiple-errors-toggle-btn"
                        onClick={() =>
                            this.setState((prevState) => ({
                                isMultipleErrosExpanded: !prevState.isMultipleErrosExpanded,
                            }))
                        }
                    >
                        <Icon name="caret-down" extraClasses="ibexa-icon--tiny-small" />
                    </button>
                )}
            </div>
        );
    }

    renderSuccessMessage() {
        const Translator = getTranslator();
        const { uploaded, aborted, disallowedSize, disallowedType, failed, uploading } = this.state;
        const isSuccess = uploaded && !aborted && !(disallowedSize || disallowedType) && !failed && !uploading;
        const message = Translator.trans(/*@Desc("100% Uploaded")*/ 'upload.success.message', {}, 'ibexa_multi_file_upload');

        return isSuccess ? (
            <div className="c-upload-list-item__message c-upload-list-item__message--success">
                <Icon name="checkmark" extraClasses="ibexa-icon--tiny-small" />
                {message}
            </div>
        ) : null;
    }

    renderAbortBtn() {
        const Translator = getTranslator();
        const { uploaded, aborted, disallowedSize, disallowedType, failed, uploading } = this.state;
        const canAbort = !uploaded && !aborted && !disallowedSize && !disallowedType && !failed && uploading;

        if (!canAbort) {
            return null;
        }

        const label = Translator.trans(/*@Desc("Abort")*/ 'abort.label', {}, 'ibexa_multi_file_upload');

        return (
            <div
                className="btn ibexa-btn ibexa-btn--ghost ibexa-btn--no-text ibexa-btn--small c-upload-list-item__action c-upload-list-item__action--abort"
                onClick={this.abortUploading}
                title={label}
                tabIndex="-1"
            >
                <Icon name="trash" extraClasses="ibexa-icon--small" />
            </div>
        );
    }

    handleEditBtnClick(event) {
        event.preventDefault();

        const { struct } = this.state;
        const content = struct.Content;
        const contentId = content._id;
        const { languageCode } = content.CurrentVersion.Version.VersionInfo.VersionTranslationInfo.Language['0'];
        const { versionNo } = content.CurrentVersion.Version.VersionInfo;

        this.contentInfoInput.value = contentId;
        this.contentVersionInfoInput.value = contentId;
        this.contentVersionNoInput.value = versionNo;
        window.document.querySelector(`#form_subitems_content_edit_language_${languageCode}`).checked = true;
        this.contentEditBtn.click();
    }

    renderEditBtn() {
        const Translator = getTranslator();
        const { instanceUrl } = getRestInfo();
        const { uploaded, aborted, disallowedSize, disallowedType, failed, uploading } = this.state;
        const canEdit = this.props.isUploaded || (uploaded && !aborted && !(disallowedSize || disallowedType) && !failed && !uploading);

        if (!canEdit || window.origin !== instanceUrl) {
            return null;
        }

        const label = Translator.trans(/*@Desc("Edit")*/ 'edit.label', {}, 'ibexa_multi_file_upload');

        return (
            <div
                className="btn ibexa-btn ibexa-btn--ghost ibexa-btn--no-text ibexa-btn--small c-upload-list-item__action c-upload-list-item__action--edit"
                title={label}
                onClick={this.handleEditBtnClick}
                tabIndex="-1"
            >
                <Icon name="edit" extraClasses="ibexa-icon--small" />
            </div>
        );
    }

    renderDeleteBtn() {
        const { uploaded, aborted, disallowedSize, disallowedType, failed, uploading } = this.state;
        const canDelete = this.props.isUploaded || (uploaded && !aborted && !(disallowedSize || disallowedType) && !failed && !uploading);

        if (!canDelete) {
            return null;
        }

        const Translator = getTranslator();
        const label = Translator.trans(/*@Desc("Delete")*/ 'delete.label', {}, 'ibexa_multi_file_upload');

        return (
            <div
                className="btn ibexa-btn ibexa-btn--ghost ibexa-btn--no-text ibexa-btn--small c-upload-list-item__action c-upload-list-item__action--delete"
                onClick={this.deleteFile}
                title={label}
                tabIndex="-1"
            >
                <Icon name="trash" extraClasses="ibexa-icon--small" />
            </div>
        );
    }

    render() {
        const { isError, deleted, totalSize, errorMsgs, isMultipleErrosExpanded } = this.state;
        const isMultipleErros = errorMsgs.length > 1;
        const wrapperClassName = createCssClassNames({
            'c-upload-list-item': true,
            'c-upload-list-item--errored': isError,
            'c-upload-list-item--expanded-multiple-errors': isMultipleErrosExpanded,
        });

        if (deleted) {
            return null;
        }

        return (
            <div className={wrapperClassName}>
                <div className="c-upload-list-item__icon-wrapper">{!isError && this.renderIcon()}</div>
                <div className="c-upload-list-item__meta">
                    <div className="c-upload-list-item__name">{this.props.data.file.name}</div>
                    <div className="c-upload-list-item__size">{totalSize}</div>
                </div>
                <div className="c-upload-list-item__info">
                    {this.renderErrorInfo()}
                    {!isError && this.renderSuccessMessage()}
                    {!isError && this.renderProgressBar()}
                </div>
                <div className="c-upload-list-item__actions">
                    {!isError && this.renderAbortBtn()}
                    {!isError && this.renderEditBtn()}
                    {!isError && this.renderDeleteBtn()}
                </div>
                {isMultipleErros && (
                    <ul className="c-upload-list-item__multiple-errors-list">
                        {errorMsgs.map((errorMsg) => {
                            return <li className="c-upload-list-item__multiple-errors-item">{errorMsg}</li>;
                        })}
                    </ul>
                )}
            </div>
        );
    }
}

UploadItemComponent.propTypes = {
    data: PropTypes.object.isRequired,
    onAfterUpload: PropTypes.func.isRequired,
    onAfterAbort: PropTypes.func.isRequired,
    onAfterDelete: PropTypes.func.isRequired,
    createFileStruct: PropTypes.func.isRequired,
    publishFile: PropTypes.func.isRequired,
    deleteFile: PropTypes.func.isRequired,
    checkCanUpload: PropTypes.func.isRequired,
    adminUiConfig: PropTypes.shape({
        multiFileUpload: PropTypes.shape({
            defaultMappings: PropTypes.arrayOf(PropTypes.object).isRequired,
            fallbackContentType: PropTypes.object.isRequired,
            locationMappings: PropTypes.arrayOf(PropTypes.object).isRequired,
            maxFileSize: PropTypes.number.isRequired,
        }).isRequired,
        token: PropTypes.string.isRequired,
        siteaccess: PropTypes.string.isRequired,
    }).isRequired,
    parentInfo: PropTypes.shape({
        contentTypeIdentifier: PropTypes.string.isRequired,
        contentTypeId: PropTypes.number.isRequired,
        locationPath: PropTypes.string.isRequired,
        language: PropTypes.string.isRequired,
    }).isRequired,
    contentCreatePermissionsConfig: PropTypes.object,
    contentTypesMap: PropTypes.object.isRequired,
    currentLanguage: PropTypes.string,
    isUploaded: PropTypes.bool,
};

UploadItemComponent.defaultProps = {
    isUploaded: false,
    currentLanguage: '',
    contentCreatePermissionsConfig: {},
};
