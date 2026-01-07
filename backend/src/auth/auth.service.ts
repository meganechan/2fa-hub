import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { authenticator } from 'otplib';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        is2FAEnabled: user.is2FAEnabled,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // If 2FA is enabled, return a temporary token
    if (user.is2FAEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user._id.toString(), email: user.email, temp: true },
        { expiresIn: '5m' },
      );

      return {
        token: tempToken,
        requires2FA: true,
        user: {
          id: user._id.toString(),
          email: user.email,
        },
      };
    }

    // If 2FA is not enabled, return full access token
    const accessToken = this.jwtService.sign(
      { sub: user._id.toString(), email: user.email },
    );

    return {
      token: accessToken,
      requires2FA: false,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    };
  }

  async verifyOtp(userId: string, dto: VerifyOtpDto) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.is2FAEnabled) {
      throw new UnauthorizedException('Invalid user or 2FA not enabled');
    }

    // Check against any authenticator
    let isValid = false;
    let matchedAuthenticatorId: string | null = null;

    for (const auth of user.authenticators) {
      const secret = this.encryptionService.decrypt(auth.secret);
      if (authenticator.check(dto.otp, secret)) {
        isValid = true;
        matchedAuthenticatorId = auth.id;
        break;
      }
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Update last used time
    if (matchedAuthenticatorId) {
      await this.usersService.updateAuthenticatorLastUsed(
        userId,
        matchedAuthenticatorId,
      );
    }

    // Return full access token
    const accessToken = this.jwtService.sign(
      { sub: user._id.toString(), email: user.email },
    );

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    };
  }
}
