const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const sounds = [
    { name: 'rain.ogg', page: 'https://commons.wikimedia.org/wiki/File:Rain_sound.ogg' },
    { name: 'wind.ogg', page: 'https://commons.wikimedia.org/wiki/File:Strong_wind_blowing_in_forest.ogg' },
    { name: 'temple.ogg', page: 'https://commons.wikimedia.org/wiki/File:Small_tibetan_singing_bowl.ogg' },
    { name: 'brown-noise.ogg', page: 'https://commons.wikimedia.org/wiki/File:Brown_noise.ogg' }
];

const downloadDir = path.join(__dirname, 'public', 'sounds');

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', (err) => reject(err));
        }).on('error', (err) => reject(err));
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve());
            });
        }).on('error', (err) => {
            fs.unlink(dest);
            reject(err);
        });
    });
}

async function run() {
    for (const sound of sounds) {
        try {
            console.log(`Fetching page for ${sound.name}...`);
            const html = await fetchPage(sound.page);

            // Regex to find ANY upload.wikimedia.org URL ending in .ogg, .mp3, or .wav
            // Look for href or src
            const audioRegex = /(https:)?\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-f0-9]\/[a-f0-9]{2}\/[^"]+\.(ogg|mp3|wav)/i;
            const match = html.match(audioRegex);

            if (match) {
                let url = match[0];
                if (url.startsWith('//')) url = 'https:' + url;
                console.log(`Found URL for ${sound.name}: ${url}`);
                const dest = path.join(downloadDir, sound.name);
                console.log(`Downloading to ${dest}...`);
                await downloadFile(url, dest);
                console.log(`Download complete for ${sound.name}`);

                // Convert temple.ogg to mp3 if needed by app? App supports mp3. 
                // But app logic handles extension? The app component SoundToggle checks sound.type?
                // Actually, user config says rain.ogg, wind.ogg, temple.mp3, brown-noise.ogg
                // I should rename or convert if necessary.
                // For now, I'll save as .ogg and rename the file extension if it's just a file container issue, 
                // or update the code to use .ogg for temple if it plays (browsers play ogg).

            } else {
                console.error(`Could not find audio URL for ${sound.name}`);
                // Log a snippet to see what we got
                console.log('HTML Snippet:', html.substring(0, 500));
                fs.writeFileSync(`debug_${sound.name}.html`, html);
            }
        } catch (err) {
            console.error(`Error processing ${sound.name}:`, err);
        }
    }
}

run();
