import prisma from "../database/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const registerProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  if ([name, description, price, stock, category].some((fields) => {
    return !fields || (typeof fields === 'string' && fields?.trim() === "");
  })) {
    throw new ApiError(400, "The required fields must be filled");
  }

  const normalizedName = name.trim().toLowerCase();
  const existingProduct = await prisma.product.findFirst({
    where: {
      name: {
        equals: normalizedName,
        mode: "insensitive",
      }
    }
  });
  if (existingProduct) {
    throw new ApiError(409, "A product with that name already exists");
  }

  const newProduct = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description.trim(),
      price,
      stock,
      category: category.trim()
    }
  });

  return res.status(201).json(
    new ApiResponse(201, newProduct, "Product registered successfully")
  );
})

const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const take = limitNumber
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
    },
    skip,
    take
  });
  if (products.length === 0) {
    throw new ApiError(404, "No products found");
  }
  return res.status(200).json(
    new ApiResponse(200, products, "Products fetched successfully")
  );

})

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findFirst({
    where: {
      id: Number(id),
    }
  });

  if (!product || !product.isAvailable) {
    throw new ApiError(404, "No product found");
  }

  return res.status(200).json(
    new ApiResponse(200, product, "Product fetched successfully")
  )
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category, isAvailable } = req.body;
  const updatedProduct = await prisma.product.update({
    data: {
      ...(name && { name: name.trim() }),
      ...(description && { description: description.trim() }),
      price: price,
      stock,
      ...(category && { category: category.trim() }),
      isAvailable,
    },
    where: {
      id: Number(id),
    },
  });

  return res.status(200).json(
    new ApiResponse(200, updatedProduct, "Product updated successfully")
  );
})


export { registerProduct, getProducts, getProductById, updateProduct };
