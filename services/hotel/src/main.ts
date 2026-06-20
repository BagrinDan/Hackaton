import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          error: errors
            .flatMap((validationError) =>
              Object.values(validationError.constraints ?? {}),
            )
            .join('; '),
        }),
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
