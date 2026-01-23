const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                download(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            const file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

const urls = [
    { url: 'https://github.com/ionic-team/capacitor-swift-pm/releases/download/8.0.1/Capacitor.xcframework.zip', name: 'Capacitor.zip' },
    { url: 'https://github.com/ionic-team/capacitor-swift-pm/releases/download/8.0.1/Cordova.xcframework.zip', name: 'Cordova.zip' }
];

(async () => {
    for (const item of urls) {
        console.log(`Downloading ${item.name}...`);
        try {
            await download(item.url, item.name);
            console.log(`Successfully downloaded ${item.name}`);
        } catch (err) {
            console.error(`Error downloading ${item.name}:`, err.message);
        }
    }
})();
