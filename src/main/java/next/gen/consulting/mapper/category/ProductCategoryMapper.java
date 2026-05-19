package next.gen.consulting.mapper.category;

import next.gen.consulting.dto.category.ProductCategoryDto;
import next.gen.consulting.model.ProductCategory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductCategoryMapper {

    ProductCategoryDto toDto(ProductCategory category);
}
