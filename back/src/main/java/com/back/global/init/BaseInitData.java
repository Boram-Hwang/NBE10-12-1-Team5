package com.back.global.init;

import com.back.domain.items.entity.Items;
import com.back.domain.items.repository.ItemsRepository;
import com.back.domain.orderitems.entity.OrderItems;
import com.back.domain.orderitems.repository.OrderItemRepository;
import com.back.domain.orders.entity.OrderStatus;
import com.back.domain.orders.entity.Orders;
import com.back.domain.orders.repository.OrderRepository;
import com.back.domain.users.entity.Users;
import com.back.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

    private final ItemsRepository itemsRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Bean
    public CommandLineRunner initData() {
        return new CommandLineRunner() {
            @Override
            @Transactional
            public void run(String @NonNull ... args)  {

                if (itemsRepository.count() > 0 ||
                        userRepository.count() > 0 ||
                        orderRepository.count() > 0) {
                    return;
                }

                Items item1 = itemsRepository.save(new Items(
                        "Ethiopia Yirgacheffe",
                        null,
                        "플로럴, 시트러스 계열의 밝고 산뜻한 에티오피아 원두",
                        1000,
                        253
                ));
                Items item2 = itemsRepository.save(new Items(
                        "Colombia Huila",
                        null,
                        "카라멜, 헤이즐넛 풍미의 균형 잡힌 콜롬비아 원두",
                        3500,
                        236
                ));
                Items item3 = itemsRepository.save(new Items(
                        "Guatemala Antigua",
                        null,
                        "다크초콜릿, 스모키 향의 과테말라 원두",
                        5000,
                        217
                ));
                Items item4 = itemsRepository.save(new Items(
                        "Brazil Santos",
                        null,
                        "고소하고 부드러운 브라질 산토스 원두",
                        7500,
                        195
                ));
                Items item5 = itemsRepository.save(new Items(
                        "Kenya AA",
                        null,
                        "자몽, 블랙커런트의 강렬한 산미와 와인 같은 풍미의 케냐 원두",
                        4500,
                        170
                ));
                Items item6 = itemsRepository.save(new Items(
                        "Costa Rica Tarrazu",
                        null,
                        "깔끔한 산미와 시트러스, 아몬드의 고소함이 어우러진 코스타리카 원두",
                        13000,
                        158
                ));
                Items item7 = itemsRepository.save(new Items(
                        "Indonesia Sumatra Mandheling",
                        null,
                        "묵직한 바디감과 흙 내음, 허브 향이 매력적인 인도네시아 원두",
                        9500,
                        131
                ));
                Items item8 = itemsRepository.save(new Items(
                        "Ethiopia Sidamo",
                        null,
                        "베리류의 달콤함과 깊은 꽃향기가 감도는 에티오피아 원두",
                        12000,
                        119
                ));
                Items item9 = itemsRepository.save(new Items(
                        "Jamaica Blue Mountain",
                        null,
                        "부드러운 산미와 쓴맛이 완벽한 조화를 이루는 자메이카 명품 원두",
                        25000,
                        95
                ));
                Items item10 = itemsRepository.save(new Items(
                        "Tanzania Kilimanjaro",
                        null,
                        "짜릿한 산미와 와인 향, 훌륭한 밸런스를 가진 탄자니아 원두",
                        12500,
                        74
                ));
                Items item11 = itemsRepository.save(new Items(
                        "El Salvador Bourbon",
                        null,
                        "꿀 같은 달콤함과 부드러운 밀크초콜릿 풍미의 엘살바도르 원두",
                        10000,
                        57
                ));

                Users user1 = userRepository.save(Users.builder()
                        .email("77romain@gmail.com")
                        .address("서울 성동구 성수이로18길 37 1층")
                        .addressDetail("스탠다드브레드")
                        .postcode("04787")
                        .build());

                Users user2 = userRepository.save(Users.builder()
                        .email("A-Light-Shining-in-Darkness@gmail.com")
                        .address("서울 용산구 신흥로3길 2")
                        .addressDetail("보니스피자펍")
                        .postcode("04338")
                        .build());

                Users user3 = userRepository.save(Users.builder()
                        .email("Boram-Hwang@gmail.com")
                        .address("서울 마포구 와우산로3길 16")
                        .addressDetail("UNITY RECORD BAR")
                        .postcode("04074")
                        .build());

                Users user4 = userRepository.save(Users.builder()
                        .email("hyeok314@gmail.com")
                        .address("서울 관악구 남부순환로226길 36")
                        .addressDetail("모즈타파스라운지")
                        .postcode("08788")
                        .build());

                Users user5 = userRepository.save(Users.builder()
                        .email("piker0925@gmail.com")
                        .address("서울 용산구 신흥로 95")
                        .addressDetail("오잇")
                        .postcode("04337")
                        .build());

                Orders order1 = orderRepository.save(new Orders(
                        user1,
                        user1.getAddress(),
                        user1.getAddressDetail(),
                        user1.getPostcode(),
                        42500,
                        LocalDate.of(2026, 6, 6)
                ));
                orderItemRepository.save(OrderItems.builder()
                        .order(order1)
                        .item(item1)
                        .itemName(item1.getName())
                        .itemPrice(item1.getPrice())
                        .itemQuantity(15)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order1)
                        .item(item2)
                        .itemName(item2.getName())
                        .itemPrice(item2.getPrice())
                        .itemQuantity(5)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order1)
                        .item(item3)
                        .itemName(item3.getName())
                        .itemPrice(item3.getPrice())
                        .itemQuantity(2)
                        .build());

                Orders order2 = orderRepository.save(new Orders(
                        user2,
                        user2.getAddress(),
                        user2.getAddressDetail(),
                        user2.getPostcode(),
                        114000,
                        LocalDate.of(2026, 6, 6)
                ));
                orderItemRepository.save(OrderItems.builder()
                        .order(order2)
                        .item(item4)
                        .itemName(item4.getName())
                        .itemPrice(item4.getPrice())
                        .itemQuantity(8)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order2)
                        .item(item5)
                        .itemName(item5.getName())
                        .itemPrice(item5.getPrice())
                        .itemQuantity(12)
                        .build());

                Orders order3 = orderRepository.save(new Orders(
                        user3,
                        user3.getAddress(),
                        user3.getAddressDetail(),
                        user3.getPostcode(),
                        109000,
                        LocalDate.of(2026, 6, 5)
                ));
                orderItemRepository.save(OrderItems.builder()
                        .order(order3)
                        .item(item6)
                        .itemName(item6.getName())
                        .itemPrice(item6.getPrice())
                        .itemQuantity(4)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order3)
                        .item(item7)
                        .itemName(item7.getName())
                        .itemPrice(item7.getPrice())
                        .itemQuantity(6)
                        .build());

                Orders order4 = orderRepository.save(new Orders(
                        user4,
                        user4.getAddress(),
                        user4.getAddressDetail(),
                        user4.getPostcode(),
                        60000,
                        LocalDate.of(2026, 6, 5)
                ));
                orderItemRepository.save(OrderItems.builder()
                        .order(order4)
                        .item(item8)
                        .itemName(item8.getName())
                        .itemPrice(item8.getPrice())
                        .itemQuantity(5)
                        .build());

                Orders order5 = orderRepository.save(new Orders(
                        user5,
                        user5.getAddress(),
                        user5.getAddressDetail(),
                        user5.getPostcode(),
                        160000,
                        LocalDate.of(2026, 6, 4)
                ));
                orderItemRepository.save(OrderItems.builder()
                        .order(order5)
                        .item(item9)
                        .itemName(item9.getName())
                        .itemPrice(item9.getPrice())
                        .itemQuantity(2)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order5)
                        .item(item10)
                        .itemName(item10.getName())
                        .itemPrice(item10.getPrice())
                        .itemQuantity(4)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order5)
                        .item(item11)
                        .itemName(item11.getName())
                        .itemPrice(item11.getPrice())
                        .itemQuantity(6)
                        .build());

                Orders order6 = orderRepository.save(new Orders(
                        user1,
                        user1.getAddress(),
                        user1.getAddressDetail(),
                        user1.getPostcode(),
                        95000,
                        LocalDate.of(2026, 6, 3)
                ));
                order6.modifyStatus(OrderStatus.DELIVERED);
                orderRepository.save(order6);
                orderItemRepository.save(OrderItems.builder()
                        .order(order6)
                        .item(item1)
                        .itemName(item1.getName())
                        .itemPrice(item1.getPrice())
                        .itemQuantity(20)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order6)
                        .item(item4)
                        .itemName(item4.getName())
                        .itemPrice(item4.getPrice())
                        .itemQuantity(10)
                        .build());

                Orders order7 = orderRepository.save(new Orders(
                        user2,
                        user2.getAddress(),
                        user2.getAddressDetail(),
                        user2.getPostcode(),
                        152500,
                        LocalDate.of(2026, 6, 2)
                ));
                order7.modifyStatus(OrderStatus.DELIVERED);
                orderRepository.save(order7);
                orderItemRepository.save(OrderItems.builder()
                        .order(order7)
                        .item(item2)
                        .itemName(item2.getName())
                        .itemPrice(item2.getPrice())
                        .itemQuantity(15)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order7)
                        .item(item9)
                        .itemName(item9.getName())
                        .itemPrice(item9.getPrice())
                        .itemQuantity(4)
                        .build());

                Orders order8 = orderRepository.save(new Orders(
                        user3,
                        user3.getAddress(),
                        user3.getAddressDetail(),
                        user3.getPostcode(),
                        102500,
                        LocalDate.of(2026, 6, 1)
                ));
                order8.modifyStatus(OrderStatus.CANCELED);
                orderRepository.save(order8);
                orderItemRepository.save(OrderItems.builder()
                        .order(order8)
                        .item(item3)
                        .itemName(item3.getName())
                        .itemPrice(item3.getPrice())
                        .itemQuantity(8)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order8)
                        .item(item10)
                        .itemName(item10.getName())
                        .itemPrice(item10.getPrice())
                        .itemQuantity(5)
                        .build());

                Orders order9 = orderRepository.save(new Orders(
                        user4,
                        user4.getAddress(),
                        user4.getAddressDetail(),
                        user4.getPostcode(),
                        190000,
                        LocalDate.of(2026, 5, 30)
                ));
                order9.modifyStatus(OrderStatus.CANCELED);
                orderRepository.save(order9);
                orderItemRepository.save(OrderItems.builder()
                        .order(order9)
                        .item(item5)
                        .itemName(item5.getName())
                        .itemPrice(item5.getPrice())
                        .itemQuantity(20)
                        .build());
                orderItemRepository.save(OrderItems.builder()
                        .order(order9)
                        .item(item11)
                        .itemName(item11.getName())
                        .itemPrice(item11.getPrice())
                        .itemQuantity(10)
                        .build());
            }
        };
    }
}
