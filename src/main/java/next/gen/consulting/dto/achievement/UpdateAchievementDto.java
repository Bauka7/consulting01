package next.gen.consulting.dto.achievement;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateAchievementDto {
    @NotBlank(message = "Description is required")
    private String description;
}
