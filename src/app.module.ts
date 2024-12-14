import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DateTime } from 'luxon';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  appService: AppService;

  constructor(appService: AppService) {
    this.appService = appService;
    this.fetchNext();
  }

  fetchNext() {
    this.appService.fetchTzs();
    setTimeout(() => {
      this.fetchNext();
    }, this.getNextFetchTime());
  }

  getNextFetchTime() {
    return (
      DateTime.now().endOf('hour').plus({ seconds: 5 }).toMillis() -
      DateTime.now().toMillis()
    );
  }
}
