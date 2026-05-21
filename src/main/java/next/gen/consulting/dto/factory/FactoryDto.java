package next.gen.consulting.dto.factory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import next.gen.consulting.dto.category.ProductCategoryDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactoryDto {
    private UUID id;
    private String name;
    private String description;
    private String location;
    private String imageUrl;
    private List<ProductCategoryDto> categories;
    private LocalDateTime createdAt;

    // Factory user account (populated for ADMIN view)
    private UUID userId;
    private String userPhone;
    private String userFullName;
    private boolean hasUserAccount;
}
