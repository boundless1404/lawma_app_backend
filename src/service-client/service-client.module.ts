import { Module } from '@nestjs/common';
import { ServiceClientController } from './service-client.controller';
import { ServiceClientService } from './service-client.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ServiceClientController],
  providers: [ServiceClientService],
})
export class ServiceClientModule {}
