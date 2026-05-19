package next.gen.consulting.service;

import lombok.RequiredArgsConstructor;
import next.gen.consulting.dto.category.CreateProductCategoryDto;
import next.gen.consulting.dto.category.ProductCategoryDto;
import next.gen.consulting.dto.category.UpdateProductCategoryDto;
import next.gen.consulting.exception.BadRequestException;
import next.gen.consulting.exception.ResourceNotFoundException;
import next.gen.consulting.mapper.category.ProductCategoryMapper;
import next.gen.consulting.model.ProductCategory;
import next.gen.consulting.repository.ProductCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductCategoryService {

    private final ProductCategoryRepository categoryRepository;
    private final ProductCategoryMapper categoryMapper;

    public List<ProductCategoryDto> getAll() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toDto)
                .toList();
    }

    public ProductCategoryDto getById(UUID id) {
        return categoryMapper.toDto(findById(id));
    }

    @Transactional
    public ProductCategoryDto create(CreateProductCategoryDto dto) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Category with name '" + dto.getName() + "' already exists");
        }
        ProductCategory category = ProductCategory.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .iconUrl(dto.getIconUrl())
                .build();
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Transactional
    public ProductCategoryDto update(UUID id, UpdateProductCategoryDto dto) {
        ProductCategory category = findById(id);
        if (dto.getName() != null) {
            String trimmed = dto.getName().trim();
            categoryRepository.findByNameIgnoreCase(trimmed)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new BadRequestException("Category with name '" + trimmed + "' already exists");
                    });
            category.setName(trimmed);
        }
        if (dto.getDescription() != null) {
            category.setDescription(dto.getDescription());
        }
        if (dto.getIconUrl() != null) {
            category.setIconUrl(dto.getIconUrl());
        }
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Transactional
    public void delete(UUID id) {
        categoryRepository.delete(findById(id));
    }

    private ProductCategory findById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", "id", id));
    }
}
