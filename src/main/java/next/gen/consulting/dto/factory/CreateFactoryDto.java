package next.gen.consulting.dto.factory;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateFactoryDto {

    @NotBlank(message = "Factory name is required")
    private String name;

    private String description;

    private String location;

    private String imageUrl;

    private List<UUID> categoryIds;
}
