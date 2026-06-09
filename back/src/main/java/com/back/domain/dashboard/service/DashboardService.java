package com.back.domain.dashboard.service;

import com.back.domain.dashboard.dto.DashboardResponse;
import com.back.domain.orderproduct.repository.OrderProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final OrderProductRepository orderProductRepository;

    // 일별 매출 조회
    public List<DashboardResponse.SalesResponse> getDailySales() {
        return orderProductRepository.findDailySales()
                .stream()
                .map(s -> new DashboardResponse.SalesResponse(
                        s.getOrderDate(),
                        s.getTotalSalesAmount()
                )).toList();
    }

    // 월별 매출 조회
    public List<DashboardResponse.SalesResponse> getMonthSales() {
        return orderProductRepository.findMonthSales()
                .stream()
                .map(s -> new DashboardResponse.SalesResponse(
                        s.getOrderDate(),
                        s.getTotalSalesAmount()
                )).toList();
    }

    // 가장 많이 팔린 원두 조회
    public List<DashboardResponse.TopSellingItemResponse> getTopSellingItems() {
        return orderProductRepository.findTopSellingItems()
                .stream()
                .map(s -> new DashboardResponse.TopSellingItemResponse(
                        s.getName(),
                        s.getTotalQty(),
                        s.getTotalSalesAmount()
                )).toList();
    }
}
