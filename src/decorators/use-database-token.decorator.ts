import { SetMetadata } from '@nestjs/common';

export const USE_DATABASE_TOKEN_KEY = 'useDatabaseToken';
export const UseDatabaseToken = () => SetMetadata(USE_DATABASE_TOKEN_KEY, true); 