package com.back.domain.items.controller;

import com.back.domain.items.dto.ItemsRequest;
import com.back.domain.items.dto.ItemsResponse;
import com.back.domain.items.entity.Items;
import com.back.domain.items.service.ItemsService;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Tag(name = "ItemsController", description = "API 상품 컨트롤러")
public class ItemsController {
    private final ItemsService itemsService;

    // 상품 다건 조회 - 상품 목록
    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "상품 다건 조회")
    public List<ItemsResponse> getItems() {
        List<Items> items = itemsService.findAll();

        return items
                .stream()
                .map(ItemsResponse::new)
                .toList();
    }

    // 상품 단건 조회 - 상품 상세 보기
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    @Operation(summary = "상품 단건 조회")
    public ItemsResponse getItem(@PathVariable int id) {
        Items item = itemsService.findById(id).get();

        return new ItemsResponse(item);
    }


    // 상품 추가
    @PostMapping
    @Transactional
    @Operation(summary = "상품 추가")
    public RsData<ItemsResponse> createItem(
            @RequestBody @Valid ItemsRequest.ItemAddReqBody req
            ) {
        Items item = itemsService.create(req.name(), req.description(), req.price(), req.inventory());

        return new RsData<>(
                "201-1",
                "%d번 상품이 등록되었습니다.".formatted(item.getId()),
                new ItemsResponse(item)
        );
    }
    // 상품 삭제
    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "상품 삭제")
    public RsData<Void> deleteItem(@PathVariable int id) {
        Items item = itemsService.findById(id).get();

        itemsService.delete(item);

        return new RsData<>(
            "200-1",
                "%d번 상품이 삭제되었습니다.".formatted(item.getId())
        );
    }

    // 상품 수정
    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "상품 수정")
    public RsData<Void> modify(
            @PathVariable int id,
            @RequestBody @Valid ItemsRequest.ItemModifyReqBody req
    ) {
        Items item = itemsService.findById(id).get();

        itemsService.modify(item, req.name(), req.description(), req.price(), req.inventory());

        return new RsData<>(
          "200-1",
          "%d번 상품이 수정되었습니다.".formatted(item.getId())
        );
    }
}
