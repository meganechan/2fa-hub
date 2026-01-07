import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { TotpService } from './totp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImportServiceDto } from './dto/import-service.dto';

@Controller('totp')
@UseGuards(JwtAuthGuard)
export class TotpController {
  constructor(private totpService: TotpService) {}

  // Import a service from external source (paste secret or scan QR)
  @Post('services')
  async importService(@Request() req: any, @Body() dto: ImportServiceDto) {
    return this.totpService.importService(req.user.userId, dto);
  }

  // Get all services with current OTP codes
  @Get('services')
  async getServices(@Request() req: any) {
    return this.totpService.getServicesWithOTP(req.user.userId);
  }

  // Delete a service
  @Delete('services/:id')
  async removeService(@Request() req: any, @Param('id') serviceId: string) {
    return this.totpService.removeService(req.user.userId, serviceId);
  }

  // Get current OTP for a specific service
  @Get('services/:id/otp')
  async getOTP(@Request() req: any, @Param('id') serviceId: string) {
    return this.totpService.getOTPForService(req.user.userId, serviceId);
  }
}
