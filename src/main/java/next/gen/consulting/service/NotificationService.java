package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.notification.NotificationDto;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.notification.NotificationMapper;
import next.gen.consulting.model.Notification;
import next.gen.consulting.model.User;
import next.gen.consulting.repository.NotificationRepository;
import next.gen.consulting.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    public NotificationDto getById(UUID id) {
        Notification notification = findById(id);
        return notificationMapper.toDto(notification);
    }

    public Page<NotificationDto> getByUserId(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable)
                .map(notificationMapper::toDto);
    }

    public Page<NotificationDto> getUnreadByUserId(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsRead(userId, false, pageable)
                .map(notificationMapper::toDto);
    }

    @Transactional
    public NotificationDto createNotification(UUID userId, String message) {
        return createNotification(userId, message, null);
    }

    @Transactional
    public NotificationDto createNotification(UUID userId, String message, UUID requestId) {
        return create(NotificationDto.builder()
                .userId(userId)
                .message(message)
                .requestId(requestId)
                .isRead(false)
                .build());
    }

    @Transactional
    public NotificationDto create(NotificationDto notificationDto) {
        User user = userRepository.findById(notificationDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", notificationDto.getUserId()));

        Notification notification = Notification.builder()
                .user(user)
                .message(notificationDto.getMessage())
                .requestId(notificationDto.getRequestId())
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        return notificationMapper.toDto(savedNotification);
    }

    @Transactional
    public NotificationDto markAsRead(UUID id) {
        Notification notification = findById(id);
        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return notificationMapper.toDto(updatedNotification);
    }

    @Transactional
    public NotificationDto update(UUID id, NotificationDto notificationDto) {
        Notification notification = findById(id);

        if (notificationDto.getMessage() != null) {
            notification.setMessage(notificationDto.getMessage());
        }
        if (notificationDto.getIsRead() != null) {
            notification.setIsRead(notificationDto.getIsRead());
        }

        Notification updatedNotification = notificationRepository.save(notification);
        return notificationMapper.toDto(updatedNotification);
    }

    @Transactional
    public void delete(UUID id) {
        Notification notification = findById(id);
        notificationRepository.delete(notification);
    }

    @Transactional
    public void deleteAllByUserId(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        notificationRepository.deleteAll(notifications);
    }

    private Notification findById(UUID id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
    }
}
