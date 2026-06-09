package com.back.domain.product.service;

import com.back.domain.product.dto.ProductRequest;
import com.back.domain.product.entity.Product;
import com.back.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {
    private final ProductRepository productRepository;

    // 재고에 대한 count 만들기
    public long count() {
        return productRepository.count();
    }

    // 상품 생성 - create
    public Product create(String name, String imageUrl, String description, int price, int inventory) {
        List<Product> products = productRepository.findAll();
        for(Product product : products) {
            if(product.getName().equals(name)) {
                throw new IllegalArgumentException("이미 존재하는 상품 이름입니다. : " + name);
            }
        }
        Product product = new Product(name, imageUrl, description, price, inventory);
        return productRepository.save(product);
    }

    // 다건 조회 - findALL / List
    @Transactional(readOnly = true)
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    // 단건 조회 - findById(int id)
    public Optional<Product> findById(int id) {
        return productRepository.findById(id);
    }

    // 상품 수정 - modify 전체 수정이 아닌 product 하나를 수정
    public void modify(Product product, String name, String imageUrl, String description, int price, int inventory) {
        product.modify(name, imageUrl, description, price, inventory);
    }

    public void modifyItemImageUrlOnly(int id, ProductRequest.ProductImageUrlModifyReqBody req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다. ID :" + id));
        product.modifyImageUrl(req.imageUrl());
    }

    // 상품 삭제 - delete 전체 삭제가 아닌 product 하나를 삭제
    public void delete(Product product) {
        productRepository.delete(product);
    }

}
