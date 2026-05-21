package next.gen.consulting.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import next.gen.consulting.model.RequestStatus;

import java.time.LocalDate;
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
    private String consultantName;
    private UUID factoryId;
    private String factoryName;
    private String fullName;
    private String phone;
    private String product;
    private String description;
    private RequestStatus status;
    private String comment;

    // Order detail
    private Integer quantity;
    private String unit;
    private LocalDate deadline;

    // Shipment tracking
    private String trackingNumber;
    private String trackingUrl;
    private LocalDateTime shippedAt;

    // Factory response
    private String factoryComment;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
