package com.back.domain.items.service;

import com.back.domain.items.entity.Items;
import com.back.domain.items.repository.ItemsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemsService {
    private final ItemsRepository itemsRepository;

    // 재고에 대한 count 만들기
    public long count() {
        return itemsRepository.count();
    }

    // 상품 생성 - create
    public Items create(String name, String description, int price, int inventory) {
        List<Items> allItems = itemsRepository.findAll();
        for(Items item : allItems) {
            if(item.getName().equals(name)) {
                throw new IllegalArgumentException("이미 존재하는 상품 이름입니다. : " + name);
            }
        }
        Items item = new Items(name, description, price, inventory);
        return itemsRepository.save(item);
    }

    // 다건 조회 - findALL / List
    @Transactional(readOnly = true)
    public List<Items> findAll() {
        return itemsRepository.findAll();
    }

    @Transactional(readOnly = true)
    // 단건 조회 - findById(int id)
    public Optional<Items> findById(int id) {
        return itemsRepository.findById(id);
    }

    // 상품 수정 - modify 전체 수정이 아닌 item 하나를 수정
    public void modify(Items item, String name, String description, int price, int inventory) {
        item.modify(name, description, price, inventory);
    }

    // 상품 삭제 - delete 전체 삭제가 아닌 item 하나를 삭제
    public void delete(Items item) {
        itemsRepository.delete(item);
    }

}
