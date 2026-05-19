package next.gen.consulting.dto.category;

import lombok.Data;

@Data
public class UpdateProductCategoryDto {
    private String name;
    private String description;
    private String iconUrl;
}
