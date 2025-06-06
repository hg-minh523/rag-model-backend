import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from './customers.entity';
import { ShopsModule } from '../shops/shops.module';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]), // Register Customer entity repository
    forwardRef(() => ShopsModule), // Use forwardRef to handle circular dependency
    forwardRef(() => ChannelsModule), // Use forwardRef to handle circular dependency with ChannelsModule
  ],
  providers: [CustomersService],
  controllers: [CustomersController],
  exports: [CustomersService], // Export service for other modules to use
})
export class CustomersModule {}
