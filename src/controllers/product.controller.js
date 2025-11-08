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
      name: normalizedName
    }
  });
  if (existingProduct) {
    const updatedProduct = await prisma.product.update({
      data: {
        stock: stock + existingProduct.stock,
      },
      where: {
        id: existingProduct.id,
      }
    });
    return res.status(201).json(
      new ApiResponse(201, updatedProduct.stock, "Product already exists, Stock increased")
    )
  }

  const newProduct = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      category,
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

export { registerProduct, getProducts };
