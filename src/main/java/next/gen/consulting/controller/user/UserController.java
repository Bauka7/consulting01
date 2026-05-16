package next.gen.consulting.controller.user;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.user.UserDto;
import next.gen.consulting.dto.user.UserUpdateRequest;
import next.gen.consulting.model.UserRole;
import next.gen.consulting.service.CustomUserPrincipal;
import next.gen.consulting.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN')")
    public ResponseEntity<UserDto> getCurrentUserProfile(@AuthenticationPrincipal CustomUserPrincipal principal) {
        UserDto user = userService.getById(principal.getId());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN')")
    public ResponseEntity<UserDto> updateCurrentUserProfile(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestBody UserUpdateRequest updateRequest) {
        UserDto updatedUser = userService.update(principal.getId(), updateRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<UserDto> users = userService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT', 'CLIENT')")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID id) {
        UserDto user = userService.getById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable UUID id, @RequestParam UserRole role) {
        UserDto updatedUser = userService.updateRole(id, role);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.ok("User deleted");
    }
}
