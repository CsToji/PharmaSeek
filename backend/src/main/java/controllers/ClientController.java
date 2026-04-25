package controllers;

import dtos.ClientDto;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import services.ClientService;

@RestController
@RequestMapping("/clients")
@AllArgsConstructor
public class ClientController {
    private final ClientService clientService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ClientDto> getCurrentClient(Authentication authentication) {
        return ResponseEntity.ok(clientService.getClientByAuth(authentication));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ClientDto> updateCurrentClient(
            @RequestBody ClientDto clientDto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(clientService.updateClient(authentication, clientDto));
    }
}