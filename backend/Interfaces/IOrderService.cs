﻿using backend.Models;
using backend.ViewModels;

namespace backend.Interfaces
{
    public interface IOrderService
    {
        Task<IEnumerable<OrderViewModel>> GetOrders(OrderStatus? status, OrderType? type);
        Task<OrderDetail?> GetOrder(string id);
        Task<string?> AddOrder(AddOrderDto order);
        Task<string> UpdateOrder(UpdateOrderStatus orderStatus);
        Task<string> UpdateMultipleOrderItems(UpdateMultipleOrderItemsDto updateDto);
        Task<string> DeleteOrder(string id);
    }
}
 