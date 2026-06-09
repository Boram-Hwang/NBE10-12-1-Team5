package com.back.domain.user.service;

import com.back.domain.user.entity.User;
import com.back.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User create(String email, String address, String addressDetail, String postcode) {
        User user = User.builder()
                .email(email)
                .address(address)
                .addressDetail(addressDetail)
                .postcode(postcode)
                .build();

        return userRepository.save(user);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(int id) {
        return userRepository.findById(id);
    }

    public void update(User user, String email, String address, String addressDetail, String postcode) {
        user.update(email, address, addressDetail, postcode);
    }

    public void delete(User user) {
        userRepository.delete(user);
    }
}