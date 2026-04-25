package services;

import dtos.ClientDto;
import entities.Client;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import repositories.ClientRepository;

@Service
@AllArgsConstructor
public class ClientService {
    private final ClientRepository clientRepository;

    public ClientDto getClientByAuth(Authentication authentication) {
        Long userId = extractUserId(authentication);
        Client client = clientRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        return toClientDto(client);
    }

    public ClientDto updateClient(Authentication authentication, ClientDto dto) {
        Long userId = extractUserId(authentication);
        Client client = clientRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        
        String newName = dto.name();
        String newEmail = dto.email();
        String newPhone = dto.phone();
        
        if (newName != null) {
            client.getUser().setName(newName);
        }
        if (newEmail != null) {
            client.getUser().setEmail(newEmail);
        }
        if (newPhone != null) {
            client.getUser().setPhone(newPhone);
        }
        
        Client saved = clientRepository.save(client);
        return toClientDto(saved);
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AccessDeniedException("Unauthenticated request");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        if (principal instanceof String) {
            try {
                return Long.parseLong((String) principal);
            } catch (NumberFormatException e) {
                throw new AccessDeniedException("Invalid user ID");
            }
        }
        throw new AccessDeniedException("Invalid authentication");
    }

    private ClientDto toClientDto(Client client) {
        return new ClientDto(
            client.getId(),
            client.getUser().getName(),
            client.getUser().getEmail(),
            client.getUser().getPhone()
        );
    }
}