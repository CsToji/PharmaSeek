package repositories;

import entities.Roles;
import entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

    @Query("select distinct u from User u join u.roles r where r.code = :roleCode")
    List<User> findByRoleCode(@Param("roleCode") String roleCode);

    default List<User> findByRole(Roles role) {
        return findByRoleCode(role.name());
    }
}
