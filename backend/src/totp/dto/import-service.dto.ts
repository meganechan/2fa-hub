import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ImportServiceDto {
  @IsNotEmpty()
  @IsString()
  secret: string;

  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsString()
  accountName?: string;
}
