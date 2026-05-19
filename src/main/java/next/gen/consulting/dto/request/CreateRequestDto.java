package next.gen.consulting.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateRequestDto {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Product is required")
    private String product;

    @NotBlank(message = "Description is required")
    private String description;

    private UUID consultantId;

    private UUID factoryId;
}
