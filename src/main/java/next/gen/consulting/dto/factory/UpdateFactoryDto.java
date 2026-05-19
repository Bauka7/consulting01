package next.gen.consulting.dto.factory;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UpdateFactoryDto {
    private String name;
    private String description;
    private String location;
    private String imageUrl;
    private List<UUID> categoryIds;
}
