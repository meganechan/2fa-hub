import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class EnableDto {
  @IsNotEmpty()
  @IsString()
  secret: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  otp: string;

  @IsNotEmpty()
  @IsString()
  deviceName: string;
}
