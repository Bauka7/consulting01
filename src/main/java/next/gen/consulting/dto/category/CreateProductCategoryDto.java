package next.gen.consulting.dto.category;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateProductCategoryDto {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    private String iconUrl;
}
