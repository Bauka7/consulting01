package next.gen.consulting.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRequestDto {
    private String fullName;
    private String phone;

    @Size(max = 255)
    private String product;

    private String description;
    private UUID consultantId;
    private Boolean removeConsultant;
    private UUID factoryId;
    private Boolean removeFactory;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Size(max = 20)
    private String unit;

    @Future(message = "Deadline must be in the future")
    private LocalDate deadline;
}
