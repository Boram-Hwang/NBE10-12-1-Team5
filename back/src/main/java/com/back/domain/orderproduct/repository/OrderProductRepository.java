package com.back.domain.orderproduct.repository;

import com.back.domain.dashboard.dto.DashboardProjection;
import com.back.domain.orderproduct.entity.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderProductRepository extends JpaRepository<OrderProduct, Integer> {
    List<OrderProduct> findByOrderId(int orderId);
    void deleteByOrderId(int orderId);
    Optional<OrderProduct> findFirstByOrderByIdDesc();

    // 대시보드
    // 일별 매출 조회
    @Query("""
        select function('date_format', o.createDate, '%Y-%m-%d') as orderDate
              , sum(op.productQuantity * op.productPrice) as totalSalesAmount
            from OrderProduct op
            join op.order o
            where o.status <> com.back.domain.order.entity.OrderStatus.CANCELED
            group by function('date_format', o.createDate, '%Y-%m-%d')
            order by function('date_format', o.createDate, '%Y-%m-%d')
    """)
    List<DashboardProjection.SalesResponse> findDailySales();

    // 월별 매출 조회
    @Query("""
        select function('date_format', o.createDate, '%Y-%m') as orderDate
        	 , sum(op.productQuantity * op.productPrice) as totalSalesAmount
          from OrderProduct op
          join op.order o
         where o.status <> com.back.domain.order.entity.OrderStatus.CANCELED
         group by function('date_format', o.createDate, '%Y-%m')
         order by function('date_format', o.createDate, '%Y-%m')
    """)
    List<DashboardProjection.SalesResponse> findMonthSales();

    // 가장 많이 팔린 원두 TOP 3
    @Query("""
        select p.name as name
             , sum(op.productQuantity) as totalQty
        	 , sum(op.productQuantity * op.productPrice) as totalSalesAmount
          from OrderProduct op
          join op.order o
          join op.product p
         where o.status <> com.back.domain.order.entity.OrderStatus.CANCELED
         group by p.name
         order by sum(op.productQuantity) desc
    """)
    List<DashboardProjection.TopSellingItemResponse> findTopSellingItems();
}
