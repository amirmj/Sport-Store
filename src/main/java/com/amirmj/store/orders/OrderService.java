package com.amirmj.store.orders;

import com.amirmj.store.auth.AuthService;
import com.amirmj.store.users.User;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class OrderService {

    private final AuthService authService;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public List<OrderDto> getAllOrders() {
        User currentUser = authService.getCurrentUser();
        List<Order> orders = orderRepository.getAllByCustomer(currentUser);

        return orders.stream().map(orderMapper::toDto).toList();
    }


    public OrderDto getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        User user = authService.getCurrentUser();

        if (order == null) {
            throw new OrderNotFoundException();
        }

        if (!order.isPlacedBy(user)) {
            throw new AccessDeniedException("" +
                    "This Order Is not Belong to you !");
        }

        return orderMapper.toDto(order);
    }

}
