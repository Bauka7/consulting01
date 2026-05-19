package next.gen.consulting.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRequestDto {
    private String fullName;
    private String phone;
    private String product;
    private String description;
    private UUID consultantId;
    private Boolean removeConsultant;
    private UUID factoryId;
    private Boolean removeFactory;
}
