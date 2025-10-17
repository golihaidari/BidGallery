package dk.dtu.backend.security;

import java.lang.annotation.*;

import dk.dtu.backend.persistence.entity.AccountType;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface RoleProtected {
    AccountType[] roles() default {};  // Allowed roles
}
