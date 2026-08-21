import { IsNotEmpty, IsString } from 'class-validator';

export class SearchMoviesDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}