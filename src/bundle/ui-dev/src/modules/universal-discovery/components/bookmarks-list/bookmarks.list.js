import React, { useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { parse as parseTooltip } from '@ibexa-admin-ui/src/bundle/Resources/public/js/scripts/helpers/tooltips.helper';

import Icon from '../../../common/icon/icon';

import { createCssClassNames } from '../../../common/helpers/css.class.names';
import { useLoadBookmarksFetch } from '../../hooks/useLoadBookmarksFetch';
import {
    ContentTypesMapContext,
    MarkedLocationIdContext,
    LoadedLocationsMapContext,
    SelectedLocationsContext,
    MultipleConfigContext,
    ContainersOnlyContext,
    AllowedContentTypesContext,
} from '../../universal.discovery.module';

const SCROLL_OFFSET = 200;

const BookmarksList = ({ setBookmarkedLocationMarked, itemsPerPage }) => {
    const refBookmarksList = useRef(null);
    const [offset, setOffset] = useState(0);
    const [bookmarks, setBookmarks] = useState([]);
    const [markedLocationId] = useContext(MarkedLocationIdContext);
    const [, dispatchLoadedLocationsAction] = useContext(LoadedLocationsMapContext);
    const [, dispatchSelectedLocationsAction] = useContext(SelectedLocationsContext);
    const [multiple] = useContext(MultipleConfigContext);
    const allowedContentTypes = useContext(AllowedContentTypesContext);
    const contentTypesMap = useContext(ContentTypesMapContext);
    const containersOnly = useContext(ContainersOnlyContext);
    const [data, isLoading] = useLoadBookmarksFetch(itemsPerPage, offset);
    const loadMore = ({ target }) => {
        const areAllItemsLoaded = bookmarks.length >= data.count;
        const isOffsetReached = target.scrollHeight - target.clientHeight - target.scrollTop < SCROLL_OFFSET;

        if (areAllItemsLoaded || !isOffsetReached || isLoading) {
            return;
        }

        setOffset(offset + itemsPerPage);
    };
    const renderLoadingSpinner = () => {
        if (!isLoading) {
            return null;
        }

        return (
            <div className="c-bookmarks-list__spinner-wrapper">
                <Icon name="spinner" extraClasses="m-sub-items__spinner ibexa-icon--medium ibexa-spin" />
            </div>
        );
    };

    useEffect(() => {
        if (isLoading) {
            return;
        }

        setBookmarks((prevState) => [...prevState, ...data.items]);
    }, [data.items, isLoading]);

    useEffect(() => {
        parseTooltip(refBookmarksList.current);
    }, [bookmarks]);

    if (!bookmarks.length) {
        return null;
    }

    return (
        <div className="c-bookmarks-list" onScroll={loadMore} ref={refBookmarksList}>
            {bookmarks.map((bookmark) => {
                const isMarked = bookmark.id === markedLocationId;
                const contentTypeInfo = contentTypesMap[bookmark.ContentInfo.Content.ContentType._href];
                const { isContainer } = contentTypeInfo;
                const isNotSelectable =
                    (containersOnly && !isContainer) || (allowedContentTypes && !allowedContentTypes.includes(contentTypeInfo.identifier));
                const className = createCssClassNames({
                    'c-bookmarks-list__item': true,
                    'c-bookmarks-list__item--marked': isMarked,
                    'c-bookmarks-list__item--not-selectable': isNotSelectable,
                });
                const markLocation = () => {
                    if (isMarked) {
                        return;
                    }

                    dispatchLoadedLocationsAction({ type: 'CLEAR_LOCATIONS' });
                    setBookmarkedLocationMarked(bookmark.id);

                    if (!multiple) {
                        dispatchSelectedLocationsAction({ type: 'CLEAR_SELECTED_LOCATIONS' });

                        if (!isNotSelectable) {
                            dispatchSelectedLocationsAction({ type: 'ADD_SELECTED_LOCATION', location: bookmark });
                        }
                    }
                };

                return (
                    <div
                        key={bookmark.id}
                        className={className}
                        onClick={markLocation}
                        title={bookmark.ContentInfo.Content.TranslatedName}
                        data-tooltip-container-selector=".c-bookmarks-list"
                    >
                        <Icon extraClasses="ibexa-icon--small" customPath={contentTypeInfo.thumbnail} />
                        <span className="c-bookmarks-list__item-name">{bookmark.ContentInfo.Content.TranslatedName}</span>
                    </div>
                );
            })}
            {renderLoadingSpinner()}
        </div>
    );
};

BookmarksList.propTypes = {
    setBookmarkedLocationMarked: PropTypes.func.isRequired,
    itemsPerPage: PropTypes.number,
};

BookmarksList.defaultProps = {
    itemsPerPage: 50,
};

export default BookmarksList;
