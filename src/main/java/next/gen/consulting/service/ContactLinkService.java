package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.contactLink.ContactLinkDto;
import next.gen.consulting.dto.contactLink.CreateContactLinkDto;
import next.gen.consulting.dto.contactLink.UpdateContactLinkDto;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.contactLink.ContactLinkMapper;
import next.gen.consulting.model.Consultant;
import next.gen.consulting.model.ContactLink;
import next.gen.consulting.repository.ConsultantRepository;
import next.gen.consulting.repository.ContactLinkRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactLinkService {

    private final ContactLinkRepository contactLinkRepository;
    private final ConsultantRepository consultantRepository;
    private final ContactLinkMapper contactLinkMapper;

    public ContactLinkDto getById(UUID id) {
        ContactLink contactLink = findById(id);
        return contactLinkMapper.toDto(contactLink);
    }

    public List<ContactLinkDto> getByConsultantId(UUID consultantId) {
        return contactLinkRepository.findByUserId(consultantId).stream()
                .map(contactLinkMapper::toDto)
                .toList();
    }

    public Page<ContactLinkDto> getAll(Pageable pageable) {
        return contactLinkRepository.findAll(pageable)
                .map(contactLinkMapper::toDto);
    }

    @Transactional
    public ContactLinkDto create(UUID id, CreateContactLinkDto contactLinkDto) {
        Consultant consultant = consultantRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultant", "id", id));

        ContactLink contactLink = ContactLink.builder()
                .consultant(consultant)
                .serviceName(contactLinkDto.getServiceName())
                .link(contactLinkDto.getLink())
                .build();

        ContactLink savedContactLink = contactLinkRepository.save(contactLink);
        return contactLinkMapper.toDto(savedContactLink);
    }

    @Transactional
    public ContactLinkDto update(UUID id, UpdateContactLinkDto contactLinkDto, UUID actorId, boolean isAdmin) {
        ContactLink contactLink = findById(id);
        if (!isAdmin && !contactLink.getConsultant().getUser().getId().equals(actorId)) {
            throw new BadRequestException("You can only update your own contact links");
        }

        if (contactLinkDto.getServiceName() != null) {
            contactLink.setServiceName(contactLinkDto.getServiceName());
        }
        if (contactLinkDto.getLink() != null) {
            contactLink.setLink(contactLinkDto.getLink());
        }

        ContactLink updatedContactLink = contactLinkRepository.save(contactLink);
        return contactLinkMapper.toDto(updatedContactLink);
    }

    @Transactional
    public void delete(UUID id, UUID actorId, boolean isAdmin) {
        ContactLink contactLink = findById(id);
        if (!isAdmin && !contactLink.getConsultant().getUser().getId().equals(actorId)) {
            throw new BadRequestException("You can only delete your own contact links");
        }
        contactLinkRepository.delete(contactLink);
    }

    private ContactLink findById(UUID id) {
        return contactLinkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ContactLink", "id", id));
    }
}
