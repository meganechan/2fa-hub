import { IsNotEmpty, IsString } from 'class-validator';

export class SetupDto {
  @IsNotEmpty()
  @IsString()
  deviceName: string;
}
