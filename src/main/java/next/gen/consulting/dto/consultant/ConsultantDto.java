package next.gen.consulting.dto.consultant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultantDto {
    private UUID id;
    private UUID userId;
    private String fullName;
    private String specialization;
    private String experience;
    private LocalDateTime createdAt;
}
