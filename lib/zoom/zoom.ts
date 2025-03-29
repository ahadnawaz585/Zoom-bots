// lib/zoom/zoom.ts
import puppeteer from 'puppeteer';

export async function runMultipleBots(
  quantity: number,
  meetingId: string,
  password: string,
  duration: number, // Still included in signature but not used
  botNames: string[],
  onStatusUpdate: (botId: number, status: string) => void
) {
  const browser = await puppeteer.launch({
    headless: 'shell',
    executablePath: 'C:\\Users\\AHAD\\.cache\\puppeteer\\chrome\\win64-127.0.6533.88\\chrome-win64\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  async function joinBot(botId: number): Promise<boolean> {
    let page: any;
    try {
      page = await browser.newPage();
      
      await page.setRequestInterception(true);
      page.on('request', (req: any) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      const meetingUrl = `https://zoom.us/wc/join/${meetingId}`;
      await page.goto(meetingUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

      await page.waitForSelector('#input-for-pwd', { timeout: 3000 });
      await page.type('#input-for-pwd', password);
      
      await page.waitForSelector('#input-for-name', { timeout: 3000 });
      await page.type('#input-for-name', botNames[botId - 1]);
      
      await page.waitForSelector('.preview-join-button', { timeout: 3000 });
      await page.evaluate(() => {
        const joinButton: any = document.querySelector('.preview-join-button');
        joinButton?.click();
      });

      await page.waitForSelector('.join-audio-container', { timeout: 8000 });
      onStatusUpdate(botId, 'Connected');

      // Removed the setTimeout for disconnection
      // Pages remain open, keeping bots in the meeting

      return true;
    } catch (error: any) {
      onStatusUpdate(botId, `Error: ${error.message}`);
      if (page) await page.close();
      return false;
    }
  }

  const botStatuses: Record<number, boolean> = {};
  
  // Create an array of promises for all bots
  const botPromises = Array.from({ length: quantity }, (_, i) => {
    const botId = i + 1;
    onStatusUpdate(botId, 'Initializing');
    return joinBot(botId).then(success => {
      botStatuses[botId] = success;
      return success;
    });
  });

  // Wait for all bots to complete their initial join attempt
  await Promise.all(botPromises);

  // Removed browser.close() timeout since we want bots to stay connected
  // Note: Browser will remain open until manually closed or process ends

  return botStatuses;
}   