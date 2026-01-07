import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DisableDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  otp: string;
}
