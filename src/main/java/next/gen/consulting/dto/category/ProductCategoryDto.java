package next.gen.consulting.dto.category;

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
public class ProductCategoryDto {
    private UUID id;
    private String name;
    private String description;
    private String iconUrl;
    private LocalDateTime createdAt;
}
