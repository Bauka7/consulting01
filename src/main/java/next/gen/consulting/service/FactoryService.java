package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.consultant.ConsultantDto;
import next.gen.consulting.dto.factory.CreateFactoryDto;
import next.gen.consulting.dto.factory.FactoryDto;
import next.gen.consulting.dto.factory.UpdateFactoryDto;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.consultant.ConsultantMapper;
import next.gen.consulting.mapper.factory.FactoryMapper;
import next.gen.consulting.model.Factory;
import next.gen.consulting.model.ProductCategory;
import next.gen.consulting.model.RequestStatus;
import next.gen.consulting.repository.ConsultantRepository;
import next.gen.consulting.repository.FactoryRepository;
import next.gen.consulting.repository.ProductCategoryRepository;
import next.gen.consulting.repository.RequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FactoryService {

    private final FactoryRepository factoryRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ConsultantRepository consultantRepository;
    private final RequestRepository requestRepository;
    private final FactoryMapper factoryMapper;
    private final ConsultantMapper consultantMapper;

    public FactoryDto getById(UUID id) {
        return factoryMapper.toDto(findById(id));
    }

    public Page<FactoryDto> getAll(Pageable pageable, UUID categoryId) {
        if (categoryId != null) {
            return factoryRepository.findByCategoriesId(categoryId, pageable)
                    .map(factoryMapper::toDto);
        }
        return factoryRepository.findAll(pageable).map(factoryMapper::toDto);
    }

    public List<FactoryDto> search(String name) {
        String query = name == null ? "" : name.trim();
        if (query.isEmpty()) {
            return factoryRepository.findAll().stream()
                    .map(factoryMapper::toDto)
                    .toList();
        }
        return factoryRepository.findByNameContainingIgnoreCase(query, Pageable.unpaged())
                .getContent().stream()
                .map(factoryMapper::toDto)
                .toList();
    }

    public Page<ConsultantDto> getConsultantsByFactory(UUID factoryId, Pageable pageable) {
        findById(factoryId);
        return consultantRepository.findByFactoryId(factoryId, pageable)
                .map(consultantMapper::toDto);
    }

    @Transactional
    public FactoryDto create(CreateFactoryDto dto) {
        List<ProductCategory> categories = resolveCategories(dto.getCategoryIds());
        Factory factory = Factory.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .imageUrl(dto.getImageUrl())
                .categories(categories)
                .build();
        return factoryMapper.toDto(factoryRepository.save(factory));
    }

    @Transactional
    public FactoryDto update(UUID id, UpdateFactoryDto dto) {
        Factory factory = findById(id);
        if (dto.getName() != null) {
            factory.setName(dto.getName().trim());
        }
        if (dto.getDescription() != null) {
            factory.setDescription(dto.getDescription());
        }
        if (dto.getLocation() != null) {
            factory.setLocation(dto.getLocation());
        }
        if (dto.getImageUrl() != null) {
            factory.setImageUrl(dto.getImageUrl());
        }
        if (dto.getCategoryIds() != null) {
            factory.setCategories(resolveCategories(dto.getCategoryIds()));
        }
        return factoryMapper.toDto(factoryRepository.save(factory));
    }

    @Transactional
    public void delete(UUID id) {
        Factory factory = findById(id);
        List<RequestStatus> activeStatuses = List.of(RequestStatus.PENDING, RequestStatus.PROGRESS);
        if (requestRepository.existsByFactoryIdAndStatusIn(factory.getId(), activeStatuses)) {
            throw new BadRequestException(
                    "Cannot delete factory with active requests. Close or reassign them first.");
        }
        // Unassign consultants from this factory before deletion
        consultantRepository.findByFactoryId(factory.getId())
                .forEach(c -> c.setFactory(null));
        factoryRepository.delete(factory);
    }

    private List<ProductCategory> resolveCategories(List<UUID> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<ProductCategory> categories = categoryRepository.findAllById(categoryIds);
        if (categories.size() != categoryIds.size()) {
            throw new BadRequestException("One or more category IDs are invalid");
        }
        return categories;
    }

    private Factory findById(UUID id) {
        return factoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factory", "id", id));
    }
}
