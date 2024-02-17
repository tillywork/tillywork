import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller({
  version: '1',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }
}
