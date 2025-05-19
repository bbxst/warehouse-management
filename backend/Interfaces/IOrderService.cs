using backend.Models;
using backend.ViewModels;

namespace backend.Interfaces
{
    public interface IOrderService
    {
        Task<IEnumerable<Order>> GetOrders(OrderStatus? status, OrderType? type);
        Task<Order> GetOrder(string id);
        Task<Order> AddOrder(AddOrderViewModel order);
        Task<Order> UpdateOrder(UpdateOrderStatusViewModel orderStatus);
        Task<Order> UpdateMultipleOrderItems(UpdateOrderItemsViewModel updateDto);
        Task<Order> DeleteOrder(string id);
    }
}
 