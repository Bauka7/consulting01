package next.gen.consulting.dto.notification;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
@Hidden
public class CreateNotificationDto {
    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Message is required")
    private String message;
}
