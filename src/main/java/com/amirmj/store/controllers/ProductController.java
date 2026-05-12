package com.amirmj.store.controllers;

import com.amirmj.store.entities.Product;
import com.amirmj.store.dtos.ProductDto;
import com.amirmj.store.entities.Category;
import com.amirmj.store.mappers.ProductMapper;
import com.amirmj.store.repositories.CategoryRepository;
import com.amirmj.store.repositories.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;

    @GetMapping
    public Iterable<ProductDto> getProducts(
            @RequestHeader(name = "x-api-key", required = false) String apiKey,
            @RequestParam(name = "categoryId", required = false) Byte categoryId
    ) {
        System.out.println(apiKey);

        List<Product> products;

        if (categoryId != null)
            products = productRepository.findByCategoryId(categoryId);
        else
            products = productRepository.findAllWithCategory();

        return products.stream().map(productMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        var resultProduct = productRepository.findById(id).orElse(null);
        if (resultProduct == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(productMapper.toDto(resultProduct));
    }

    @PostMapping
    public ResponseEntity<ProductDto> createProduct(
            @RequestBody ProductDto request,
            UriComponentsBuilder uriBuilder) {

        Category fetchCategory = categoryRepository.findById(request.getCategoryId()).orElse(null);
        if (fetchCategory == null)
            return ResponseEntity.notFound().build();

        Product product = productMapper.toEntity(request);
        product.setCategory(fetchCategory);
        productRepository.save(product);
        request.setId(product.getId());

        URI uri = uriBuilder.path("/products/{id}").buildAndExpand(product.getId()).toUri();

        return ResponseEntity.created(uri).body(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDto request
    ) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        productMapper.updateDto(request, product);
        product.setCategory(category);
        productRepository.save(product);
        request.setId(product.getId());

        return ResponseEntity.ok(request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable(name = "id") Long id
    ) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        productRepository.delete(product);
        return ResponseEntity.noContent().build();
    }


}
