import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserData {
  email: string;
  passwordHash: string;
}

export interface AuthenticatorData {
  id: string;
  name: string;
  secret: string;
  issuer?: string;
  accountName?: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: CreateUserData): Promise<User> {
    const user = new this.userModel({
      email: data.email,
      passwordHash: data.passwordHash,
      is2FAEnabled: false,
      authenticators: [],
    });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async addAuthenticator(
    userId: string,
    data: AuthenticatorData,
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $push: {
          authenticators: {
            id: data.id || uuidv4(),
            name: data.name,
            secret: data.secret,
            issuer: data.issuer,
            accountName: data.accountName,
            createdAt: new Date(),
            lastUsedAt: null,
          },
        },
      },
    );
  }

  async removeAuthenticator(userId: string, authenticatorId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) return;

    user.authenticators = user.authenticators.filter(
      (auth) => auth.id !== authenticatorId,
    );

    if (user.authenticators.length === 0) {
      user.is2FAEnabled = false;
    }

    await user.save();
  }

  async updateAuthenticatorLastUsed(
    userId: string,
    authenticatorId: string,
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId, 'authenticators.id': authenticatorId },
      { $set: { 'authenticators.$.lastUsedAt': new Date() } },
    );
  }

  async disable2FA(userId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: { is2FAEnabled: false, authenticators: [] },
      },
    );
  }
}
