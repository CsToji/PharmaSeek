package services;

import config.JwtConfig;
import dtos.*;
import entities.Client;
import entities.PasswordResetToken;
import entities.Pharmacy;
import entities.PharmacyApprovalStatus;
import entities.Role;
import entities.Roles;
import entities.User;
import exceptions.EmailAlreadyInUseException;
import exceptions.TaxIdAlreadyInUseException;
import exceptions.UserNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import mappers.ClientMapper;
import mappers.PharmacyMapper;
import mappers.UserMapper;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import repositories.ClientRepository;
import repositories.PasswordResetTokenRepository;
import repositories.PharmacyRepository;
import repositories.RoleRepository;
import repositories.UserRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashSet;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AuthService {
    public static final String REFRESH_COOKIE_NAME = "refreshToken";
    private final JwtService jwtService;
    private final JwtConfig jwtConfig;
    private final UserMapper userMapper;
    private final ClientMapper clientMapper;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final PharmacyRepository pharmacyRepository;
    private final RoleRepository roleRepository;
    private final PharmacyMapper pharmacyMapper;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;


    public JwtResponse generateAuthResponse(User user, HttpServletResponse response) {
        // Generate tokens
        var accessToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        clearLegacyRefreshCookies(response);

        // Create and configure cookie
        var cookie = createRefreshTokenCookie(refreshToken);
        response.addCookie(cookie);

        // Return response
        return new JwtResponse(
                accessToken,
                userMapper.toUserDto(user)
        );
    }


    private Cookie createRefreshTokenCookie(String refreshToken) {
        var cookie = new Cookie(REFRESH_COOKIE_NAME, refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtConfig.getRefreshTokenValidity() / 1000));
        cookie.setSecure(jwtConfig.isSecureCookie());
        cookie.setAttribute("SameSite", jwtConfig.getSameSite());
        return cookie;
    }


    private void clearLegacyRefreshCookies(HttpServletResponse response) {
        Cookie legacyRoot = new Cookie(REFRESH_COOKIE_NAME, "");
        legacyRoot.setHttpOnly(true);
        legacyRoot.setPath("/");
        legacyRoot.setMaxAge(0);
        response.addCookie(legacyRoot);
        Cookie legacyAuth = new Cookie(REFRESH_COOKIE_NAME, "");
        legacyAuth.setHttpOnly(true);
        legacyAuth.setPath("/auth");
        legacyAuth.setMaxAge(0);
        response.addCookie(legacyAuth);
    }

    public User validateRefreshToken(String refreshToken) {
        var claims = jwtService.parseToken(refreshToken);
        if (claims == null || claims.getExpiration().before(new Date())) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }
        Long userId = Long.parseLong(claims.getSubject());
        return userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
    }

    public JwtResponse login(LoginRequestBody request, HttpServletResponse response) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        validatePharmacyApproval(user);
        return generateAuthResponse(user, response);
    }

    private void validatePharmacyApproval(User user) {
        if (user.getRole() != Roles.PHARMACY) {
            return;
        }

        Pharmacy pharmacy = pharmacyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadCredentialsException("Pharmacy account is not ready yet."));

        if (pharmacy.getApprovalStatus() == PharmacyApprovalStatus.PENDING) {
            throw new BadCredentialsException("Your pharmacy account is pending admin approval.");
        }
        if (pharmacy.getApprovalStatus() == PharmacyApprovalStatus.REJECTED) {
            throw new BadCredentialsException("Your pharmacy account request was rejected by an admin.");
        }
    }

    public JwtResponse refresh(String refreshToken, HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadCredentialsException("Missing refresh token");
        }
        var user = validateRefreshToken(refreshToken);
        validatePharmacyApproval(user);
        return generateAuthResponse(user, response);
    }

    public UserDto getCurrentUser(Authentication authentication) {
        Long userId = resolveAuthenticatedUserId(authentication);
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return userMapper.toUserDto(user);
    }

    private Long resolveAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication required");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Long userId) {
            return userId;
        }
        if (principal instanceof String userIdValue) {
            try {
                return Long.parseLong(userIdValue);
            } catch (NumberFormatException ex) {
                throw new BadCredentialsException("Invalid authentication principal");
            }
        }

        throw new BadCredentialsException("Invalid authentication principal");
    }


    @Transactional
    public ClientDto registerClient(RegisterClientRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyInUseException();
        }

        Instant persistedAt = Instant.now().plus(1, ChronoUnit.HOURS);
        Role clientRole = roleRepository.findByCode(Roles.CLIENT.name())
                .orElseThrow(() -> new IllegalStateException("Missing CLIENT role seed data"));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(new HashSet<>(java.util.Set.of(clientRole)));
        user.setEnabled(Boolean.TRUE);
        user.setCreatedAt(persistedAt);
        user.setUpdatedAt(persistedAt);
        User savedUser = userRepository.save(user);

        Client client = new Client();
        client.setUser(savedUser);
        client.setCreatedAt(persistedAt);
        client.setUpdatedAt(persistedAt);
        Client savedClient = clientRepository.save(client);

        return clientMapper.toClientDto(savedClient);
    }

    @Transactional
    public PharmacyDto registerPharmacy(RegisterPharmacyRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyInUseException();
        }

        if (pharmacyRepository.existsByTaxId(request.getTaxId())) {
            throw new TaxIdAlreadyInUseException();
        }

        Instant persistedAt = Instant.now().plus(1, ChronoUnit.HOURS);
        Role pharmacyRole = roleRepository.findByCode(Roles.PHARMACY.name())
                .orElseThrow(() -> new IllegalStateException("Missing PHARMACY role seed data"));

        User user = new User();
        user.setName(request.getPharmacyName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(new HashSet<>(java.util.Set.of(pharmacyRole)));
        user.setEnabled(Boolean.TRUE);
        user.setCreatedAt(persistedAt);
        user.setUpdatedAt(persistedAt);
        User savedUser = userRepository.save(user);
        Pharmacy pharmacy = getPharmacy(request, savedUser, persistedAt);
        Pharmacy savedPharmacy = pharmacyRepository.save(pharmacy);
        return pharmacyMapper.toPharmacyDto(savedPharmacy);
    }

    private static @NonNull Pharmacy getPharmacy(RegisterPharmacyRequest request, User savedUser, Instant persistedAt) {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setUser(savedUser);
        pharmacy.setPharmacyName(request.getPharmacyName());
        pharmacy.setTaxId(request.getTaxId());
        /*pharmacy.setEmail(request.getEmail().toLowerCase().trim());*/
        pharmacy.setAddress(request.getAddress());
        pharmacy.setLatitude(request.getLatitude() != null ? request.getLatitude().doubleValue() : 0.0);
        pharmacy.setLongitude(request.getLongitude() != null ? request.getLongitude().doubleValue() : 0.0);
        pharmacy.setSchedule(null);
        pharmacy.setApprovalStatus(PharmacyApprovalStatus.PENDING);
        pharmacy.setCreatedAt(persistedAt);
        pharmacy.setUpdatedAt(persistedAt);
        return pharmacy;
    }


    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setSecure(jwtConfig.isSecureCookie());
        response.addCookie(cookie);
    }

    @Transactional
    public void forgotPassword(String email) {
        var userOptional = userRepository.findByEmail(email.toLowerCase().trim());
        if (userOptional.isEmpty()) {
            return;
        }

        User user = userOptional.get();
        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setCreatedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        String resetLink = "http://localhost:4200/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }
    public Object getCurrentUserProfile(Authentication authentication) {
        Long userId = resolveAuthenticatedUserId(authentication);
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        
        if (user.getRole() == Roles.PHARMACY) {
            return pharmacyRepository.findById(userId)
                    .map(pharmacyMapper::toPharmacyDto)
                    .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        } else if (user.getRole() == Roles.CLIENT) {
            return clientRepository.findById(userId)
                    .map(clientMapper::toClientDto)
                    .orElseThrow(() -> new RuntimeException("Client not found"));
        } else {
            return userMapper.toUserDto(user);
        }
    }
}
