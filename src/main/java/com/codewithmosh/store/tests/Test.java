package com.codewithmosh.store.tests;

import com.codewithmosh.store.repositories.CartRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class Test {
    private CartRepository cartRepository;

    public void testCartApi() {
        cartRepository.findAll().forEach(System.out::println);
    }
}
