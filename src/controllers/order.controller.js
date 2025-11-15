import { asyncHandler } from '../utils/AsyncHandler.js';
import prisma from '../database/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const createOrder = asyncHandler(async (req, res) => {
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

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  };

  const totalAmount = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${item.product.name}`)
    };
  };

  const order = await prisma.order.create({
    data: {
      userId: Number(id),
      totalAmount,
      status: 'PENDING',
    },
  });

  const orderItems = await Promise.all(
    cart.items.map((items) =>
      prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: items.productId,
          quantity: items.quantity,
          price: items.product.price,
        },
      }),
    )
  );

  await Promise.all(
    cart.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    )
  );

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return res.status(201).json(
    new ApiResponse(201, { order, orderItems }, "Order created successfully")
  );
});

const getOrders = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const userOrders = await prisma.order.findMany({
    where: {
      userId: Number(id),
    },
    include: {
      items: {
        include: {
          product: true
        },
      },
    },
  });

  if (!userOrders || userOrders.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "No orders found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, userOrders, "User orders retrieved successfully")
  )
})

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { orderId } = req.params;

  const userOrder = await prisma.order.findUnique({
    where: {
      id: Number(orderId),
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  if (!userOrder) {
    throw new ApiError(404, "Order not found");
  }

  if (userOrder.userId !== id) {
    throw new ApiError(403, "Unauthrozied request");
  }



  return res.status(200).json(
    new ApiResponse(200, userOrder, "Order retrieved successfully")
  )
})

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const options = ['PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!options.includes(status)) {
    throw new ApiError(400, "Invalid status")
  };

  const order = await prisma.order.findUnique({
    where: {
      id: Number(orderId),
    }
  });

  if (!order) {
    throw new ApiError(404, "Order not found")
  };

  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      status,
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
    new ApiResponse(200, updatedOrder, "Order status updated successfully")
  );
})


export { createOrder, getOrders, getOrderById, updateOrderStatus };

