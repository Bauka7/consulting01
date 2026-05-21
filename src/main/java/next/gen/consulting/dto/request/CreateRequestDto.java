package next.gen.consulting.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateRequestDto {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Product is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String product;

    @NotBlank(message = "Description is required")
    private String description;

    private UUID consultantId;

    private UUID factoryId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Size(max = 20, message = "Unit must not exceed 20 characters")
    private String unit;

    @Future(message = "Deadline must be in the future")
    private LocalDate deadline;
}
