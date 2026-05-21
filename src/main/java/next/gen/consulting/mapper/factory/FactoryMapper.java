package next.gen.consulting.mapper.factory;

import next.gen.consulting.dto.factory.FactoryDto;
import next.gen.consulting.mapper.category.ProductCategoryMapper;
import next.gen.consulting.model.Factory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        uses = ProductCategoryMapper.class,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface FactoryMapper {

    @Mapping(target = "userId",       source = "user.id")
    @Mapping(target = "userPhone",    source = "user.phone")
    @Mapping(target = "userFullName", source = "user.fullName")
    @Mapping(target = "hasUserAccount", expression = "java(factory.getUser() != null)")
    FactoryDto toDto(Factory factory);
}
