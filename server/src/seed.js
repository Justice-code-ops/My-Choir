import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { User } from "./models/User.js";
import { Member } from "./models/Member.js";
import { Event } from "./models/Event.js";
import { Payment } from "./models/Payment.js";
import { Attendance } from "./models/Attendance.js";
import { Notification } from "./models/Notification.js";
import { ContentItem } from "./models/ContentItem.js";
import { MEMBER_STATUSES, ROLES, VOICE_PARTS } from "./constants/index.js";
import bcrypt from "bcryptjs";
import { generateChoirId } from "./utils/idGenerator.js";

const seedDatabase = async () => {
  await connectDB();

  console.log("🌱 Seeding database...");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Member.deleteMany({}),
    Event.deleteMany({}),
    Payment.deleteMany({}),
    Attendance.deleteMany({}),
    Notification.deleteMany({}),
    ContentItem.deleteMany({})
  ]);

  console.log("🧹 Cleared existing data");

  // Create admin user
  const adminPasswordHash = await bcrypt.hash("AdminPass123!", env.bcryptRounds);
  const adminUser = await User.create({
    email: "admin@voiceoflight.local",
    passwordHash: adminPasswordHash,
    role: ROLES.ADMIN,
    status: MEMBER_STATUSES.APPROVED,
    lastLoginAt: new Date()
  });

  // Create a member profile for admin (optional)
  const adminMember = await Member.create({
    user: adminUser._id,
    fullName: "Admin User",
    email: "admin@voiceoflight.local",
    gender: "Prefer not to say",
    phone: "+234 XXX XXX XXXX",
    address: "Church Office",
    voicePart: "Bass",
    status: MEMBER_STATUSES.APPROVED,
    choirId: generateChoirId()
  });

  adminUser.member = adminMember._id;
  await adminUser.save();

  console.log("✅ Created admin user");

  // Create test member (approved)
  const memberPasswordHash = await bcrypt.hash("MemberPass123!", env.bcryptRounds);
  const memberUser = await User.create({
    email: "member@voiceoflight.local",
    passwordHash: memberPasswordHash,
    role: ROLES.MEMBER,
    status: MEMBER_STATUSES.APPROVED,
    lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  });

  const memberProfile = await Member.create({
    user: memberUser._id,
    fullName: "John Doe",
    email: "member@voiceoflight.local",
    gender: "Male",
    phone: "+234 801 234 5678",
    address: "123 Church Street, Lagos",
    occupation: "Software Engineer",
    voicePart: "Tenor",
    dob: new Date("1990-05-15"),
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

  memberUser.member = memberProfile._id;
  await memberUser.save();

  console.log("✅ Created test member");

  // Create pending registration
  const pendingPasswordHash = await bcrypt.hash("PendingPass123!", env.bcryptRounds);
  const pendingUser = await User.create({
    email: "pending@voiceoflight.local",
    passwordHash: pendingPasswordHash,
    role: ROLES.MEMBER,
    status: MEMBER_STATUSES.PENDING
  });

  const pendingMember = await Member.create({
    user: pendingUser._id,
    fullName: "Jane Smith",
    email: "pending@voiceoflight.local",
    gender: "Female",
    phone: "+234 802 987 6543",
    address: "456 Hope Avenue, Lagos",
    voicePart: "Soprano",
    status: MEMBER_STATUSES.PENDING
  });

  pendingUser.member = pendingMember._id;
  await pendingUser.save();

  console.log("✅ Created pending member");

  // Create more approved members for demo
  const voiceParts = VOICE_PARTS;
  const names = [
    "Mary Johnson",
    "Peter Williams",
    "Grace Brown",
    "Kwame Asante",
    "Amina Hassan",
    "David Green",
    "Rebecca Taylor",
    "Michael Charles"
  ];

  const createdMembers = [memberProfile];

  for (let i = 0; i < names.length; i++) {
    const passwordHash = await bcrypt.hash("Demo123!@#", env.bcryptRounds);
    const user = await User.create({
      email: `${names[i].toLowerCase().replace(/\s+/g, ".")}@voiceoflight.local`,
      passwordHash,
      role: ROLES.MEMBER,
      status: MEMBER_STATUSES.APPROVED
    });

    const member = await Member.create({
      user: user._id,
      fullName: names[i],
      email: user.email,
      gender: Math.random() > 0.5 ? "Male" : "Female",
      phone: `+234 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      address: "Lagos, Nigeria",
      voicePart: voiceParts[i % voiceParts.length],
      status: MEMBER_STATUSES.APPROVED,
      choirId: generateChoirId(),
      dateJoinedChoir: new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000),
      idCard: {
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

    user.member = member._id;
    await user.save();
    createdMembers.push(member);
  }

  console.log(`✅ Created ${names.length} additional members`);

  // Create events
  const events = [
    {
      title: "Sunday Service",
      slug: "sunday-service",
      category: "service",
      description: "Weekly choir performance during Sunday service",
      location: "Main Church Hall",
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      attendanceCode: "SUN001",
      visibility: "public",
      status: "published"
    },
    {
      title: "Choir Rehearsal",
      slug: "choir-rehearsal",
      category: "rehearsal",
      description: "Weekly practice session",
      location: "Choir Room",
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      attendanceCode: "REH001",
      visibility: "members",
      status: "published"
    },
    {
      title: "Annual Concert",
      slug: "annual-concert",
      category: "concert",
      description: "Voice of Light Chorale Annual Concert",
      location: "Auditorium",
      startsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      visibility: "public",
      status: "published"
    }
  ];

  const createdEvents = await Event.insertMany(events);
  console.log("✅ Created events");

  // Create payments for the main member
  const currentDate = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    await Payment.create({
      member: memberProfile._id,
      amount: 500,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      status: i < 3 ? "paid" : "pending",
      method: "transfer",
      receiptNumber: `RCP-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(memberProfile._id).slice(-4)}`,
      paidAt: i < 3 ? new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000) : null
    });
  }

  console.log("✅ Created payment records");

  // Create attendance records - distribute across members and events
  const attendanceRecords = [];
  for (let eventIdx = 0; eventIdx < createdEvents.length; eventIdx++) {
    for (let memberIdx = 0; memberIdx < createdMembers.length; memberIdx++) {
      const date = new Date(Date.now() - eventIdx * 7 * 24 * 60 * 60 * 1000);
      const status = Math.random() > 0.2 ? "present" : Math.random() > 0.5 ? "late" : "absent";

      attendanceRecords.push({
        member: createdMembers[memberIdx]._id,
        event: createdEvents[eventIdx]._id,
        mode: "qr",
        status,
        checkedInAt: date,
        minutesLate: status === "late" ? Math.floor(Math.random() * 20) + 5 : 0,
        recordedBy: adminUser._id
      });
    }
  }

  await Attendance.insertMany(attendanceRecords);
  console.log("✅ Created attendance records");

  // Create notifications
  await Notification.insertMany([
    {
      recipient: memberUser._id,
      audience: "single",
      title: "Welcome to Voice of Light",
      message: "Welcome to our choir management system. Explore your profile, payment history, and more.",
      type: "system"
    },
    {
      recipient: memberUser._id,
      audience: "single",
      title: "Payment Reminder",
      message: "Your monthly dues for August 2024 are due. Please make payment before the end of the month.",
      type: "payment"
    }
  ]);

  console.log("✅ Created notifications");

  // Create sample content
  await ContentItem.insertMany([
    {
      title: "Gallery - Easter Concert 2024",
      slug: "gallery-easter-concert",
      type: "gallery-image",
      description: "Photos from our Easter concert",
      content: "URL or base64 image data",
      visibility: "public"
    },
    {
      title: "Latest Choir News",
      slug: "latest-choir-news",
      type: "blog",
      description: "Updates and news from the choir",
      content: "## Welcome to the Choir Blog, We're excited to share updates and stories...",
      visibility: "public"
    }
  ]);

  console.log("✅ Created content items");

  console.log("✨ Database seeding completed successfully!");
  console.log("🔐 Demo Login Credentials:");
  console.log("   Admin: admin@voiceoflight.local / AdminPass123!");
  console.log("   Member: member@voiceoflight.local / MemberPass123!");

  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
