import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(AdBlockerPlugin()).use(StealthPlugin());

export type tzs = {
  current: string;
  next: string;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class AppService {
  private readonly logger = new Logger('AppService');

  tzs: tzs = {
    current: 'unknown',
    next: 'unknown',
  };

  getTzs(): tzs {
    return this.tzs;
  }

  async fetchTzs(): Promise<void> {
    let current: string = '';
    let next: string = '';

    this.logger.log('Launching puppeteer...');
    while (current === '' || next === '' || this.tzs.current === current) {
      puppeteer
        .launch({
          headless: true,
          protocolTimeout: 60000 * 4,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--disable-software-rasterizer',
            '--disable-features=VizDisplayCompositor',
          ],
        })
        .then(async (browser) => {
          try {
            this.logger.log('Fetching tzs...');
            const page = await browser.newPage();
            await page.setViewport({ width: 800, height: 600 });
            await page.goto('https://d2emu.com/tz');

            const currentEl = await page.$('#current');
            current = this.replaceBrs(
              await currentEl?.evaluate((el) => el.innerHTML),
            );
            this.logger.log('Received current tz: ' + current);
            const nextEl = await page.$('#next');
            next = this.replaceBrs(
              await nextEl?.evaluate((el) => el.innerHTML),
            );
            this.logger.log('Received next tz: ' + next);
            await browser.close();
          } catch (err) {
            this.logger.error(err);
          }
        });
      await sleep(5000);
    }

    this.tzs = {
      current,
      next,
    };
  }

  replaceBrs(text: string): string {
    return text.replaceAll('<br>', ', ');
  }
}
