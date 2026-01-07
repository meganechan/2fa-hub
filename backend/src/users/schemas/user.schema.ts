import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class Authenticator {
  id: string;
  name: string;
  secret: string;
  issuer?: string;
  accountName?: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: false })
  is2FAEnabled: boolean;

  @Prop({ type: [Object], default: [] })
  authenticators: Authenticator[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
