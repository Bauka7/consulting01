package next.gen.consulting.dto.achievement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateAchievementDto {
    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Description is required")
    private String description;
}
