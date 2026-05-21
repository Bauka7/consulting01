package next.gen.consulting.mapper.conversation;

import next.gen.consulting.dto.conversation.MessageDto;
import next.gen.consulting.model.ChatMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {

    @Mapping(target = "conversationId", source = "conversation.id")
    @Mapping(target = "senderId",        source = "sender.id")
    @Mapping(target = "senderName",      source = "sender.fullName")
    MessageDto toDto(ChatMessage message);
}
