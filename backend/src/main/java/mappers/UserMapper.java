package mappers;

import org.mapstruct.Mapper;
import dtos.UserDto;
import entities.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toUserDto(User user);
}