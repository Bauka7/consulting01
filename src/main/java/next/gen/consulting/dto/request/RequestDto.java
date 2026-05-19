package next.gen.consulting.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import next.gen.consulting.model.RequestStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestDto {
    private UUID id;
    private UUID clientId;
    private UUID consultantId;
    private UUID factoryId;
    private String factoryName;
    private String fullName;
    private String phone;
    private String product;
    private String description;
    private RequestStatus status;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
