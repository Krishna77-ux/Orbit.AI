import { Stitch, StitchToolClient } from "@google/stitch-sdk";
import { createWriteStream, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import path from "path";

const API_KEY = process.env.STITCH_API_KEY || "REPLACE_WITH_YOUR_KEY";
const PROJECT_ID = "2749209880514228697";
const OUT_DIR = "./stitch-output";

const screens = [
  { name: "Login Page",                   id: "3fef46cf9de5446ea35680f9493d4aa1" },
];

async function downloadFile(url, destPath) {
  console.log(`  Downloading -> ${destPath}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const writer = createWriteStream(destPath);
  await pipeline(Readable.fromWeb(res.body), writer);
}

(async () => {
  mkdirSync(OUT_DIR, { recursive: true });

  const client = new StitchToolClient({ apiKey: API_KEY });
  const sdk = new Stitch(client);
  const project = sdk.project(PROJECT_ID);

  for (const s of screens) {
    console.log(`\n=== ${s.name} (${s.id}) ===`);
    try {
      const screen = await project.getScreen(s.id);

      const htmlUrl = await screen.getHtml();
      const imgUrl  = await screen.getImage();

      console.log(`  HTML URL: ${htmlUrl}`);
      console.log(`  IMG  URL: ${imgUrl}`);

      const safeName = s.name.replace(/[^a-z0-9]/gi, "_");
      await downloadFile(htmlUrl, path.join(OUT_DIR, `${safeName}.html`));
      await downloadFile(imgUrl,  path.join(OUT_DIR, `${safeName}.png`));

      console.log(`  ✓ Saved ${safeName}.html and ${safeName}.png`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  await client.close();
  console.log("\n=== All done! Files saved to ./stitch-output/ ===");
})();
