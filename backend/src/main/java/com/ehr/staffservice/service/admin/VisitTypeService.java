package com.ehr.staffservice.service.admin;

import com.ehr.staffservice.dto.admin.VisitTypeDto;
import java.util.List;

public interface VisitTypeService {
    List<VisitTypeDto> getAllVisitTypes();
    List<VisitTypeDto> getActiveVisitTypes();
    VisitTypeDto getVisitTypeById(Long id);
    VisitTypeDto createVisitType(VisitTypeDto dto);
}

