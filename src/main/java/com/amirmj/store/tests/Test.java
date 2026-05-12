package com.amirmj.store.tests;

import com.amirmj.store.repositories.CartRepository;
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
