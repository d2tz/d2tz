import { Controller, Get } from '@nestjs/common';
import { AppService, tzs } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getRoot(): string {
    return 'Webserver is running. Use /tz to get the current and next tzs.';
  }

  @Get('/tz')
  async getTzs(): Promise<tzs | string> {
    const tzs = await this.appService.getTzs();
    return tzs;
  }
}
