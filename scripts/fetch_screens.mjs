import fs from 'fs';
import path from 'path';
import https from 'https';

const dataFile = "C:/Users/HITESH ROUT/.gemini/antigravity/brain/7921ac7d-ab7e-47e2-8dc0-acaa5abde001/.system_generated/steps/19/output.txt";
const outDir = "./html-screens";

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

async function run() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const screen of data.screens) {
    const title = screen.title;
    if (screen.htmlCode && screen.htmlCode.downloadUrl) {
      console.log(`Fetching ${title}...`);
      const html = await fetchHtml(screen.htmlCode.downloadUrl);
      
      const fileName = title.replace(/[^a-zA-Z0-9-]/g, '_') + '.html';
      const destPath = path.join(outDir, fileName);
      
      fs.writeFileSync(destPath, html);
      console.log(`Wrote ${destPath}`);
    }
  }
}
run();
