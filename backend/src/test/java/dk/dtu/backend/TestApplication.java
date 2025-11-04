package dk.dtu.backend;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.security.servlet.ManagementWebSecurityAutoConfiguration;

@SpringBootApplication(
        exclude = { 
            SecurityAutoConfiguration.class,
            ManagementWebSecurityAutoConfiguration.class 
        }
)
public class TestApplication {
    // Empty class; only used for testing context
}
