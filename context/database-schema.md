# Database Schema (MongoDB)

## User Collection

### Schema Definition

```typescript
{
  _id: ObjectId;

  // Authentication
  email: string;              // Unique, indexed
  passwordHash: string;       // Bcrypt hash
  is2FAEnabled: boolean;      // Default: false

  // TOTP Authenticators
  authenticators: Array<{
    id: string;               // UUID
    name: string;             // e.g., "iPhone 15", "iPad"
    secret: string;           // Encrypted TOTP secret
    createdAt: Date;
    lastUsedAt: Date | null;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes

```javascript
{
  email: 1,          // Unique index
  createdAt: -1      // For sorting
}
```

### Mongoose Model

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class Authenticator {
  id: string;
  name: string;
  secret: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

@Schema({ timestamps: true })
export class User {
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
```

### Sample Document

```json
{
  "_id": "67890abcdef1234567890ab",
  "email": "user@example.com",
  "passwordHash": "$2b$10$...",
  "is2FAEnabled": true,
  "authenticators": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "iPhone 15",
      "secret": "encrypted_secret_here",
      "createdAt": "2025-01-06T10:00:00.000Z",
      "lastUsedAt": "2025-01-06T12:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "iPad Pro",
      "secret": "encrypted_secret_here",
      "createdAt": "2025-01-05T15:00:00.000Z",
      "lastUsedAt": "2025-01-05T16:00:00.000Z"
    }
  ],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-06T12:30:00.000Z"
}
```

### Security Notes

1. **Password Hashing**: Use bcrypt with salt rounds >= 10
2. **Secret Encryption**: TOTP secrets MUST be encrypted before storing
   - Use AES-256-GCM encryption
   - Encryption key from environment variable
3. **Email Validation**: Validate email format before storing
4. **Unique Constraint**: Email must be unique (enforced by index)

### Operations Reference

#### Create User
```typescript
const user = new UserModel({
  email: 'user@example.com',
  passwordHash: bcrypt.hash('password', 10),
  is2FAEnabled: false,
  authenticators: []
});
await user.save();
```

#### Find User by Email
```typescript
const user = await UserModel.findOne({ email: 'user@example.com' });
```

#### Add Authenticator
```typescript
user.authenticators.push({
  id: uuidv4(),
  name: 'iPhone 15',
  secret: encryptedSecret,
  createdAt: new Date(),
  lastUsedAt: null
});
user.is2FAEnabled = true;
await user.save();
```

#### Remove Authenticator
```typescript
user.authenticators = user.authenticators.filter(
  auth => auth.id !== deviceId
);
if (user.authenticators.length === 0) {
  user.is2FAEnabled = false;
}
await user.save();
```
