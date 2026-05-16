package next.gen.consulting.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import next.gen.consulting.model.UserRole;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(
            regexp = "^\\+?[0-9][0-9\\s\\-]{6,18}[0-9]$",
            message = "Enter a valid phone number"
    )
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%.*?&])[A-Za-z\\d@$!%.*?&]{6,20}$",
            message = "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
    )
    private String password;

    private UserRole role;
}
