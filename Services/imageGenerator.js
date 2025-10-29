import { createCanvas } from "canvas";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateSummaryImage(data) {
  const { totalCountries, topCountries, lastRefreshed } = data;
  
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1e3a8a');
  gradient.addColorStop(1, '#3b82f6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Country Currency Summary', width / 2, 60);

  // Total countries
  ctx.font = '24px Arial';
  ctx.fillText(`Total Countries: ${totalCountries}`, width / 2, 110);

  // Top 5 header
  ctx.font = 'bold 26px Arial';
  ctx.fillText('Top 5 Countries by Estimated GDP', width / 2, 170);

  // Top 5 list
  ctx.font = '18px Arial';
  ctx.textAlign = 'left';
  let yPos = 220;
  
  topCountries.forEach((country, index) => {
    const gdpFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(country.estimated_gdp);

    ctx.fillText(
      `${index + 1}. ${country.name} - ${gdpFormatted}`,
      50,
      yPos
    );
    yPos += 40;
  });

  // Timestamp
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Last Refreshed: ${new Date(lastRefreshed).toLocaleString()}`,
    width / 2,
    height - 40
  );

  // Save image
  const cacheDir = path.join(__dirname, '..', 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(cacheDir, 'summary.png'), buffer);
}