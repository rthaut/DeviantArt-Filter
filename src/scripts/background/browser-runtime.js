import BrowserPageAction from './browser-page-action';
import BrowserTabs from './browser-tabs';
import ContentScript from './content-script';
import Filters from './filters';
import Management from './management';
import Metadata from './metadata';
import Migration from './migration';
import Options from './options';

const BrowserRuntime = (() => {

    const BrowserRuntime = {

        /**
         * Event listener for browser runtime messages
         * @param {object} message The message
         * @param {runtime.MessageSender} sender The sender of the message
         */
        'onRuntimeMessage': function (message, sender) {
            console.log('[Background] BrowserRuntime.onRuntimeMessage()', message, sender);

            if (message.action !== undefined) {
                switch (message.action) {
                    case 'content-script-loaded':
                        return ContentScript.onContentScriptLoaded(sender.tab);

                    case 'show-management-panel':
                        return Management.showManagementPanel();

                    case 'get-options':
                        return Options.getOptions();

                    case 'set-option':
                        return Options.setOption(message.data.option, message.data.value);

                    case 'get-filters-meta-data':
                        return Promise.resolve(Filters.getFiltersMetaData());

                    case 'get-filter-items':
                        return Filters.getItems(message.data.filter, message.data.limit, message.data.offset);

                    case 'add-filter-item':
                        return Filters.addFilterItem(message.data.filter, message.data.item);

                    case 'remove-filter-item':
                        return Filters.removeFilterItem(message.data.filter, message.data.item);

                    case 'toggle-filter-item':
                        return Filters.toggleFilterItem(message.data.filter, message.data.item);

                    case 'import-filters':
                        if (message.data.file !== undefined && message.data.file !== null) {
                            return Filters.importFiltersFromFile(message.data.file);
                        } else {
                            return Filters.importFiltersFromObject(message.data);
                        }

                    case 'export-filters':
                        return Filters.exportFilters();

                    case 'migrate-filter':
                        return Migration.migrateFilter(message.data.filter, message.data.items);

                    case 'get-category-hierarchy':
                        return Metadata.getCategoryHierarchy(message.data);

                    case 'send-metadata-to-tab':
                        return Metadata.sendMetadataToTab(sender.tab, message.data && message.data.url ? message.data.url : null);

                    case 'get-metadata-for-url':
                        return Metadata.getMetadataForURL(message.data.url, message.data.offset, message.data.minimum);

                    default:
                        console.error(`no logic defined for action '${message.action}'`);
                        return Promise.resolve(null);
                }
            }

            return true;
        },

        /**
         * Event handler for installation event
         * @param {object} details
         */
        'onRuntimeInstalled': function (details) {
            console.log('[Background] BrowserRuntime.onRuntimeInstalled()', details);

            switch (details.reason) {
                case 'install':
                    console.log('The extension was installed' + (details.temporary ? ' temporarily' : '') + '.');
                    Options.initDefaultOptions();
                    BrowserPageAction.initPageAction();
                    BrowserTabs.reloadTabs();
                    break;

                case 'update':
                    console.log('The extension was updated to a new version: ', details.previousVersion);
                    Options.initDefaultOptions();
                    BrowserPageAction.initPageAction();
                    BrowserTabs.reloadTabs();
                    break;

                case 'browser_update':
                case 'chrome_update':
                    console.log('The browser was updated to a new version.');
                    break;

                case 'shared_module_update':
                    console.log('Another extension (ID: ' + details.id + '), which contains a module used by this extension, was updated.');
                    break;
            }
        }

    };

    return BrowserRuntime;

})();

export default BrowserRuntime;
