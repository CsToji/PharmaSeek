package dtos;

import entities.Roles;


public record UserDto(Long id, String email, Roles role) {
}