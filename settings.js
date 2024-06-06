let websites = [];
document.addEventListener('DOMContentLoaded', function() {
    const whitelistTable = document.getElementById('whitelistTable');
    const whitelistBody = document.getElementById('whitelistBody');
    const newWebsiteInput = document.getElementById('newWebsiteInput');
    const addWebsiteButton = document.getElementById('addWebsiteButton');

    // Load whitelisted websites from storage
    chrome.storage.sync.get('settings', function(settings) {
        settings = settings.settings;

        settings.whitelist.forEach(function(website) {
            websites.push(website);
            addWebsiteToTable(website);
        });
    });

    // Add website button click event
    addWebsiteButton.addEventListener('click', function() {
        const website = newWebsiteInput.value.trim();
        if (website) {
            addWebsiteToTable(website);
            websites.push(website);
            newWebsiteInput.value = '';
            saveWhitelistToStorage();
        }
    });

    // Add website to table
    function addWebsiteToTable(website) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-zinc-300 sm:pl-0">${website}</td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                <a href="#" class="removeButton text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Remove</a>
            </td>
        `;
        whitelistBody.appendChild(row);

        // Remove button click event
        const removeButton = row.querySelector('.removeButton');
        removeButton.addEventListener('click', function() {
            websites = removeItemOnce(websites, row.querySelector('td').firstChild.textContent)
            row.remove();
            saveWhitelistToStorage();
        });
    }

    // Save whitelist to storage
    function saveWhitelistToStorage() {
        chrome.storage.sync.get('settings', function(settings) {
            settings.whitelist = websites;
            chrome.storage.sync.set({'settings': settings});
        });
    }

    function removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
        }
        return arr;
    }
});
