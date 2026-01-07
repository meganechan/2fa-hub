import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { EncryptionService } from '../common/encryption.service';
import { ImportServiceDto } from './dto/import-service.dto';

@Injectable()
export class TotpService {
  constructor(
    private usersService: UsersService,
    private encryptionService: EncryptionService,
  ) {}

  // Import a service from external source (user provides secret)
  async importService(userId: string, dto: ImportServiceDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if service with same name already exists
    const existingService = user.authenticators.find(
      (auth) => auth.name === dto.serviceName,
    );
    if (existingService) {
      throw new ConflictException('Service with this name already exists');
    }

    // Normalize secret (remove spaces and convert to uppercase)
    const normalizedSecret = dto.secret.replace(/\s/g, '').toUpperCase();

    // Encrypt and store the secret
    const encryptedSecret = this.encryptionService.encrypt(normalizedSecret);
    const serviceId = uuidv4();

    await this.usersService.addAuthenticator(userId, {
      id: serviceId,
      name: dto.serviceName,
      secret: encryptedSecret,
      issuer: dto.issuer,
      accountName: dto.accountName,
    });

    return {
      message: 'Service added successfully',
      service: {
        id: serviceId,
        name: dto.serviceName,
        issuer: dto.issuer,
        accountName: dto.accountName,
        createdAt: new Date(),
      },
    };
  }

  // Get all services with current OTP codes
  async getServicesWithOTP(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = 30 - (now % 30);

    const services = user.authenticators.map((auth) => {
      const secret = this.encryptionService.decrypt(auth.secret);
      const otp = authenticator.generate(secret);

      return {
        id: auth.id,
        name: auth.name,
        issuer: auth.issuer,
        accountName: auth.accountName,
        otp,
        createdAt: auth.createdAt,
        lastUsedAt: auth.lastUsedAt,
      };
    });

    return {
      services,
      timeRemaining,
      period: 30,
    };
  }

  // Remove a service
  async removeService(userId: string, serviceId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const service = user.authenticators.find((auth) => auth.id === serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.usersService.removeAuthenticator(userId, serviceId);

    return {
      message: 'Service removed successfully',
    };
  }

  // Get OTP for a specific service
  async getOTPForService(userId: string, serviceId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const service = user.authenticators.find((auth) => auth.id === serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const secret = this.encryptionService.decrypt(service.secret);
    const otp = authenticator.generate(secret);
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = 30 - (now % 30);

    // Update last used time
    await this.usersService.updateAuthenticatorLastUsed(userId, serviceId);

    return {
      otp,
      timeRemaining,
      period: 30,
    };
  }
}
