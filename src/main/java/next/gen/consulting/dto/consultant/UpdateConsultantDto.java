package next.gen.consulting.dto.consultant;

import lombok.Data;

import java.util.UUID;

@Data
public class UpdateConsultantDto {
    private String specialization;
    private String experience;
    private UUID factoryId;
    private Boolean removeFactory;
}
