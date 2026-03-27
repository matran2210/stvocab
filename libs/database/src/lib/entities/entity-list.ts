import { Attendance } from './attendance.entity';
import { Category } from './category.entity';
import { ChatMessage } from './chat-message.entity';
import { Item } from './item.entity';
import { LearningLog } from './learning-log.entity';
import { TestHistory } from './test-history.entity';
import { UserInventory } from './user-inventory.entity';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';

export const ENTITY_LIST = [
  Vocabulary,
  Category,
  LearningLog,
  User,
  UserInventory,
  Attendance,
  ChatMessage,
  Item,
  TestHistory,
];
