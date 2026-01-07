package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    
    Optional<RolePermission> findByRoleIdAndPermissionId(Long roleId, Long permissionId);
    
    List<RolePermission> findByRoleId(Long roleId);
    
    @Modifying
    @Query("DELETE FROM RolePermission rp WHERE rp.roleId = :roleId AND rp.permissionId = :permissionId")
    void deleteByRoleIdAndPermissionId(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);
    
    boolean existsByRoleIdAndPermissionId(Long roleId, Long permissionId);
}

