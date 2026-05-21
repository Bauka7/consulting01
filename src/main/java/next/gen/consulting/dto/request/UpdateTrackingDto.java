package next.gen.consulting.dto.request;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;

@Data
public class UpdateTrackingDto {

    @Size(max = 100, message = "Tracking number must not exceed 100 characters")
    private String trackingNumber;

    @URL(message = "Tracking URL must be a valid URL")
    @Size(max = 2048)
    private String trackingUrl;

    @PastOrPresent(message = "Shipped date cannot be in the future")
    private LocalDateTime shippedAt;
}
