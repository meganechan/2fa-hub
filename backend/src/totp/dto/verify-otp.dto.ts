import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  otp: string;
}
