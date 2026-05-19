package next.gen.consulting.dto.consultant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateConsultantDto {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    private String experience;

    private UUID factoryId;
}
