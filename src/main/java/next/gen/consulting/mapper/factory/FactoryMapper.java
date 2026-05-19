package next.gen.consulting.mapper.factory;

import next.gen.consulting.dto.factory.FactoryDto;
import next.gen.consulting.mapper.category.ProductCategoryMapper;
import next.gen.consulting.model.Factory;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        uses = ProductCategoryMapper.class,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface FactoryMapper {

    FactoryDto toDto(Factory factory);
}
