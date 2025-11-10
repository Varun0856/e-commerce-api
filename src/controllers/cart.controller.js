import { asyncHandler } from "../utils/AsyncHandler.js";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addToCart = asyncHandler(async (req, res) => {
  const { id } = req.user;

  let cart = await prisma.cart.findFirst({
    where: {
      userId: Number(id),
    },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: Number(id),
      }
    })
  };

  const { productId, quantity } = req.body;

  if (quantity <= 0) throw new ApiError(400, "Quantity must be greater than zero");

  const product = await prisma.product.findUnique({
    where: {
      id: Number(productId),
    },
  });

  if (!product || !product.isAvailable) throw new ApiError(404, "Product not found or unavailable");

  let cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: Number(cart.id),
      productId: Number(productId),
    },
  });

  if (cartItem) {
    cartItem = await prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        quantity: cartItem.quantity + (Number(quantity) || 1),
      }
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: Number(productId),
        quantity: Number(quantity) || 1,
      },
    })
  }

  const updatedCart = await prisma.cart.findFirst({
    where: {
      id: Number(cart.id),
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },

  });

  return res.status(200).json(
    new ApiResponse(200, updatedCart, "Product added to cart successfully")
  )
})

const getCart = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const cart = await prisma.cart.findFirst({
    where: {
      userId: Number(id),
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    return res.status(200).json(
      new ApiResponse(200, { items: [] }, "Cart is empty")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, cart, "Cart fetched successfully")
  );
})

const updateCartItem = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) throw new ApiError(400, "Quantity must be greater than zero");

  const product = await prisma.product.findUnique({
    where: {
      id: Number(productId),
    },
  });

  if (!product || !product.isAvailable) throw new ApiError(404, "Product not found or unavailable");

  const cart = await prisma.cart.findFirst({
    where: {
      userId: Number(id),
    },
  });

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: Number(cart.id),
      productId: Number(productId),
    },
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  }

  await prisma.cartItem.update({
    where: {
      id: Number(cartItem.id),
    },
    data: {
      quantity: Number(quantity),
    },
  });

  const updatedCart = await prisma.cart.findFirst({
    where: {
      id: Number(cart.id),
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return res.status(200).json(
    new ApiResponse(200, updatedCart, "Cart updated successfully")
  );
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { productId } = req.params;

  const cart = await prisma.cart.findFirst({
    where: {
      userId: Number(id),
    },
  });

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: Number(cart.id),
      productId: Number(productId),
    },
  });

  if (!cartItem) {
    throw new ApiError(404, "Cart item not found");
  };

  await prisma.cartItem.delete({
    where: {
      id: Number(cartItem.id),
    },
  });

  const updatedCart = await prisma.cart.findFirst({
    where: {
      id: Number(cart.id),
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  return res.status(200).json(
    new ApiResponse(200, updatedCart, "Item removed from cart successfully")
  );
})

export { addToCart, getCart, updateCartItem, removeFromCart };

