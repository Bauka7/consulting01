package next.gen.consulting.mapper.request;

import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.model.Request;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RequestMapper {

    @Mapping(target = "clientId",     source = "client.id")
    @Mapping(target = "consultantId", source = "consultant.id")
    @Mapping(target = "factoryId",    source = "factory.id")
    @Mapping(target = "factoryName",  source = "factory.name")
    RequestDto toDto(Request request);
}
