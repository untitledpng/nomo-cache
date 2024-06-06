document.addEventListener('DOMContentLoaded', function() {
    const toggleEnabled = document.getElementById('toggleEnabled');
    const toggleWhitelist = document.getElementById('toggleWhitelist');
    const whitelistStatus = document.getElementById('whitelistStatus');

    let isEnabled;
    let isWhitelisted = false;

    toggleEnabled.addEventListener('click', function() {
        isEnabled = ! isEnabled;
        chrome.runtime.sendMessage({ action: 'toggleEnabled' }, function(response) {
            toggleEnabled.textContent = isEnabled
                ? 'disable extension'
                : 'enable extension';
        });
    });

    toggleWhitelist.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentTab = tabs[0];

            if (currentTab && currentTab.url) {
                const currentDomain = new URL(currentTab.url).origin;
                chrome.runtime.sendMessage({ action: 'toggleWhitelist', domain: currentDomain });
                isWhitelisted = ! isWhitelisted;

                whitelistStatus.textContent = isWhitelisted ? 'disabled' : 'enabled';
                toggleWhitelist.textContent = isWhitelisted
                    ? 'remove from whitelist'
                    : 'whitelist this site';
            }
        });
    });

    // Initialize
    chrome.storage.sync.get('settings', function(settings) {
        settings = settings.settings;

        isEnabled = settings.enabled;
        toggleEnabled.textContent = isEnabled
            ? 'disable extension'
            : 'enable extension';

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length > 0) {
                const currentTab = tabs[0];
                if (currentTab.url) {

                    const currentUrl = new URL(currentTab.url).origin;
                    settings.whitelist.forEach(function(website) {
                        if (currentUrl.startsWith(website)) {
                            isWhitelisted = true;
                        }
                    });
                }
            }

            whitelistStatus.textContent = isWhitelisted ? 'disabled' : 'enabled';
            toggleWhitelist.textContent = isWhitelisted
                ? 'remove from whitelist'
                : 'whitelist this site';
        });
    });
});
