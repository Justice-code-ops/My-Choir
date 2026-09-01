import { ContentItem } from "../models/ContentItem.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/pagination.js";
import { parseBoolean, slugify } from "../utils/formatters.js";
import { recordAudit } from "../services/auditService.js";

const blogFields = ["title", "summary", "body", "category", "tags", "visibility", "published"];

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
};

const buildUniqueSlug = async (title, excludedId) => {
  const baseSlug = slugify(title);
  if (!baseSlug) {
    throw new ApiError(400, "A valid title is required");
  }

  let slug = baseSlug;
  let counter = 2;

  while (
    await ContentItem.exists({
      type: "blog",
      slug,
      ...(excludedId ? { _id: { $ne: excludedId } } : {})
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

const buildBlogPayload = (body) => {
  const payload = {};

  blogFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }
  });

  if (payload.title) payload.title = String(payload.title).trim();
  if (payload.summary) payload.summary = String(payload.summary).trim();
  if (payload.body) payload.body = String(payload.body).trim();
  if (payload.category) payload.category = String(payload.category).trim();
  if (Object.prototype.hasOwnProperty.call(payload, "tags")) payload.tags = normalizeTags(payload.tags);
  if (!payload.visibility) payload.visibility = "public";
  if (Object.prototype.hasOwnProperty.call(payload, "published")) payload.published = parseBoolean(payload.published);

  return payload;
};

export const listBlogPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { published, search } = req.query;
  const filter = { type: "blog" };

  if (published === "true") filter.published = true;
  if (published === "false") filter.published = false;
  if (search) filter.$text = { $search: search };

  const total = await ContentItem.countDocuments(filter);
  const posts = await ContentItem.find(filter)
    .populate("createdBy", "email role")
    .sort({ updatedAt: -1 })
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

export const createBlogPost = asyncHandler(async (req, res) => {
  const payload = buildBlogPayload(req.body);

  if (!payload.title || !payload.body) {
    throw new ApiError(400, "Title and body are required");
  }

  payload.type = "blog";
  payload.slug = await buildUniqueSlug(payload.title);
  payload.createdBy = req.user._id;
  if (payload.published !== false) {
    payload.published = true;
    payload.publishedAt = new Date();
  }

  const post = await ContentItem.create(payload);

  await recordAudit(req, "BLOG_POST_CREATED", "ContentItem", post._id, {
    title: post.title,
    published: post.published
  });

  res.status(201).json({
    success: true,
    message: "Blog post created",
    data: post
  });
});

export const updateBlogPost = asyncHandler(async (req, res) => {
  const post = await ContentItem.findOne({ _id: req.params.id, type: "blog" });
  if (!post) {
    throw new ApiError(404, "Blog post not found");
  }

  const payload = buildBlogPayload(req.body);

  if (Object.prototype.hasOwnProperty.call(payload, "title") && !payload.title) {
    throw new ApiError(400, "Title cannot be empty");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "body") && !payload.body) {
    throw new ApiError(400, "Body cannot be empty");
  }

  if (payload.title && payload.title !== post.title) {
    payload.slug = await buildUniqueSlug(payload.title, post._id);
  }

  if (payload.published === true && !post.publishedAt) {
    payload.publishedAt = new Date();
  }

  Object.assign(post, payload);
  await post.save();

  await recordAudit(req, "BLOG_POST_UPDATED", "ContentItem", post._id, {
    title: post.title,
    published: post.published
  });

  res.json({
    success: true,
    message: "Blog post updated",
    data: post
  });
});

export const deleteBlogPost = asyncHandler(async (req, res) => {
  const post = await ContentItem.findOneAndDelete({ _id: req.params.id, type: "blog" });
  if (!post) {
    throw new ApiError(404, "Blog post not found");
  }

  await recordAudit(req, "BLOG_POST_DELETED", "ContentItem", post._id, {
    title: post.title
  });

  res.json({
    success: true,
    message: "Blog post deleted"
  });
});
