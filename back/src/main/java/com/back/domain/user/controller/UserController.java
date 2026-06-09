package com.back.domain.user.controller;

import com.back.domain.user.dto.UserRequest;
import com.back.domain.user.dto.UserResponse;
import com.back.domain.user.entity.User;
import com.back.domain.user.service.UserService;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "UserController", description = "API 유저 컨트롤러")
public class UserController {
    private final UserService userService;

    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "유저 다건 조회")
    public List<UserResponse> getUsers() {
        List<User> users = userService.findAll();

        return users.stream()
                .map(UserResponse::new)
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    @Operation(summary = "유저 단건 조회")
    public UserResponse getUser(@PathVariable int id) {
        User user = userService.findById(id).get();

        return new UserResponse(user);
    }

    @PostMapping
    @Transactional
    @Operation(summary = "유저 생성")
    public RsData<UserResponse> create(@RequestBody @Valid UserRequest req) {
        User user = userService.create(req.email(), req.address(), req.addressDetail(), req.postcode());

        return new RsData<>(
                "201-1",
                "%d번 유저가 생성되었습니다.".formatted(user.getId()),
                new UserResponse(user)
        );
    }

    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "유저 수정")
    public RsData<Void> update(@PathVariable int id, @RequestBody @Valid UserRequest req) {
        User user = userService.findById(id).get();

        userService.update(user, req.email(), req.address(), req.addressDetail(), req.postcode());

        return new RsData<>(
                "200-1",
                "%d번 유저가 수정되었습니다.".formatted(id)
        );
    }

    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "유저 삭제")
    public RsData<Void> delete(@PathVariable int id) {
        User user = userService.findById(id).get();

        userService.delete(user);

        return new RsData<>(
                "200-1",
                "%d번 유저가 삭제되었습니다.".formatted(id)
        );
    }
}