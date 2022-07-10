import { model, Schema } from 'mongoose';
import { Password } from '../services/password';

export interface UserAttrs {
  email: string;
  password: string;
}

const userSchema = new Schema<UserAttrs>(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.hashPassword(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

const User = model<UserAttrs>('User', userSchema);

export { User };
