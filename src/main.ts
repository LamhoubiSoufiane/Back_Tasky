import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from "socket.io";
import { IoAdapter } from "@nestjs/platform-socket.io";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    // Utilisation de process.cwd() pour le chemin absolu
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });


    app.useWebSocketAdapter(new IoAdapter(app));


    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
