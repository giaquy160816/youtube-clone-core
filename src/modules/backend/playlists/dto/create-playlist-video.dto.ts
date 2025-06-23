import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreatePlaylistVideoDto {
  @IsNumber()
  @IsNotEmpty()
  playlistId: number;

  @IsNumber()
  @IsNotEmpty()
  videoId: number;

  @IsOptional()
  @IsNumber()
  order?: number;
}
