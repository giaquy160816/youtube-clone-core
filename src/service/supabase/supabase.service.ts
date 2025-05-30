import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor(private readonly configService: ConfigService) {
        this.supabase = createClient(
            this.configService.get<string>('supabase.url') || '',
            this.configService.get<string>('supabase.anonKey') || ''
        );
    }

    get supabaseClient() {
        return this.supabase;
    }
}