package next.gen.consulting.mapper.consultant;

import next.gen.consulting.dto.consultant.ConsultantDto;
import next.gen.consulting.model.Consultant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ConsultantMapper {
    
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "fullName", source = "user.fullName")
    ConsultantDto toDto(Consultant consultant);
}
