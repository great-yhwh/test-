(function() {
    const hasWebApp = typeof window.WebApp !== 'undefined';
    const warningEl = document.getElementById('no-webapp-warning');
    const initInfoEl = document.getElementById('init-info');

    if (!hasWebApp) {
        warningEl.style.display = 'block';
        initInfoEl.style.display = 'none';

        window.WebApp = {
            platform: 'web',
            version: '0.0.0',
            initData: '',
            initDataUnsafe: {},
            requestScreenMaxBrightness: () => Promise.resolve({maxBrightness: false}),
            restoreScreenBrightness: () => Promise.resolve({maxBrightness: false}),
            ScreenCapture: {
                enableScreenCapture: () => Promise.resolve({isScreenCaptureEnabled: false}),
                disableScreenCapture: () => Promise.resolve({isScreenCaptureEnabled: false}),
            },
            requestContact: () => Promise.reject(new Error('WebApp not available')),
            enableClosingConfirmation: () => {},
            disableClosingConfirmation: () => {},
            openLink: (url) => { alert('Emulation openLink: ' + url); },
            openMaxLink: (url) => { alert('Emulation openMaxLink: ' + url); },
            downloadFile: (url, name) => Promise.resolve({status: 'cancelled'}),
            shareContent: (params) => Promise.resolve({status: 'cancelled'}),
            shareMaxContent: (params) => Promise.resolve({status: 'cancelled'}),
            openCodeReader: (fileSelect) => Promise.resolve({value: 'test-qr-data'}),
            BackButton: {
                isVisible: false,
                show: () => { window.WebApp.BackButton.isVisible = true; },
                hide: () => { window.WebApp.BackButton.isVisible = false; },
                onClick: () => {},
                offClick: () => {},
            },
            DeviceStorage: {
                setItem: (k,v) => Promise.resolve({status: 'updated'}),
                getItem: (k) => Promise.resolve({key: k, value: 'mock-value'}),
                removeItem: (k) => Promise.resolve({status: 'removed'}),
                clear: () => Promise.resolve(),
            },
            SecureStorage: {
                setItem: (k,v) => Promise.resolve({status: 'updated'}),
                getItem: (k) => Promise.resolve({key: k, value: 'mock-secure-value'}),
                removeItem: (k) => Promise.resolve({status: 'removed'}),
                clear: () => Promise.resolve(),
            }
        };
    }

    const WebApp = window.WebApp;
    const logEl = document.getElementById('log');

    function log(message, data) {
        const time = new Date().toLocaleTimeString();
        let entry = `[${time}] ${message}`;
        if (data !== undefined) {
            entry += '\n' + JSON.stringify(data, null, 2);
        }
        logEl.textContent += entry + '\n';
        logEl.scrollTop = logEl.scrollHeight;
    }

    document.getElementById('btn-clear-log').addEventListener('click', () => {
        logEl.textContent = '';
    });

    function displayInitData() {
        document.getElementById('platform').textContent = WebApp.platform || '—';
        document.getElementById('version').textContent = WebApp.version || '—';
        const initData = WebApp.initData || '';
        document.getElementById('initdata').textContent = initData.length > 30 ? initData.substring(0, 30) + '…' : initData || '—';

        const unsafe = WebApp.initDataUnsafe || {};
        if (unsafe.user) {
            const u = unsafe.user;
            document.getElementById('user-info').textContent = `${u.first_name || ''} ${u.last_name || ''} (@${u.username || '—'}) id:${u.id}`;
        } else {
            document.getElementById('user-info').textContent = '—';
        }
        if (unsafe.chat) {
            document.getElementById('chat-info').textContent = `${unsafe.chat.type} #${unsafe.chat.id}`;
        } else {
            document.getElementById('chat-info').textContent = '—';
        }
        document.getElementById('start-param').textContent = unsafe.start_param || '—';

        log('Init data loaded', {platform: WebApp.platform, version: WebApp.version, user: unsafe.user});
    }
    displayInitData();

    function safeCall(promise, successMsg) {
        promise.then(result => {
            log(successMsg + ' - success', result);
        }).catch(err => {
            log(successMsg + ' - error', err);
        });
    }

    document.getElementById('btn-brightness-on').addEventListener('click', () => {
        safeCall(WebApp.requestScreenMaxBrightness(), 'Max brightness');
    });
    document.getElementById('btn-brightness-off').addEventListener('click', () => {
        safeCall(WebApp.restoreScreenBrightness(), 'Brightness restored');
    });

    document.getElementById('btn-screenshot-on').addEventListener('click', () => {
        safeCall(WebApp.ScreenCapture.enableScreenCapture(), 'Screen capture enabled');
    });
    document.getElementById('btn-screenshot-off').addEventListener('click', () => {
        safeCall(WebApp.ScreenCapture.disableScreenCapture(), 'Screen capture disabled');
    });

    document.getElementById('btn-request-phone').addEventListener('click', () => {
        safeCall(WebApp.requestContact(), 'Phone request');
    });

    document.getElementById('btn-enable-close-confirm').addEventListener('click', () => {
        WebApp.enableClosingConfirmation();
        log('Closing confirmation enabled');
    });
    document.getElementById('btn-disable-close-confirm').addEventListener('click', () => {
        WebApp.disableClosingConfirmation();
        log('Closing confirmation disabled');
    });

    document.getElementById('btn-open-link').addEventListener('click', () => {
        log('Opening external link https://example.com');
        WebApp.openLink('https://example.com');
    });
    document.getElementById('btn-open-max-link').addEventListener('click', () => {
        log('Opening MAX deep link https://max.ru/test');
        WebApp.openMaxLink('https://max.ru/test');
    });

    document.getElementById('btn-download').addEventListener('click', () => {
        const testFileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        const fileName = 'test-document.pdf';
        log(`Downloading file: ${fileName}`);
        safeCall(WebApp.downloadFile(testFileUrl, fileName), 'File download');
    });

    document.getElementById('btn-share-content').addEventListener('click', () => {
        log('Sharing to external apps');
        safeCall(WebApp.shareContent({text: 'Hello from MAX Bridge!', link: 'https://max.ru'}), 'External share');
    });
    document.getElementById('btn-share-max-content').addEventListener('click', () => {
        log('Sharing inside MAX');
        safeCall(WebApp.shareMaxContent({text: 'Test message', link: 'https://max.ru'}), 'MAX share');
    });

    document.getElementById('btn-qr-file').addEventListener('click', () => {
        log('Opening QR scanner (file/camera)');
        safeCall(WebApp.openCodeReader(true), 'QR scan (fileSelect=true)');
    });
    document.getElementById('btn-qr-camera').addEventListener('click', () => {
        log('Opening QR scanner (camera only)');
        safeCall(WebApp.openCodeReader(false), 'QR scan (fileSelect=false)');
    });

    const backBtnLog = () => log('Back button pressed');
    WebApp.BackButton.onClick(backBtnLog);
    document.getElementById('btn-back-show').addEventListener('click', () => {
        WebApp.BackButton.show();
        log('Back button shown, isVisible=' + WebApp.BackButton.isVisible);
    });
    document.getElementById('btn-back-hide').addEventListener('click', () => {
        WebApp.BackButton.hide();
        log('Back button hidden, isVisible=' + WebApp.BackButton.isVisible);
    });

    document.getElementById('btn-ds-set').addEventListener('click', () => {
        const key = document.getElementById('ds-key').value.trim();
        const value = document.getElementById('ds-value').value.trim();
        if (!key || !value) {
            log('Enter key and value for Device Storage');
            return;
        }
        safeCall(WebApp.DeviceStorage.setItem(key, value), `DeviceStorage.setItem(${key})`);
    });
    document.getElementById('btn-ds-get').addEventListener('click', () => {
        const key = document.getElementById('ds-key').value.trim();
        if (!key) {
            log('Enter key to get');
            return;
        }
        safeCall(WebApp.DeviceStorage.getItem(key), `DeviceStorage.getItem(${key})`);
    });
    document.getElementById('btn-ds-remove').addEventListener('click', () => {
        const key = document.getElementById('ds-key').value.trim();
        if (!key) {
            log('Enter key to remove');
            return;
        }
        safeCall(WebApp.DeviceStorage.removeItem(key), `DeviceStorage.removeItem(${key})`);
    });
    document.getElementById('btn-ds-clear').addEventListener('click', () => {
        safeCall(WebApp.DeviceStorage.clear(), 'DeviceStorage cleared');
    });

    document.getElementById('btn-ss-set').addEventListener('click', () => {
        const key = document.getElementById('ss-key').value.trim();
        const value = document.getElementById('ss-value').value.trim();
        if (!key || !value) {
            log('Enter key and value for Secure Storage');
            return;
        }
        safeCall(WebApp.SecureStorage.setItem(key, value), `SecureStorage.setItem(${key})`);
    });
    document.getElementById('btn-ss-get').addEventListener('click', () => {
        const key = document.getElementById('ss-key').value.trim();
        if (!key) {
            log('Enter key to get');
            return;
        }
        safeCall(WebApp.SecureStorage.getItem(key), `SecureStorage.getItem(${key})`);
    });
    document.getElementById('btn-ss-remove').addEventListener('click', () => {
        const key = document.getElementById('ss-key').value.trim();
        if (!key) {
            log('Enter key to remove');
            return;
        }
        safeCall(WebApp.SecureStorage.removeItem(key), `SecureStorage.removeItem(${key})`);
    });
    document.getElementById('btn-ss-clear').addEventListener('click', () => {
        safeCall(WebApp.SecureStorage.clear(), 'SecureStorage cleared');
    });

    log('Application ready for testing. WebApp available: ' + hasWebApp);
})();