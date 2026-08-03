export const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const paginatedResponse = async (model, filter, options = {}) => {
  const { page, limit, skip } = getPagination(options.query || {});
  const sort = options.sort || { createdAt: -1 };
  const populate = options.populate || [];

  const [items, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit).populate(populate),
    model.countDocuments(filter)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

