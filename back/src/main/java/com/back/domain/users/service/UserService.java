package com.back.domain.users.service;

import com.back.domain.users.entity.Users;
import com.back.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public Users create(String email, String address, String addressDetail, String postcode) {
        Users user = Users.builder()
                .email(email)
                .address(address)
                .addressDetail(addressDetail)
                .postcode(postcode)
                .build();

        return userRepository.save(user);
    }

    public List<Users> findAll() {
        return userRepository.findAll();
    }

    public Optional<Users> findById(int id) {
        return userRepository.findById(id);
    }

    public void update(Users user, String email, String address, String addressDetail, String postcode) {
        user.update(email, address, addressDetail, postcode);
    }

    public void delete(Users user) {
        userRepository.delete(user);
    }
}