package com.ehr.staffservice.mapper.scheduling;

import com.ehr.staffservice.dto.scheduling.ProviderDto;
import com.ehr.staffservice.entity.scheduling.Provider;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProviderMapper {
    ProviderDto toDto(Provider provider);
    Provider toEntity(ProviderDto dto);
}

