package dk.dtu.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("BidGallery API")
                .version("1.0")
                .description("API documentation for BidGallery backend")
                .contact(new Contact()
                    .name("Goli Haidari")
                    .email("s193730@dtu.dk")
                )
            );
    }
}
