package next.gen.consulting.service.request;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import next.gen.consulting.dto.achievement.CreateAchievementDto;
import next.gen.consulting.dto.request.RequestDto;
import next.gen.consulting.model.Consultant;
import next.gen.consulting.model.RequestStatus;
import next.gen.consulting.repository.ConsultantRepository;
import next.gen.consulting.service.AchievementService;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE - 1)
@Slf4j
public class RequestAchievementHandler extends AbstractRequestActionHandler {

    private final AchievementService achievementService;
    private final ConsultantRepository consultantRepository;

    @Override
    protected void doHandle(RequestActionContext context) {
        if (context.getActionType() != RequestActionType.STATUS_CHANGED) return;

        RequestDto request = context.getRequest();
        if (request == null || request.getStatus() != RequestStatus.COMPLETED) return;
        if (request.getConsultantId() == null) return;

        Optional<Consultant> consultantOpt = consultantRepository.findById(request.getConsultantId());
        if (consultantOpt.isEmpty()) return;

        Consultant consultant = consultantOpt.get();
        try {
            CreateAchievementDto dto = new CreateAchievementDto();
            dto.setUserId(consultant.getUser().getId());
            dto.setDescription("Successfully completed request: \"" + request.getProduct() + "\"");
            achievementService.create(dto);
        } catch (Exception ex) {
            log.error("Failed to create achievement for consultant {}: {}", consultant.getId(), ex.getMessage(), ex);
        }
    }
}
