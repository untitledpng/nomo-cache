// @trigger runtime-message
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'toggleWhitelist' && message.domain) {
        toggleWhitelist(message.domain);
    }

    if (message.action === 'toggleEnabled') {
        toggleEnabled();
    }
});

// @trigger reloading-page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        mainAction(tab);
    }
});

// @trigger switching-tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        mainAction(tab);
    });
});

function mainAction(tab) {
    chrome.storage.sync.get('settings', function(settings) {
        settings = settings.settings;

        if ( ! settings.enabled) {
            updateIcon(false, false);
            return;
        }

        let isOnWhitelist = false;
        settings.whitelist.forEach(function(website) {
            if (tab.url.startsWith(website)) {
                isOnWhitelist = true;
            }
        });

        if (isOnWhitelist) {
            updateIcon(false, true);
            return;
        }

        chrome.browsingData.removeCache({}, () => {
            console.log('Cache cleared.'); // DEBUG
        });

        updateIcon(true, false);
    });
}

function toggleWhitelist(domain) {
    chrome.storage.sync.get('settings', function(settings) {
        settings = settings.settings;
        const index = settings.whitelist.indexOf(domain);

        if (index === -1) {
            settings.whitelist.push(domain);
        } else {
            settings.whitelist.splice(index, 1);
        }

        chrome.storage.sync.set({'settings': settings});
    });
}

function updateIcon(enabled = true, whitelisted = false) {
    state = enabled ? 'on' : 'off';
    chrome.action.setIcon({ path: `icons/icon16_${state}.png` });
    chrome.action.setBadgeText({ text: whitelisted ? 'W' : '' });
}

function toggleEnabled() {
    chrome.storage.sync.get('settings', function(settings) {
        settings = settings.settings;
        settings.enabled = ! settings.enabled;

        chrome.storage.sync.set({'settings': settings});

        updateIcon(settings.enabled, false);
        console.log('settings.enabled', settings.enabled); // DEBUG
    });
}

// Initialize extension
chrome.storage.sync.get('settings', function(settings) {
    settings = settings.settings || {};

    if (Object.keys(settings).length === 0) {
        settings = {
            'settings': {
                'settings_version': 1,
                'enabled': true,
                'whitelist': [],
            }
        };

        chrome.storage.sync.set({'settings': settings});
    }

    updateIcon(settings.enabled, false);
});
