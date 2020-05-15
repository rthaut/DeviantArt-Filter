import { THUMBNAIL_SELECTOR as ECLIPSE_THUMBNAIL_SELECTOR } from './content/eclipse';
import { THUMBNAIL_SELECTOR as CLASSIC_THUMBNAIL_SELECTOR } from './content/classic';
const SELECTORS = [
    ECLIPSE_THUMBNAIL_SELECTOR,
    CLASSIC_THUMBNAIL_SELECTOR,
];

import {
    LOCAL_STORAGE_CHANGED,
    SHOW_FILTER_DEVIATION_MODAL,
    HIDE_FILTER_DEVIATION_MODAL,
} from './constants/messages';

import { SetMetadataOnThumbnail } from './content/metadata';

import * as CategoriesFilter from './content/filters/categories';
import * as KeywordsFilter from './content/filters/keywords';
import * as UsersFilter from './content/filters/users';
const FILTERS = [
    CategoriesFilter,
    KeywordsFilter,
    UsersFilter
];

/**
 * Runs all applicable logic on thumbnails (applying metadata, filtering, etc.)
 * @param {HTMLElement[]} thumbnails the list of thumbnail DOM nodes
 */
export const HandleThumbnails = async (thumbnails) => {
    const data = {};
    for (const F of FILTERS) {
        const storageData = await browser.storage.local.get(F.STORAGE_KEY);
        data[F.STORAGE_KEY] = storageData[F.STORAGE_KEY] ?? [];
    }

    // start loading metadata and applying filters that do require metadata first (asynchronously)
    thumbnails.forEach(async (thumbnail) => {
        let metadataApplied = true;
        try {
            await SetMetadataOnThumbnail(thumbnail);
        } catch (e) {
            console.error('Failed to set metadata on thumbnail', e, thumbnail);
            metadataApplied = false;
        }

        if (metadataApplied) {
            FILTERS
                .filter(F => F.REQUIRES_METADATA && data[F.STORAGE_KEY] && data[F.STORAGE_KEY].length)
                .forEach(F => F.FilterThumbnail(thumbnail, data[F.STORAGE_KEY]));
        }
    });

    // apply filters that do NOT require metadata last
    thumbnails.forEach(thumbnail => {
        FILTERS
            .filter(F => !F.REQUIRES_METADATA && data[F.STORAGE_KEY] && data[F.STORAGE_KEY].length)
            .forEach(F => F.FilterThumbnail(thumbnail, data[F.STORAGE_KEY]));
    });
};


/**
 * Uses a MutationObserver to watch for the insertion of new thumb DOM nodes
 */
const WatchForNewThumbs = (selector) => {
    const observer = new MutationObserver(async (mutations) => {
        // using a Set for thumbnails for native de-duplication
        let thumbnails = new Set();

        for (const { addedNodes } of mutations) {
            for (const addedNode of addedNodes) {
                if (typeof addedNode.matches === 'function') {
                    if (addedNode.matches(selector)) {
                        thumbnails.add(addedNode);
                    }
                }

                if (typeof addedNode.querySelectorAll === 'function') {
                    const addedNodeThumbnails = addedNode.querySelectorAll(selector);
                    if (addedNodeThumbnails.length) {
                        thumbnails = new Set([...thumbnails, ...addedNodeThumbnails]);
                    }
                }
            }
        }

        if (thumbnails.size) {
            await HandleThumbnails(thumbnails);
        }
    });

    observer.observe(document, {
        'childList': true,
        'subtree': true
    });
};

/**
 * Event handler for local storage changes
 * @param {string} changes the local storage changes
 */
export const OnLocalStorageChanged = async (key, changes) => {
    for (const F of FILTERS) {
        if (key === F.STORAGE_KEY) {
            const { added, removed, newValue } = changes;

            if (added.length) {
                console.debug('Applying new filters to document', added);
                console.time(`ApplyFiltersToDocument() [${key}]`);
                F.ApplyFiltersToDocument(added, SELECTORS.join(', '));
                console.timeEnd(`ApplyFiltersToDocument() [${key}]`);
            }

            if (removed.length) {
                console.debug('Removing old filters from document', removed);
                console.time(`RemoveFiltersFromDocument() [${key}]`);
                F.RemoveFiltersFromDocument(removed, newValue);
                console.timeEnd(`RemoveFiltersFromDocument() [${key}]`);
            }
        }
    }
};

/**
 * Event handler for runtime messages
 * @param {object} message the message
 */
const OnRuntimeMessage = message => {
    console.debug('Message from background script', message);
    switch (message.action) {
        case LOCAL_STORAGE_CHANGED:
            OnLocalStorageChanged(message.data.key, message.data.changes);
            break;

        case SHOW_FILTER_DEVIATION_MODAL:
            InitFilterFrame();
            ShowFilterFrame(message.data.link);
            break;

        case HIDE_FILTER_DEVIATION_MODAL:
            HideFilterFrame();
            break;
    }
};

const InitFilterFrame = () => {
    const id = 'filter-frame';
    let iframe = document.getElementById(id);
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.setAttribute('id', id);
        iframe.setAttribute('role', 'dialog');
        iframe.setAttribute('src', browser.runtime.getURL('pages/create-filters.html'));
        Object.assign(iframe.style, {
            'display': 'none',
            'zIndex': 9999,
            'margin': 0,
            'padding': 0,
            'background': 'transparent',
            'border': 'none',
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'width': '100vw',
            'height': '100vh',
        });
        document.body.prepend(iframe);
    }
};

const ShowFilterFrame = (url) => {
    const iframe = document.getElementById('filter-frame');
    if (iframe) {
        document.body.style.overflowY = 'hidden';
        iframe.style.display = 'block';
    }
};

const HideFilterFrame = () => {
    const iframe = document.getElementById('filter-frame');
    if (iframe) {
        iframe.style.display = 'none';
        document.body.style.overflowY = '';
    }
};

/**
 * Run once the content script is loaded
 */
(async () => {

    // create the filter frame first so it responds to messages
    InitFilterFrame();

    // setup message handlers as soon as we are ready to receive them
    if (!browser.runtime.onMessage.hasListener(OnRuntimeMessage)) {
        browser.runtime.onMessage.addListener(OnRuntimeMessage);
    }

    // setup observers for thumbnails loaded after initial render next
    WatchForNewThumbs(SELECTORS.join(', '));

    // get all thumbnails on the page and work with them
    await HandleThumbnails(document.querySelectorAll(SELECTORS.join(', ')));

})();
