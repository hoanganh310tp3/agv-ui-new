import { CreateOrderDto, Order } from "@/types/Order.types";
import axiosCustomize from "@/utils/axiosCustomize";
import api from "@/utils/axiosCustomize";

const ORDERS_URL = "orders/";

const getOrders = async (): Promise<Order[]> => {
  try {
    const { data } = await api.get(ORDERS_URL);
    return data;
  } catch (error) {
    console.error(">>> Error fetching orders:", error);
    throw new Error(">>> Failed to fetch orders");
  }
};

const createOrder = async (order: CreateOrderDto): Promise<Order> => {
  try {
    const { data } = await api.post(ORDERS_URL, order);
    return data;
  } catch (error) {
    console.error(">>> Error creating order:", error);
    throw new Error(">>> Failed to create order");
  }
};

const updateOrder = async (
  order_id: number,
  order: CreateOrderDto,
): Promise<Order> => {
  try {
    const { data } = await api.put(`${ORDERS_URL}${request_id}/`, order); // ORDERS_URL already had a slash at the end
    return data;
  } catch (error) {
    console.error(">>> Error updating order:", error);
    throw new Error(">>> Failed to update order");
  }
};

const deleteOrder = async (request_id: number) => {
  try {
    // Sử dụng endpoint orders/ với query param request_id
    const { data } = await axiosCustomize.delete(`${ORDERS_URL}${request_id}/`); 
    return data;
  } catch (error) {
    console.error("Error in deleteOrder API call:", error);
    throw error;
  }
};

const createMultipleOrdersBatch = async (
  orders: CreateOrderDto[],
): Promise<Order[]> => {
  try {
    const { data } = await api.post(ORDERS_URL, orders);
    return data; // Assumes the backend responds with an array of created orders
  } catch (error) {
    console.error(">>> Error creating multiple orders:", error);
    throw new Error(">>> Failed to create multiple orders");
  }
};

export {
  createMultipleOrdersBatch,
  createOrder,
  deleteOrder,
  getOrders,
  updateOrder,
};
