package next.gen.consulting.mapper.notification;

import next.gen.consulting.dto.notification.NotificationDto;
import next.gen.consulting.model.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NotificationMapper {
    
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "requestId", source = "requestId")
    NotificationDto toDto(Notification notification);
}
