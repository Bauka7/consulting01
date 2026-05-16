package next.gen.consulting.controller.achievement;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.achievement.AchievementDto;
import next.gen.consulting.dto.achievement.CreateAchievementDto;
import next.gen.consulting.dto.achievement.UpdateAchievementDto;
import next.gen.consulting.service.AchievementService;
import next.gen.consulting.service.CustomUserPrincipal;
import next.gen.consulting.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementService achievementService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AchievementDto> createAchievement(@Valid @RequestBody CreateAchievementDto createRequest) {
        return ResponseEntity.ok(achievementService.create(createRequest));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CLIENT', 'CONSULTANT', 'ADMIN')")
    public ResponseEntity<List<AchievementDto>> getMyAchievements(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        List<AchievementDto> achievements = achievementService.getByUserId(principal.getId());
        return ResponseEntity.ok(achievements);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AchievementDto>> getAchievementsByUser(@PathVariable UUID userId) {
        List<AchievementDto> achievements = achievementService.getByUserId(userId);
        return ResponseEntity.ok(achievements);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AchievementDto> getAchievementById(@PathVariable UUID id) {
        AchievementDto achievement = achievementService.getById(id);
        return ResponseEntity.ok(achievement);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AchievementDto>> getAllAchievements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<AchievementDto> achievements = achievementService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(achievements);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AchievementDto> updateAchievement(
            @PathVariable UUID id,
            @RequestBody UpdateAchievementDto updateRequest) {
        return ResponseEntity.ok(achievementService.update(id, updateRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteAchievement(@PathVariable UUID id) {
        achievementService.delete(id);
        return ResponseEntity.ok("Achievement deleted");
    }
}
