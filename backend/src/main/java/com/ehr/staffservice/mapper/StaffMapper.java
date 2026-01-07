package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import com.ehr.staffservice.dto.StaffDto;
import com.ehr.staffservice.dto.DoctorDto;
import com.ehr.staffservice.entity.Staff;

@Mapper(componentModel = "spring")
public interface StaffMapper {
    @Mapping(target = "isDoctor", expression = "java(entity.getDoctor() != null)")
    @Mapping(target = "doctorCode", expression = "java(entity.getDoctor() != null ? entity.getDoctor().getDoctorCode() : null)")
    StaffDto toDto(Staff entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    Staff toEntity(StaffDto dto);
    
    @Mapping(target = "staffId", ignore = true) // Don't update the ID
    @Mapping(target = "staffCode", ignore = true) // Don't update the code (auto-generated)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    void updateEntityFromDto(StaffDto dto, @MappingTarget Staff entity);
    
    // Map shared fields from DoctorDto to Staff entity (for create doctor)
    // Maps: firstName, lastName, gender, dateOfBirth, phoneNumber, email, 
    //       departmentId, jobId, employmentType, joiningDate, status, staffCode, photoUrl
    @Mapping(target = "staffId", source = "staffId")
    @Mapping(target = "staffCode", source = "staffCode")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "gender", source = "gender")
    @Mapping(target = "dateOfBirth", source = "dateOfBirth")
    @Mapping(target = "phoneNumber", source = "phoneNumber")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "departmentId", source = "departmentId")
    @Mapping(target = "jobId", source = "jobId")
    @Mapping(target = "employmentType", source = "employmentType")
    @Mapping(target = "joiningDate", source = "joiningDate")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "photoUrl", source = "photoUrl")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    Staff toEntityFromDoctorDto(DoctorDto dto);
    
    // Update Staff entity from DoctorDto (for update doctor)
    // Updates: firstName, lastName, gender, dateOfBirth, phoneNumber, email, 
    //          departmentId, jobId, employmentType, joiningDate, status, staffCode, photoUrl
    @Mapping(target = "staffCode", source = "staffCode")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "gender", source = "gender")
    @Mapping(target = "dateOfBirth", source = "dateOfBirth")
    @Mapping(target = "phoneNumber", source = "phoneNumber")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "departmentId", source = "departmentId")
    @Mapping(target = "jobId", source = "jobId")
    @Mapping(target = "employmentType", source = "employmentType")
    @Mapping(target = "joiningDate", source = "joiningDate")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "photoUrl", source = "photoUrl")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    void updateEntityFromDoctorDto(DoctorDto dto, @MappingTarget Staff entity);
}
