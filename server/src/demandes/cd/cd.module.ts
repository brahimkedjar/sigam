import { Module } from '@nestjs/common';
import { ComiteDirectionController } from './cd.controller';
import { ComiteDirectionService } from './cd.service';

@Module({
  controllers: [ComiteDirectionController],
  providers: [ComiteDirectionService]
})
export class ComiteDirectionModule {}

