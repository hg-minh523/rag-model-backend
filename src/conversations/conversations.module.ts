import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationMembersModule } from 'src/conversation-members/conversation-members.module';
import { CustomersModule } from 'src/customers/customers.module';
import { TagsModule } from 'src/tags/tags.module';
import { UsersModule } from 'src/users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsController } from './conversations.controller';
import { Conversation } from './conversations.entity';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    forwardRef(() => MessagesModule),
    forwardRef(() => ConversationMembersModule),
    forwardRef(() => TagsModule),
    forwardRef(() => CustomersModule), // Prevent circular dependency
    forwardRef(() => UsersModule),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
