import * as FILTERS from "../filters";
import * as MESSAGES from "../constants/messages";

import { OpenOrShowURL } from "../background/tabs";

export const OnRuntimeMessage = (message, sender) => {
  switch (message.action) {
    case MESSAGES.CREATE_FILTER:
      return FILTERS.AddFilter(message.data.key, message.data.value);

    case MESSAGES.REMOVE_FILTER:
      return FILTERS.RemoveFilter(message.data.key, message.data.value);

    case MESSAGES.REMOVE_FILTERS:
      return FILTERS.RemoveFilters(message.data.key, message.data.value);

    case MESSAGES.UPDATE_FILTER:
      return FILTERS.UpdateFilter(
        message.data.key,
        message.data.value.old,
        message.data.value.new,
      );

    case MESSAGES.VALIDATE_NEW_FILTER:
      return FILTERS.ValidateNewFilter(message.data.key, message.data.value);

    case MESSAGES.VALIDATE_UPDATED_FILTER:
      return FILTERS.ValidateUpdatedFilter(
        message.data.key,
        message.data.value.old,
        message.data.value.new,
      );

    case MESSAGES.SAVE_FILTER:
      return FILTERS.SaveFilters(message.data.key, message.data.value);

    case MESSAGES.RESET_ALL_FILTERS:
      return browser.storage.local.set({
        users: [],
        keywords: [],
      });

    case MESSAGES.IMPORT_FILTERS:
      return FILTERS.BulkImportFilters(message.data);

    case MESSAGES.EXPORT_FILTERS:
      return FILTERS.GetAllFilters();

    case MESSAGES.FETCH_METADATA:
      return fetch(
        new URL(
          `https://backend.deviantart.com/oembed?url=${message.data.url}`,
        ),
      )
        .then((response) => response.json())
        .catch(() =>
          Promise.reject(
            new Error(
              `Invalid API Response for Deviation URL: ${message.data.url}`,
            ),
          ),
        );

    case MESSAGES.HIDE_FILTER_DEVIATION_MODAL:
      // send the message right back to the original tab
      return browser.tabs.sendMessage(sender.tab.id, {
        action: message.action,
      });

    case MESSAGES.SHOW_MANAGEMENT_PAGE:
      return OpenOrShowURL(browser.runtime.getURL("pages/manage.html"));
  }
};

export const SendMessageToAllTabs = async (action, data) => {
  const tabs = await browser.tabs.query({ url: "*://*.deviantart.com/*" });
  for (const tab of tabs) {
    browser.tabs.sendMessage(tab.id, { action, data });
  }
};

export const SendMessageToScriptPage = async (page, action, data) => {
  const tabs = await browser.tabs.query({ url: browser.runtime.getURL(page) });
  for (const tab of tabs) {
    browser.tabs.sendMessage(tab.id, { action, data });
  }
};
