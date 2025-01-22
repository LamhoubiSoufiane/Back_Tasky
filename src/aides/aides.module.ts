import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AidesController } from './aides.controller';
import { AidesService } from './aides.service';
import { Aide } from './aide/aide.entity';
import { User } from '../users/user/user';
import { Task } from '../tasks/bo/task';
import { TasksModule } from '../tasks/tasks.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Aide, User, Task]),
        TasksModule
    ],
    controllers: [AidesController],
    providers: [AidesService],
    exports: [AidesService]
})
export class AidesModule {}
