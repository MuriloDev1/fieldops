package com.fieldops.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserResponseDTO user;

    public String getToken() {
        return token != null ? token : accessToken;
    }
}
