import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { User } from "./models/User.js";
import { Member } from "./models/Member.js";
import { Event } from "./models/Event.js";
import { Payment } from "./models/Payment.js";
import { Attendance } from "./models/Attendance.js";
import { Notification } from "./models/Notification.js";
import { ContentItem } from "./models/ContentItem.js";
import { OrganizationItem } from "./models/OrganizationItem.js";
import { MEMBER_STATUSES, ROLES, VOICE_PARTS } from "./constants/index.js";
import { generateChoirId } from "./utils/idGenerator.js";
import { generateReceiptNumber } from "./services/paymentService.js";

const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@voiceoflight.org";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "AdminPass123!";
const memberEmail = process.env.SEED_MEMBER_EMAIL || "member@voiceoflight.org";
const memberPassword = process.env.SEED_MEMBER_PASSWORD || "MemberPass123!";

const log = (message) => process.stdout.write(`${message}\n`);

const resetCollections = async () => {
  await Promise.all([
    User.deleteMany({}),
    Member.deleteMany({}),
    Event.deleteMany({}),
    Payment.deleteMany({}),
    Attendance.deleteMany({}),
    Notification.deleteMany({}),
    ContentItem.deleteMany({}),
    OrganizationItem.deleteMany({})
  ]);
};

const createUser = async ({ email, password, role, status, lastLoginAt }) => {
  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  return User.create({
    email,
    passwordHash,
    role,
    status,
    lastLoginAt
  });
};

const createMember = async (user, data) => {
  const member = await Member.create({
    user: user._id,
    email: user.email,
    monthlyDue: env.monthlyDue,
    ...data
  });

  user.member = member._id;
  await user.save();
  return member;
};

const seedDatabase = async () => {
  if (env.nodeEnv === "production") {
    throw new Error("Refusing to run the seed script while NODE_ENV=production");
  }

  await connectDB();
  log("Seeding local development database...");

  await resetCollections();
  log("Cleared existing local records");

  const adminUser = await createUser({
    email: adminEmail,
    password: adminPassword,
    role: ROLES.ADMIN,
    status: MEMBER_STATUSES.APPROVED,
    lastLoginAt: new Date()
  });

  const adminMember = await createMember(adminUser, {
    fullName: "Voice of Light Administrator",
    gender: "Prefer not to say",
    phone: "+234 800 000 1000",
    address: env.organizationLocation || "Church Office",
    occupation: "Choir Administrator",
    voicePart: "Bass",
    status: MEMBER_STATUSES.APPROVED,
    choirId: generateChoirId(),
    dateJoinedChoir: new Date("2021-01-10"),
    idCard: {
      issuedAt: new Date("2021-01-10"),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      signatureLabel: "Choir Secretary"
    }
  });

  const approvedUser = await createUser({
    email: memberEmail,
    password: memberPassword,
    role: ROLES.MEMBER,
    status: MEMBER_STATUSES.APPROVED,
    lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  });

  const approvedMember = await createMember(approvedUser, {
    fullName: "Chidinma Okafor",
    gender: "Female",
    phone: "+234 801 234 5678",
    address: "Ikoyi, Lagos",
    occupation: "Music Teacher",
    voicePart: "Soprano",
    dob: new Date("1992-05-15"),
    instrument: "Piano",
    baptized: true,
    confirmed: true,
    dateJoinedChurch: new Date("2020-01-10"),
    dateJoinedChoir: new Date("2021-06-15"),
    status: MEMBER_STATUSES.APPROVED,
    choirId: generateChoirId(),
    idCard: {
      issuedAt: new Date("2021-06-15"),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      signatureLabel: "Choir Secretary"
    }
  });

  const pendingUser = await createUser({
    email: process.env.SEED_PENDING_EMAIL || "pending@voiceoflight.org",
    password: process.env.SEED_PENDING_PASSWORD || "PendingPass123!",
    role: ROLES.MEMBER,
    status: MEMBER_STATUSES.PENDING
  });

  await createMember(pendingUser, {
    fullName: "Tosin Adeyemi",
    gender: "Male",
    phone: "+234 802 987 6543",
    address: "Yaba, Lagos",
    voicePart: "Tenor",
    status: MEMBER_STATUSES.PENDING
  });

  const members = [adminMember, approvedMember];
  const seedMembers = [
    ["Maryam Bello", "Female", "Alto", "+234 803 111 2201"],
    ["Peter Ibe", "Male", "Tenor", "+234 803 111 2202"],
    ["Grace Nwosu", "Female", "Soprano", "+234 803 111 2203"],
    ["Kwame Mensah", "Male", "Bass", "+234 803 111 2204"],
    ["Amina Hassan", "Female", "Alto", "+234 803 111 2205"],
    ["David Green", "Male", "Bass", "+234 803 111 2206"],
    ["Rebecca Taylor", "Female", "Soprano", "+234 803 111 2207"],
    ["Michael Charles", "Male", "Tenor", "+234 803 111 2208"]
  ];

  for (let i = 0; i < seedMembers.length; i += 1) {
    const [fullName, gender, voicePart, phone] = seedMembers[i];
    const user = await createUser({
      email: `${fullName.toLowerCase().replace(/\s+/g, ".")}@voiceoflight.org`,
      password: process.env.SEED_MEMBER_DEFAULT_PASSWORD || "MemberPass123!",
      role: ROLES.MEMBER,
      status: MEMBER_STATUSES.APPROVED
    });

    const member = await createMember(user, {
      fullName,
      gender,
      phone,
      address: "Lagos, Nigeria",
      voicePart: VOICE_PARTS.includes(voicePart) ? voicePart : VOICE_PARTS[i % VOICE_PARTS.length],
      status: MEMBER_STATUSES.APPROVED,
      choirId: generateChoirId(),
      dateJoinedChoir: new Date(2022, i % 12, 10),
      idCard: {
        issuedAt: new Date(2022, i % 12, 10),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        signatureLabel: "Choir Secretary"
      }
    });

    members.push(member);
  }

  const now = new Date();
  const events = await Event.insertMany([
    {
      title: "Sunday Thanksgiving Service",
      slug: "sunday-thanksgiving-service",
      category: "service",
      description: "Choir ministration during the Sunday thanksgiving service.",
      location: "Main Church Auditorium",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 9, 0),
      attendanceCode: "SUN001",
      visibility: "public",
      status: "published",
      createdBy: adminUser._id
    },
    {
      title: "Choir Rehearsal",
      slug: "choir-rehearsal",
      category: "rehearsal",
      description: "Weekly rehearsal for upcoming services and concerts.",
      location: "Choir Room",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 18, 0),
      attendanceCode: "REH001",
      visibility: "members",
      status: "published",
      createdBy: adminUser._id
    },
    {
      title: "Annual Worship Concert",
      slug: "annual-worship-concert",
      category: "concert",
      description: "A public worship concert featuring the full chorale.",
      location: "City Auditorium",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30, 17, 0),
      visibility: "public",
      status: "published",
      createdBy: adminUser._id
    }
  ]);

  for (let i = 0; i < 6; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const paid = i < 3;
    await Payment.create({
      member: approvedMember._id,
      amount: env.monthlyDue,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      status: paid ? "paid" : "pending",
      method: "transfer",
      receiptNumber: paid ? generateReceiptNumber() : undefined,
      paidAt: paid ? new Date(date.getFullYear(), date.getMonth(), 5) : undefined,
      recordedBy: adminUser._id
    });
  }

  const attendanceRecords = [];
  for (let eventIdx = 0; eventIdx < events.length; eventIdx += 1) {
    for (let memberIdx = 0; memberIdx < members.length; memberIdx += 1) {
      const statusCycle = ["present", "present", "present", "late", "excused"];
      const status = statusCycle[(eventIdx + memberIdx) % statusCycle.length];
      attendanceRecords.push({
        member: members[memberIdx]._id,
        event: events[eventIdx]._id,
        mode: "qr",
        status,
        checkedInAt: new Date(Date.now() - eventIdx * 7 * 24 * 60 * 60 * 1000),
        minutesLate: status === "late" ? 12 : 0,
        recordedBy: adminUser._id
      });
    }
  }

  await Attendance.insertMany(attendanceRecords);

  await Notification.insertMany([
    {
      recipient: approvedUser._id,
      audience: "single",
      title: "Welcome to Voice of Light",
      message: "Your member portal is ready. You can manage your profile, attendance, dues, and digital ID card.",
      type: "system"
    },
    {
      recipient: approvedUser._id,
      audience: "single",
      title: "Dues Reminder",
      message: "Your current dues balance is available on the payments page.",
      type: "payment",
      actionUrl: "/member/payments"
    }
  ]);

  await OrganizationItem.insertMany([
    {
      type: "executive",
      name: "Ezinne Umeh",
      position: "Choir Director",
      summary: "Coordinates rehearsals, repertoire planning, and performance standards.",
      order: 1,
      active: true
    },
    {
      type: "executive",
      name: "Samuel Adebayo",
      position: "Choir Secretary",
      summary: "Maintains member records, attendance documentation, and communications.",
      order: 2,
      active: true
    },
    {
      type: "executive",
      name: "Ifeoma Daniel",
      position: "Welfare Lead",
      summary: "Supports member care, follow-up, and welfare coordination.",
      order: 3,
      active: true
    }
  ]);

  await ContentItem.insertMany([
    {
      title: "Easter Worship Concert Highlights",
      slug: "easter-worship-concert-highlights",
      type: "gallery-image",
      summary: "Selected highlights from the Easter worship concert.",
      body: "The chorale led the congregation through a reflective Easter worship program.",
      visibility: "public",
      published: true,
      publishedAt: new Date(),
      createdBy: adminUser._id
    },
    {
      title: "Preparing for a Strong Choir Season",
      slug: "preparing-for-a-strong-choir-season",
      type: "blog",
      summary: "A short note on rehearsal discipline, worship focus, and member preparation.",
      body: "A strong choir season begins with consistent attendance, personal practice, and a shared commitment to serve with excellence.",
      visibility: "public",
      published: true,
      publishedAt: new Date(),
      createdBy: adminUser._id
    },
    {
      title: "Rehearsal Schedule Updated",
      slug: "rehearsal-schedule-updated",
      type: "announcement",
      summary: "Weekly rehearsals now begin at 6:00 PM unless otherwise announced.",
      body: "Members should arrive early enough to settle in and warm up before sectional work begins.",
      visibility: "members",
      published: true,
      publishedAt: new Date(),
      createdBy: adminUser._id
    }
  ]);

  log("Seed completed successfully");
  log("Local admin account:");
  log(`  ${adminEmail} / ${adminPassword}`);
  log("Local member account:");
  log(`  ${memberEmail} / ${memberPassword}`);

  await mongoose.connection.close();
  process.exit(0);
};

seedDatabase().catch(async (error) => {
  process.stderr.write(`Seeding failed: ${error.message}\n`);
  await mongoose.connection.close();
  process.exit(1);
});
