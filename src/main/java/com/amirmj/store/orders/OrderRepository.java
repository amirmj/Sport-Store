package com.amirmj.store.orders;

import com.amirmj.store.users.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = "items.product")
    @Query("select o from Order o where o.customer = :customer")
    List<Order> getAllByCustomer(@Param("customer") User customer);
}