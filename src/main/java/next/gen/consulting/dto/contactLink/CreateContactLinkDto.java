package next.gen.consulting.dto.contactLink;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateContactLinkDto {

    @NotBlank(message = "Service name is required")
    private String serviceName;

    @NotBlank(message = "Link is required")
    private String link;
}
