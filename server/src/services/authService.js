import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { MEMBER_STATUSES, ROLES } from "../constants/index.js";
import { Member } from "../models/Member.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { parseBoolean } from "../utils/formatters.js";
import { signToken } from "../utils/tokens.js";
import { storeProfilePicture } from "./uploadService.js";

export const serializeUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  status: user.status,
  member: user.member || null
});

const buildMemberPayload = async (body, file, userId) => {
  const profilePicture = await storeProfilePicture(file);
  return {
    user: userId,
    fullName: body.fullName,
    gender: body.gender,
    dob: body.dob || undefined,
    phone: body.phone,
    email: body.email,
    address: body.address,
    occupation: body.occupation,
    nextOfKin: {
      name: body.nextOfKinName,
      phone: body.nextOfKinPhone,
      relationship: body.nextOfKinRelationship
    },
    previousChoirExperience: body.previousChoirExperience,
    voicePart: body.voicePart,
    instrument: body.instrument,
    baptized: parseBoolean(body.baptized),
    confirmed: parseBoolean(body.confirmed),
    dateJoinedChurch: body.dateJoinedChurch || undefined,
    status: MEMBER_STATUSES.PENDING,
    profilePicture
  };
};

export const registerMember = async ({ body, file }) => {
  const existing = await User.findOne({ email: body.email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account already exists for this email address");

  const passwordHash = await bcrypt.hash(body.password, env.bcryptRounds);
  const user = await User.create({
    email: body.email,
    passwordHash,
    role: ROLES.MEMBER,
    status: MEMBER_STATUSES.PENDING
  });

  try {
    const member = await Member.create(await buildMemberPayload(body, file, user._id));
    user.member = member._id;
    await user.save();

    return {
      user: serializeUser(await user.populate("member")),
      member
    };
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash").populate("member");
  if (!user) throw new ApiError(401, "Invalid email or password");

  const matches = await user.comparePassword(password);
  if (!matches) throw new ApiError(401, "Invalid email or password");

  if (user.status !== MEMBER_STATUSES.APPROVED) {
    throw new ApiError(403, "Your registration must be approved before you can log in");
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    token: signToken(user),
    user: serializeUser(user)
  };
};

export const changeUserPassword = async (userId, currentPassword, nextPassword) => {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw new ApiError(404, "User not found");

  const matches = await user.comparePassword(currentPassword);
  if (!matches) throw new ApiError(401, "Current password is incorrect");

  user.passwordHash = await bcrypt.hash(nextPassword, env.bcryptRounds);
  await user.save();
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, env.bcryptRounds);
};

