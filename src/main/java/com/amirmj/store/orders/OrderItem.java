package com.amirmj.store.orders;

import com.amirmj.store.products.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @ToString.Exclude
    private Order order;


    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;


    @Column(name = "unite_price")
    private BigDecimal unitePrice;


    @Column(name = "quantity")
    private Integer quantity;


    @Column(name = "total_price")
    private BigDecimal totalPrice;

    public OrderItem(Order order, Product product, Integer quantity) {
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.unitePrice = product.getPrice();
        this.totalPrice = unitePrice.multiply(BigDecimal.valueOf(quantity));
    }
}