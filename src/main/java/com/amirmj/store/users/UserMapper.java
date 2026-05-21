package com.amirmj.store.users;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toUserDto(User user);
    User toEntity(RegisterUserRequest registerUserRequest);

    void update(UpdateUserRequest request, @MappingTarget User user);
}
