package dk.dtu.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .servers(List.of(
                new Server()
                    .url("https://backend.bidgallery.publicvm.com")
                    .description("Production Server")
            ))
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
