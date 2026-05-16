package next.gen.consulting.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @Schema(description = "User full name", example = "Ivan Ivanov")
    private String fullName;

    @Schema(description = "Email address", example = "ivan@example.com")
    private String email;

    @Schema(description = "Phone number", example = "+77011234567")
    private String phone;

    @Schema(description = "Avatar URL", example = "https://example.com/avatar.png")
    private String avatarUrl;
}
