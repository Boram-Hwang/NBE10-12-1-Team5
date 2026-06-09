package com.back.domain.product.controller;

import com.back.domain.product.dto.ProductRequest;
import com.back.domain.product.dto.ProductResponse;
import com.back.domain.product.entity.Product;
import com.back.domain.product.service.ProductService;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/Product")
@RequiredArgsConstructor
@Tag(name = "ProductController", description = "API 상품 컨트롤러")
public class ProductController {
    private final ProductService productService;

    // 상품 다건 조회 - 상품 목록
    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "상품 다건 조회")
    public List<ProductResponse> getProduct() {
        List<Product> products = productService.findAll();

        return products
                .stream()
                .map(ProductResponse::new)
                .toList();
    }

    // 상품 단건 조회 - 상품 상세 보기
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    @Operation(summary = "상품 단건 조회")
    public ProductResponse getProduct(@PathVariable int id) {
        Product product = productService.findById(id).get();

        return new ProductResponse(product);
    }


    // 상품 추가
    @PostMapping
    @Transactional
    @Operation(summary = "상품 추가")
    public RsData<ProductResponse> createProduct(
            @RequestBody @Valid ProductRequest.ProductAddReqBody req
            ) {
        Product product = productService.create(req.name(), req.imageUrl(), req.description(), req.price(), req.inventory());

        return new RsData<>(
                "201-1",
                "%d번 상품이 등록되었습니다.".formatted(product.getId()),
                new ProductResponse(product)
        );
    }
    // 상품 삭제
    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "상품 삭제")
    public RsData<Void> deleteProduct(@PathVariable int id) {
        Product product = productService.findById(id).get();

        productService.delete(product);

        return new RsData<>(
            "200-1",
                "%d번 상품이 삭제되었습니다.".formatted(product.getId())
        );
    }

    // 상품 수정
    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "상품 수정")
    public RsData<Void> modify(
            @PathVariable int id,
            @RequestBody @Valid ProductRequest.ProductModifyReqBody req
    ) {
        Product product = productService.findById(id).get();

        productService.modify(product, req.name(), req.imageUrl(), req.description(), req.price(), req.inventory());

        return new RsData<>(
          "200-1",
          "%d번 상품이 수정되었습니다.".formatted(product.getId())
        );
    }

    // 상품 이미지 수정
    @PutMapping("/{id}/imageUrl")
    @Transactional
    @Operation(summary = "상품 이미지 수정")
    public RsData<Void> modifyImageUrl(
            @PathVariable int id,
            @RequestBody @Valid ProductRequest.ProductImageUrlModifyReqBody reqMod){

        productService.modifyItemImageUrlOnly(id, reqMod);

        return new RsData<>(
                "200-1",
                "%d번 상품 이미지가 수정되었습니다.".formatted(id)
        );
    }
}
