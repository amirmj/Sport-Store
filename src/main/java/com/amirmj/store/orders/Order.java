package com.amirmj.store.orders;

import com.amirmj.store.carts.Cart;
import com.amirmj.store.users.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OrderStatus status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @OneToMany(mappedBy = "order", cascade = CascadeType.PERSIST)
    @Builder.Default
    private Set<OrderItem> items = new LinkedHashSet<>();

    public static Order fromCart(Cart cart, User cuurentUser) {

        Order order = Order.builder()
                .customer(cuurentUser)
                .totalPrice(cart.getTotalPrice())
                .status(OrderStatus.PENDING)
                .build();

        cart.getItems().forEach(
                item -> {
                    var orderItem = new OrderItem(order, item.getProduct(), item.getQuantity());
                    order.items.add(orderItem);
                }
        );

        return order;
    }

    public boolean isPlacedBy(User user) {
        return customer.equals(user);
    }

}