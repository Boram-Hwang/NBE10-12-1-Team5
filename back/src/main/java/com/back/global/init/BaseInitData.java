package com.back.global.init;

import com.back.domain.product.entity.Product;
import com.back.domain.product.repository.ProductRepository;
import com.back.domain.orderproduct.entity.OrderProduct;
import com.back.domain.orderproduct.repository.OrderProductRepository;
import com.back.domain.order.entity.OrderStatus;
import com.back.domain.order.entity.Order;
import com.back.domain.order.repository.OrderRepository;
import com.back.domain.user.entity.User;
import com.back.domain.user.repository.UserRepository;
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

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderProductRepository orderProductRepository;

    @Bean
    public CommandLineRunner initData() {
        return new CommandLineRunner() {
            @Override
            @Transactional
            public void run(String @NonNull ... args)  {

                if (productRepository.count() > 0 ||
                        userRepository.count() > 0 ||
                        orderRepository.count() > 0) {
                    return;
                }

                Product product1 = productRepository.save(new Product(
                        "Ethiopia Yirgacheffe",
                        null,
                        "플로럴, 시트러스 계열의 밝고 산뜻한 에티오피아 원두",
                        1000,
                        253
                ));
                Product product2 = productRepository.save(new Product(
                        "Colombia Huila",
                        null,
                        "카라멜, 헤이즐넛 풍미의 균형 잡힌 콜롬비아 원두",
                        3500,
                        236
                ));
                Product product3 = productRepository.save(new Product(
                        "Guatemala Antigua",
                        null,
                        "다크초콜릿, 스모키 향의 과테말라 원두",
                        5000,
                        217
                ));
                Product product4 = productRepository.save(new Product(
                        "Brazil Santos",
                        null,
                        "고소하고 부드러운 브라질 산토스 원두",
                        7500,
                        195
                ));
                Product product5 = productRepository.save(new Product(
                        "Kenya AA",
                        null,
                        "자몽, 블랙커런트의 강렬한 산미와 와인 같은 풍미의 케냐 원두",
                        4500,
                        170
                ));
                Product product6 = productRepository.save(new Product(
                        "Costa Rica Tarrazu",
                        null,
                        "깔끔한 산미와 시트러스, 아몬드의 고소함이 어우러진 코스타리카 원두",
                        13000,
                        158
                ));
                Product product7 = productRepository.save(new Product(
                        "Indonesia Sumatra Mandheling",
                        null,
                        "묵직한 바디감과 흙 내음, 허브 향이 매력적인 인도네시아 원두",
                        9500,
                        131
                ));
                Product product8 = productRepository.save(new Product(
                        "Ethiopia Sidamo",
                        null,
                        "베리류의 달콤함과 깊은 꽃향기가 감도는 에티오피아 원두",
                        12000,
                        119
                ));
                Product product9 = productRepository.save(new Product(
                        "Jamaica Blue Mountain",
                        null,
                        "부드러운 산미와 쓴맛이 완벽한 조화를 이루는 자메이카 명품 원두",
                        25000,
                        95
                ));
                Product product10 = productRepository.save(new Product(
                        "Tanzania Kilimanjaro",
                        null,
                        "짜릿한 산미와 와인 향, 훌륭한 밸런스를 가진 탄자니아 원두",
                        12500,
                        74
                ));
                Product product11 = productRepository.save(new Product(
                        "El Salvador Bourbon",
                        null,
                        "꿀 같은 달콤함과 부드러운 밀크초콜릿 풍미의 엘살바도르 원두",
                        10000,
                        57
                ));

                User user1 = userRepository.save(User.builder()
                        .email("77romain@gmail.com")
                        .address("서울 성동구 성수이로18길 37 1층")
                        .addressDetail("스탠다드브레드")
                        .postcode("04787")
                        .build());

                User user2 = userRepository.save(User.builder()
                        .email("A-Light-Shining-in-Darkness@gmail.com")
                        .address("서울 용산구 신흥로3길 2")
                        .addressDetail("보니스피자펍")
                        .postcode("04338")
                        .build());

                User user3 = userRepository.save(User.builder()
                        .email("Boram-Hwang@gmail.com")
                        .address("서울 마포구 와우산로3길 16")
                        .addressDetail("UNITY RECORD BAR")
                        .postcode("04074")
                        .build());

                User user4 = userRepository.save(User.builder()
                        .email("hyeok314@gmail.com")
                        .address("서울 관악구 남부순환로226길 36")
                        .addressDetail("모즈타파스라운지")
                        .postcode("08788")
                        .build());

                User user5 = userRepository.save(User.builder()
                        .email("piker0925@gmail.com")
                        .address("서울 용산구 신흥로 95")
                        .addressDetail("오잇")
                        .postcode("04337")
                        .build());

                Order order1 = orderRepository.save(new Order(
                        user1,
                        user1.getAddress(),
                        user1.getAddressDetail(),
                        user1.getPostcode(),
                        42500,
                        LocalDate.of(2026, 6, 6)
                ));
                orderProductRepository.save(OrderProduct.builder()
                        .order(order1)
                        .product(product1)
                        .productName(product1.getName())
                        .productPrice(product1.getPrice())
                        .productQuantity(15)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order1)
                        .product(product2)
                        .productName(product2.getName())
                        .productPrice(product2.getPrice())
                        .productQuantity(5)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order1)
                        .product(product3)
                        .productName(product3.getName())
                        .productPrice(product3.getPrice())
                        .productQuantity(2)
                        .build());

                Order order2 = orderRepository.save(new Order(
                        user2,
                        user2.getAddress(),
                        user2.getAddressDetail(),
                        user2.getPostcode(),
                        114000,
                        LocalDate.of(2026, 6, 6)
                ));
                orderProductRepository.save(OrderProduct.builder()
                        .order(order2)
                        .product(product4)
                        .productName(product4.getName())
                        .productPrice(product4.getPrice())
                        .productQuantity(8)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order2)
                        .product(product5)
                        .productName(product5.getName())
                        .productPrice(product5.getPrice())
                        .productQuantity(12)
                        .build());

                Order order3 = orderRepository.save(new Order(
                        user3,
                        user3.getAddress(),
                        user3.getAddressDetail(),
                        user3.getPostcode(),
                        109000,
                        LocalDate.of(2026, 6, 5)
                ));
                orderProductRepository.save(OrderProduct.builder()
                        .order(order3)
                        .product(product6)
                        .productName(product6.getName())
                        .productPrice(product6.getPrice())
                        .productQuantity(4)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order3)
                        .product(product7)
                        .productName(product7.getName())
                        .productPrice(product7.getPrice())
                        .productQuantity(6)
                        .build());

                Order order4 = orderRepository.save(new Order(
                        user4,
                        user4.getAddress(),
                        user4.getAddressDetail(),
                        user4.getPostcode(),
                        60000,
                        LocalDate.of(2026, 6, 5)
                ));
                orderProductRepository.save(OrderProduct.builder()
                        .order(order4)
                        .product(product8)
                        .productName(product8.getName())
                        .productPrice(product8.getPrice())
                        .productQuantity(5)
                        .build());

                Order order5 = orderRepository.save(new Order(
                        user5,
                        user5.getAddress(),
                        user5.getAddressDetail(),
                        user5.getPostcode(),
                        160000,
                        LocalDate.of(2026, 6, 4)
                ));
                orderProductRepository.save(OrderProduct.builder()
                        .order(order5)
                        .product(product9)
                        .productName(product9.getName())
                        .productPrice(product9.getPrice())
                        .productQuantity(2)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order5)
                        .product(product10)
                        .productName(product10.getName())
                        .productPrice(product10.getPrice())
                        .productQuantity(4)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order5)
                        .product(product11)
                        .productName(product11.getName())
                        .productPrice(product11.getPrice())
                        .productQuantity(6)
                        .build());

                Order order6 = orderRepository.save(new Order(
                        user1,
                        user1.getAddress(),
                        user1.getAddressDetail(),
                        user1.getPostcode(),
                        95000,
                        LocalDate.of(2026, 6, 3)
                ));
                order6.modifyStatus(OrderStatus.DELIVERED);
                orderRepository.save(order6);
                orderProductRepository.save(OrderProduct.builder()
                        .order(order6)
                        .product(product1)
                        .productName(product1.getName())
                        .productPrice(product1.getPrice())
                        .productQuantity(20)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order6)
                        .product(product4)
                        .productName(product4.getName())
                        .productPrice(product4.getPrice())
                        .productQuantity(10)
                        .build());

                Order order7 = orderRepository.save(new Order(
                        user2,
                        user2.getAddress(),
                        user2.getAddressDetail(),
                        user2.getPostcode(),
                        152500,
                        LocalDate.of(2026, 6, 2)
                ));
                order7.modifyStatus(OrderStatus.DELIVERED);
                orderRepository.save(order7);
                orderProductRepository.save(OrderProduct.builder()
                        .order(order7)
                        .product(product2)
                        .productName(product2.getName())
                        .productPrice(product2.getPrice())
                        .productQuantity(15)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order7)
                        .product(product9)
                        .productName(product9.getName())
                        .productPrice(product9.getPrice())
                        .productQuantity(4)
                        .build());

                Order order8 = orderRepository.save(new Order(
                        user3,
                        user3.getAddress(),
                        user3.getAddressDetail(),
                        user3.getPostcode(),
                        102500,
                        LocalDate.of(2026, 6, 1)
                ));
                order8.modifyStatus(OrderStatus.CANCELED);
                orderRepository.save(order8);
                orderProductRepository.save(OrderProduct.builder()
                        .order(order8)
                        .product(product3)
                        .productName(product3.getName())
                        .productPrice(product3.getPrice())
                        .productQuantity(8)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order8)
                        .product(product10)
                        .productName(product10.getName())
                        .productPrice(product10.getPrice())
                        .productQuantity(5)
                        .build());

                Order order9 = orderRepository.save(new Order(
                        user4,
                        user4.getAddress(),
                        user4.getAddressDetail(),
                        user4.getPostcode(),
                        190000,
                        LocalDate.of(2026, 5, 30)
                ));
                order9.modifyStatus(OrderStatus.CANCELED);
                orderRepository.save(order9);
                orderProductRepository.save(OrderProduct.builder()
                        .order(order9)
                        .product(product5)
                        .productName(product5.getName())
                        .productPrice(product5.getPrice())
                        .productQuantity(20)
                        .build());
                orderProductRepository.save(OrderProduct.builder()
                        .order(order9)
                        .product(product11)
                        .productName(product11.getName())
                        .productPrice(product11.getPrice())
                        .productQuantity(10)
                        .build());
            }
        };
    }
}
