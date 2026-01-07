package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import com.ehr.staffservice.dto.DoctorDto;
import com.ehr.staffservice.entity.Doctor;

@Mapper(componentModel = "spring", uses = {
    DoctorEducationMapper.class, 
    DoctorCertificationMapper.class, 
    DoctorLicenseMapper.class, 
    DoctorAvailabilityMapper.class, 
    StaffMapper.class
})
public interface DoctorMapper {
    
    // Doctor → DoctorDto: Flatten Staff fields into DoctorDto
    // Maps staff fields: staffId, staffCode, firstName, lastName, gender, dateOfBirth,
    //                    phoneNumber, email, departmentId, jobId, employmentType, 
    //                    joiningDate, status, photoUrl
    @Mapping(target = "staffId", source = "staffId")
    @Mapping(target = "staffCode", source = "staff.staffCode")
    @Mapping(target = "firstName", source = "staff.firstName")
    @Mapping(target = "lastName", source = "staff.lastName")
    @Mapping(target = "gender", source = "staff.gender")
    @Mapping(target = "dateOfBirth", source = "staff.dateOfBirth")
    @Mapping(target = "phoneNumber", source = "staff.phoneNumber")
    @Mapping(target = "email", source = "staff.email")
    @Mapping(target = "departmentId", source = "staff.departmentId")
    @Mapping(target = "jobId", source = "staff.jobId")
    @Mapping(target = "employmentType", source = "staff.employmentType")
    @Mapping(target = "joiningDate", source = "staff.joiningDate")
    @Mapping(target = "status", source = "staff.status")
    @Mapping(target = "photoUrl", source = "staff.photoUrl")
    // Doctor-specific fields are auto-mapped
    // Child entities (educations, certifications, availabilities, licenses) are mapped via uses
    DoctorDto toDto(Doctor entity);
    
    // DoctorDto → Doctor: Only map doctor-specific fields (staff is set in service)
    @Mapping(target = "staff", ignore = true)
    @Mapping(target = "staffId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "educations", ignore = true)  // Handled in service
    @Mapping(target = "certifications", ignore = true)  // Handled in service
    @Mapping(target = "availabilities", ignore = true)  // Handled in service
    @Mapping(target = "licenses", ignore = true)  // Handled in service
    Doctor toEntity(DoctorDto dto);
    
    // Update Doctor entity from DoctorDto: Only update doctor-specific fields
    @Mapping(target = "staff", ignore = true)
    @Mapping(target = "staffId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "educations", ignore = true)  // Handled in service
    @Mapping(target = "certifications", ignore = true)  // Handled in service
    @Mapping(target = "availabilities", ignore = true)  // Handled in service
    @Mapping(target = "licenses", ignore = true)  // Handled in service
    void updateEntityFromDto(DoctorDto dto, @MappingTarget Doctor entity);
}

