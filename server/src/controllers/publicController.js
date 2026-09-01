import { Event } from "../models/Event.js";
import { ContentItem } from "../models/ContentItem.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { Member } from "../models/Member.js";
import { OrganizationItem } from "../models/OrganizationItem.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";
import { recordAudit } from "../services/auditService.js";
import { env } from "../config/env.js";

export const getEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { category, status } = req.query;

  const filter = { visibility: "public" };
  if (category) filter.category = category;
  if (status) filter.status = status;

  const total = await Event.countDocuments(filter);
  const events = await Event.find(filter)
    .sort({ startsAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  res.json({
    success: true,
    data: event
  });
});

export const getUpcomingEvents = asyncHandler(async (req, res) => {
  const now = new Date();
  const upcomingEvents = await Event.find({
    startsAt: { $gte: now },
    visibility: "public"
  })
    .sort({ startsAt: 1 })
    .limit(6);

  res.json({
    success: true,
    data: upcomingEvents
  });
});

export const getGallery = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const total = await ContentItem.countDocuments({
    type: { $in: ["gallery-image", "gallery-video"] },
    visibility: "public"
  });

  const items = await ContentItem.find({
    type: { $in: ["gallery-image", "gallery-video"] },
    visibility: "public"
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getBlog = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const total = await ContentItem.countDocuments({
    type: "blog",
    visibility: "public",
    published: true
  });

  const posts = await ContentItem.find({
    type: "blog",
    visibility: "public",
    published: true
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getBlogPost = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const post = await ContentItem.findOne({
    type: "blog",
    slug,
    visibility: "public",
    published: true
  });

  if (!post) {
    throw new ApiError(404, "Blog post not found");
  }

  res.json({
    success: true,
    data: post
  });
});

export const getAnnouncements = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const announcements = await ContentItem.find({
    type: "announcement",
    visibility: { $in: ["public", "members"] },
    published: true
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: announcements
  });
});

export const getExecutives = asyncHandler(async (req, res) => {
  const executives = await OrganizationItem.find({
    type: "executive",
    active: true
  }).sort({ order: 1, createdAt: 1 });

  res.json({
    success: true,
    data: executives || []
  });
});

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw new ApiError(400, "name, email, subject, and message are required");
  }

  const contact = await ContactMessage.create({
    name,
    email,
    phone,
    subject,
    message,
    status: "new"
  });

  // Record audit
  await recordAudit(req, "CONTACT_SUBMITTED", "ContactMessage", contact._id, {
    email
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully. We will get back to you soon.",
    data: contact
  });
});

export const getChurchInfo = asyncHandler(async (_req, res) => {
  const info = {
    name: env.organizationName,
    tagline: process.env.ORGANIZATION_TAGLINE || "",
    description: process.env.ORGANIZATION_DESCRIPTION || "",
    location: env.organizationLocation,
    phone: env.organizationPhone,
    email: env.organizationEmail,
    socialMedia: {
      facebook: process.env.ORGANIZATION_FACEBOOK || "",
      instagram: process.env.ORGANIZATION_INSTAGRAM || "",
      youtube: process.env.ORGANIZATION_YOUTUBE || "",
      twitter: process.env.ORGANIZATION_TWITTER || ""
    }
  };

  res.json({
    success: true,
    data: info
  });
});
